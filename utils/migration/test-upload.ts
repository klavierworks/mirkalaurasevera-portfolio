// Standalone test: download one Vimeo video, TUS-upload to Bunny, poll for encoding completion.
// Touches only Bunny. Does NOT update Contentful. Does NOT iterate records.

import crypto from "node:crypto";
import { createReadStream, statSync } from "node:fs";
import { unlink } from "node:fs/promises";

import dotenv from "dotenv";
import * as tus from "tus-js-client";

import { getLargestDirectVideoFileUrl } from "./vimeo";
import { downloadVimeoVideo } from "./videos";

dotenv.config();

const TEST_VIMEO_URL = "https://vimeo.com/1169499793?fl=tl&fe=ec";

const BUNNY_VIDEO_API_BASE_URL = "https://video.bunnycdn.com";
const BUNNY_TUS_ENDPOINT = `${BUNNY_VIDEO_API_BASE_URL}/tusupload`;

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const BUNNY_STATUS_LABELS: Record<number, string> = {
  0: "Created",
  1: "Uploaded",
  2: "Processing",
  3: "Transcoding",
  4: "Finished",
  5: "Error",
  6: "UploadFailed",
  7: "JitSegmenting",
  8: "JitPlaylistsCreated",
};

const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
};

const createVideoObject = async ({
  libraryId,
  accessKey,
  title,
}: {
  libraryId: number;
  accessKey: string;
  title: string;
}) => {
  const response = await fetch(
    `${BUNNY_VIDEO_API_BASE_URL}/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: accessKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create Bunny video object. Status: ${response.status}. Body: ${errorBody}`,
    );
  }

  const data = (await response.json()) as { guid?: string };

  if (!data.guid) {
    throw new Error(`Bunny did not return a guid. Response: ${JSON.stringify(data)}`);
  }

  return data.guid;
};

const buildAuthSignature = ({
  libraryId,
  apiKey,
  expirationTime,
  videoId,
}: {
  libraryId: number;
  apiKey: string;
  expirationTime: number;
  videoId: string;
}) => {
  return crypto
    .createHash("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
    .digest("hex");
};

const tusUploadFile = async ({
  filePath,
  libraryId,
  accessKey,
  videoId,
  title,
}: {
  filePath: string;
  libraryId: number;
  accessKey: string;
  videoId: string;
  title: string;
}) => {
  const { size } = statSync(filePath);
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const signature = buildAuthSignature({
    libraryId,
    apiKey: accessKey,
    expirationTime,
    videoId,
  });

  const fileStream = createReadStream(filePath);

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(fileStream, {
      endpoint: BUNNY_TUS_ENDPOINT,
      uploadSize: size,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expirationTime),
        LibraryId: String(libraryId),
        VideoId: videoId,
      },
      metadata: {
        filetype: "video/mp4",
        title,
      },
      onProgress: (uploaded, total) => {
        const percent = total ? Math.floor((uploaded / total) * 100) : 0;
        process.stdout.write(`\r  TUS upload: ${percent}% (${uploaded}/${total})`);
      },
      onError: (error) => {
        process.stdout.write("\n");
        reject(error);
      },
      onSuccess: () => {
        process.stdout.write("\n");
        resolve();
      },
    });

    upload.start();
  });
};

const getVideoStatus = async ({
  libraryId,
  accessKey,
  videoId,
}: {
  libraryId: number;
  accessKey: string;
  videoId: string;
}) => {
  const response = await fetch(
    `${BUNNY_VIDEO_API_BASE_URL}/library/${libraryId}/videos/${videoId}`,
    {
      headers: {
        AccessKey: accessKey,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to get Bunny video status. Status: ${response.status}. Body: ${errorBody}`,
    );
  }

  return (await response.json()) as {
    status: number;
    encodeProgress: number;
    storageSize: number;
    length: number;
    width: number;
    height: number;
    transcodingMessages: unknown[];
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForBunnyEncoding = async ({
  libraryId,
  accessKey,
  videoId,
}: {
  libraryId: number;
  accessKey: string;
  videoId: string;
}) => {
  const startedAt = Date.now();
  let lastStatus = -1;
  let lastProgress = -1;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const info = await getVideoStatus({ libraryId, accessKey, videoId });

    if (info.status !== lastStatus || info.encodeProgress !== lastProgress) {
      const label = BUNNY_STATUS_LABELS[info.status] ?? `Unknown(${info.status})`;
      console.log(
        `  status=${info.status} (${label}), encodeProgress=${info.encodeProgress}%, storageSize=${info.storageSize}`,
      );
      lastStatus = info.status;
      lastProgress = info.encodeProgress;
    }

    if (info.status === 4) {
      return info;
    }

    if (info.status === 5 || info.status === 6) {
      throw new Error(
        `Bunny reported failure status ${info.status} (${BUNNY_STATUS_LABELS[info.status]}). transcodingMessages=${JSON.stringify(info.transcodingMessages)}`,
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out after ${POLL_TIMEOUT_MS}ms waiting for Bunny encoding.`);
};

const test = async () => {
  const vimeoClientToken = requireEnv("VIMEO_CLIENT_TOKEN");
  const bunnyStreamApiKey = requireEnv("BUNNY_STREAM_API_KEY");
  const bunnyStreamLibraryId = Number(requireEnv("BUNNY_STREAM_LIBRARY_ID"));

  if (!Number.isFinite(bunnyStreamLibraryId)) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID must be a number.");
  }

  console.log(`Test Vimeo URL: ${TEST_VIMEO_URL}`);

  console.log("1) Resolving Vimeo direct download URL...");
  const directFileUrl = await getLargestDirectVideoFileUrl({
    vimeoUrl: TEST_VIMEO_URL,
    accessToken: vimeoClientToken,
  });
  console.log(`   Got: ${directFileUrl.slice(0, 100)}...`);

  const fileName = `tus-test-${Date.now()}.mp4`;

  console.log("2) Downloading to disk...");
  const { filePath } = await downloadVimeoVideo({
    videoUrl: directFileUrl,
    fileName,
  });
  const { size } = statSync(filePath);
  console.log(`   Wrote ${filePath} (${size} bytes)`);

  try {
    console.log("3) Creating Bunny video object...");
    const guid = await createVideoObject({
      libraryId: bunnyStreamLibraryId,
      accessKey: bunnyStreamApiKey,
      title: `tus-test-${Date.now()}`,
    });
    console.log(`   guid=${guid}`);

    console.log("4) TUS-uploading to Bunny...");
    await tusUploadFile({
      filePath,
      libraryId: bunnyStreamLibraryId,
      accessKey: bunnyStreamApiKey,
      videoId: guid,
      title: `tus-test-${Date.now()}`,
    });
    console.log("   TUS upload complete.");

    console.log("5) Polling encoding status...");
    const finalInfo = await waitForBunnyEncoding({
      libraryId: bunnyStreamLibraryId,
      accessKey: bunnyStreamApiKey,
      videoId: guid,
    });

    console.log("");
    console.log("=== SUCCESS ===");
    console.log(`  Bunny video id: ${guid}`);
    console.log(
      `  Embed URL: https://iframe.mediadelivery.net/embed/${bunnyStreamLibraryId}/${guid}`,
    );
    console.log(
      `  ${finalInfo.width}x${finalInfo.height}, ${finalInfo.length}s, ${finalInfo.storageSize} bytes stored`,
    );
  } finally {
    await unlink(filePath).catch(() => {});
  }
};

test().catch((error) => {
  console.error("Test failed:", error);
  process.exitCode = 1;
});
