// Standalone test: upload a known-good public MP4 to Bunny via TUS, poll for status.
// If this succeeds, the Vimeo file is the issue. If it fails, it's library/account.

import crypto from "node:crypto";
import { createReadStream, statSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";

import dotenv from "dotenv";
import * as tus from "tus-js-client";

dotenv.config();

const KNOWN_GOOD_MP4_URL =
  "https://download.samplelib.com/mp4/sample-5s.mp4";

const BUNNY_VIDEO_API_BASE_URL = "https://video.bunnycdn.com";
const BUNNY_TUS_ENDPOINT = `${BUNNY_VIDEO_API_BASE_URL}/tusupload`;

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const test = async () => {
  const apiKey = process.env.BUNNY_STREAM_API_KEY!;
  const libraryId = Number(process.env.BUNNY_STREAM_LIBRARY_ID!);

  console.log(`1) Downloading known-good MP4 from ${KNOWN_GOOD_MP4_URL}`);
  const response = await fetch(KNOWN_GOOD_MP4_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sample MP4: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const filePath = `/tmp/bunny-known-good-${Date.now()}.mp4`;
  await writeFile(filePath, buffer);
  const { size } = statSync(filePath);
  console.log(`   Wrote ${filePath} (${size} bytes)`);

  console.log("2) Creating Bunny video object...");
  const createResp = await fetch(
    `${BUNNY_VIDEO_API_BASE_URL}/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: `known-good-${Date.now()}` }),
    },
  );
  const createJson = (await createResp.json()) as { guid?: string };
  const guid = createJson.guid!;
  console.log(`   guid=${guid}`);

  console.log("3) TUS-uploading...");
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const signature = crypto
    .createHash("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${guid}`)
    .digest("hex");

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(createReadStream(filePath), {
      endpoint: BUNNY_TUS_ENDPOINT,
      uploadSize: size,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expirationTime),
        LibraryId: String(libraryId),
        VideoId: guid,
      },
      metadata: {
        filetype: "video/mp4",
        title: `known-good-${Date.now()}`,
      },
      onProgress: (uploaded, total) => {
        const pct = total ? Math.floor((uploaded / total) * 100) : 0;
        process.stdout.write(`\r   ${pct}% (${uploaded}/${total})`);
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
  console.log("   TUS upload complete.");

  console.log("4) Polling status...");
  const startedAt = Date.now();
  let lastStatus = -1;
  let lastProgress = -1;
  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const r = await fetch(
      `${BUNNY_VIDEO_API_BASE_URL}/library/${libraryId}/videos/${guid}`,
      { headers: { AccessKey: apiKey, Accept: "application/json" } },
    );
    const info = (await r.json()) as {
      status: number;
      encodeProgress: number;
      storageSize: number;
      transcodingMessages: unknown[];
    };
    if (info.status !== lastStatus || info.encodeProgress !== lastProgress) {
      console.log(
        `   status=${info.status} (${STATUS_LABELS[info.status] ?? "?"}), encodeProgress=${info.encodeProgress}%, storageSize=${info.storageSize}`,
      );
      lastStatus = info.status;
      lastProgress = info.encodeProgress;
    }
    if (info.status === 4) {
      console.log("\n=== KNOWN-GOOD UPLOAD SUCCEEDED ===");
      console.log(`   Bunny accepted the public MP4. Library is fine.`);
      console.log(`   Embed: https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`);
      await unlink(filePath).catch(() => {});
      return;
    }
    if (info.status === 5 || info.status === 6) {
      console.log(`\n=== KNOWN-GOOD UPLOAD FAILED ===`);
      console.log(`   Bunny rejected even a known-good MP4.`);
      console.log(`   transcodingMessages=${JSON.stringify(info.transcodingMessages)}`);
      await unlink(filePath).catch(() => {});
      process.exitCode = 1;
      return;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  console.log("\n=== TIMED OUT ===");
  await unlink(filePath).catch(() => {});
  process.exitCode = 1;
};

test().catch((e) => {
  console.error("Test failed:", e);
  process.exitCode = 1;
});
