// Self-contained upload test using the existing Vimeo MP4 file.
// Same logic as test-mov-upload.ts, just pointed at the .mp4 instead of .mov.

import crypto from "node:crypto";
import { createReadStream, readFileSync, statSync } from "node:fs";

import dotenv from "dotenv";
import * as tus from "tus-js-client";

dotenv.config();

const FILE_PATH = "./vimeo-videos/inspect-1777606205963.mp4";
const FILE_MIME = "video/mp4";

const BUNNY_API_BASE = "https://video.bunnycdn.com";
const BUNNY_TUS_ENDPOINT = `${BUNNY_API_BASE}/tusupload`;

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

const STATUS_LABELS: Record<number, string> = {
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
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    `${BUNNY_API_BASE}/library/${libraryId}/videos`,
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
    throw new Error(
      `Create failed: ${response.status} ${await response.text()}`,
    );
  }

  const data = (await response.json()) as { guid?: string };
  if (!data.guid) {
    throw new Error(`Create returned no guid: ${JSON.stringify(data)}`);
  }
  return data.guid;
};

const getVideoInfo = async ({
  libraryId,
  accessKey,
  videoId,
}: {
  libraryId: number;
  accessKey: string;
  videoId: string;
}) => {
  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      headers: { AccessKey: accessKey, Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GET video failed: ${response.status} ${await response.text()}`,
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

const pollUntilDone = async ({
  libraryId,
  accessKey,
  videoId,
  label,
}: {
  libraryId: number;
  accessKey: string;
  videoId: string;
  label: string;
}) => {
  const startedAt = Date.now();
  let lastStatus = -1;
  let lastProgress = -1;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const info = await getVideoInfo({ libraryId, accessKey, videoId });

    if (info.status !== lastStatus || info.encodeProgress !== lastProgress) {
      console.log(
        `  [${label}] status=${info.status} (${STATUS_LABELS[info.status] ?? "?"}), encodeProgress=${info.encodeProgress}%, storageSize=${info.storageSize}`,
      );
      lastStatus = info.status;
      lastProgress = info.encodeProgress;
    }

    if (info.status === 4) return { ok: true, info };
    if (info.status === 5 || info.status === 6) return { ok: false, info };

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out after ${POLL_TIMEOUT_MS}ms polling status.`);
};

const tryDirectPut = async ({
  libraryId,
  accessKey,
  filePath,
  fileSize,
}: {
  libraryId: number;
  accessKey: string;
  filePath: string;
  fileSize: number;
}) => {
  console.log("");
  console.log("=== Method 1: Direct PUT ===");

  const guid = await createVideoObject({
    libraryId,
    accessKey,
    title: `direct-put-${Date.now()}`,
  });
  console.log(`  Created video object: ${guid}`);

  const fileBuffer = readFileSync(filePath);
  console.log(`  Uploading ${fileSize} bytes via PUT...`);

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${guid}`,
    {
      method: "PUT",
      headers: {
        AccessKey: accessKey,
        Accept: "application/json",
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(fileBuffer),
    },
  );

  console.log(`  PUT response: ${response.status} ${await response.text()}`);

  if (!response.ok) {
    return { method: "direct-put", guid, ok: false, reason: `PUT ${response.status}` };
  }

  const result = await pollUntilDone({
    libraryId,
    accessKey,
    videoId: guid,
    label: "direct-put",
  });

  return {
    method: "direct-put",
    guid,
    ok: result.ok,
    reason: result.ok
      ? "Finished"
      : `status=${result.info.status} (${STATUS_LABELS[result.info.status] ?? "?"})`,
  };
};

const tryTusUpload = async ({
  libraryId,
  accessKey,
  filePath,
  fileSize,
}: {
  libraryId: number;
  accessKey: string;
  filePath: string;
  fileSize: number;
}) => {
  console.log("");
  console.log("=== Method 2: TUS resumable upload ===");

  const guid = await createVideoObject({
    libraryId,
    accessKey,
    title: `tus-${Date.now()}`,
  });
  console.log(`  Created video object: ${guid}`);

  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const signature = crypto
    .createHash("sha256")
    .update(`${libraryId}${accessKey}${expirationTime}${guid}`)
    .digest("hex");

  console.log(`  TUS-uploading ${fileSize} bytes...`);

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(createReadStream(filePath), {
      endpoint: BUNNY_TUS_ENDPOINT,
      uploadSize: fileSize,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expirationTime),
        LibraryId: String(libraryId),
        VideoId: guid,
      },
      metadata: {
        filetype: FILE_MIME,
        title: `tus-${Date.now()}`,
      },
      onProgress: (uploaded, total) => {
        const pct = total ? Math.floor((uploaded / total) * 100) : 0;
        process.stdout.write(`\r  TUS progress: ${pct}% (${uploaded}/${total})`);
      },
      onError: (e) => {
        process.stdout.write("\n");
        reject(e);
      },
      onSuccess: () => {
        process.stdout.write("\n");
        resolve();
      },
    });
    upload.start();
  });

  console.log("  TUS bytes transmitted.");

  const result = await pollUntilDone({
    libraryId,
    accessKey,
    videoId: guid,
    label: "tus",
  });

  return {
    method: "tus",
    guid,
    ok: result.ok,
    reason: result.ok
      ? "Finished"
      : `status=${result.info.status} (${STATUS_LABELS[result.info.status] ?? "?"})`,
  };
};

const main = async () => {
  const accessKey = requireEnv("BUNNY_STREAM_API_KEY");
  const libraryId = Number(requireEnv("BUNNY_STREAM_LIBRARY_ID"));

  if (!Number.isFinite(libraryId)) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID must be a number.");
  }

  const { size } = statSync(FILE_PATH);
  console.log(`Test file: ${FILE_PATH}`);
  console.log(`Size: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`MIME: ${FILE_MIME}`);
  console.log(`Library: ${libraryId}`);

  const results: { method: string; guid: string; ok: boolean; reason: string }[] = [];

  try {
    results.push(
      await tryDirectPut({
        libraryId,
        accessKey,
        filePath: FILE_PATH,
        fileSize: size,
      }),
    );
  } catch (error) {
    console.log(`  Direct PUT errored: ${(error as Error).message}`);
    results.push({
      method: "direct-put",
      guid: "(none)",
      ok: false,
      reason: `error: ${(error as Error).message}`,
    });
  }

  try {
    results.push(
      await tryTusUpload({
        libraryId,
        accessKey,
        filePath: FILE_PATH,
        fileSize: size,
      }),
    );
  } catch (error) {
    console.log(`  TUS errored: ${(error as Error).message}`);
    results.push({
      method: "tus",
      guid: "(none)",
      ok: false,
      reason: `error: ${(error as Error).message}`,
    });
  }

  console.log("");
  console.log("=== SUMMARY ===");
  for (const r of results) {
    const mark = r.ok ? "PASS" : "FAIL";
    console.log(
      `  [${mark}] ${r.method}: guid=${r.guid}, reason=${r.reason}`,
    );
    if (r.guid !== "(none)") {
      console.log(
        `         Embed URL: https://iframe.mediadelivery.net/embed/${libraryId}/${r.guid}`,
      );
    }
  }
};

main().catch((error) => {
  console.error("Test errored:", error);
  process.exitCode = 1;
});
