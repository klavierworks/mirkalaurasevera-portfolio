// Standalone diagnostic: download one Vimeo file and check whether its moov
// atom is near the start (fast-start) or the end. Bunny's encoder typically
// requires fast-start MP4s for direct ingest.

import { readFileSync, statSync } from "node:fs";

import dotenv from "dotenv";

import { getLargestDirectVideoFileUrl } from "./vimeo";
import { downloadVimeoVideo } from "./videos";

dotenv.config();

const TEST_VIMEO_URL = "https://vimeo.com/1169499793?fl=tl&fe=ec";

const findAscii = ({
  buffer,
  needle,
}: {
  buffer: Buffer;
  needle: string;
}) => {
  const offsets: number[] = [];
  let cursor = 0;

  while (cursor < buffer.length) {
    const found = buffer.indexOf(needle, cursor, "ascii");
    if (found === -1) break;
    offsets.push(found);
    cursor = found + 1;
  }

  return offsets;
};

const inspect = async () => {
  const vimeoClientToken = process.env.VIMEO_CLIENT_TOKEN!;

  console.log("Resolving Vimeo direct URL...");
  const directFileUrl = await getLargestDirectVideoFileUrl({
    vimeoUrl: TEST_VIMEO_URL,
    accessToken: vimeoClientToken,
  });
  console.log(`Direct URL: ${directFileUrl.slice(0, 100)}...`);

  console.log("Downloading...");
  const fileName = `inspect-${Date.now()}.mp4`;
  const { filePath } = await downloadVimeoVideo({
    videoUrl: directFileUrl,
    fileName,
  });
  const { size } = statSync(filePath);
  console.log(`Wrote ${filePath} (${size} bytes)`);

  const buffer = readFileSync(filePath);

  const ftypOffsets = findAscii({ buffer, needle: "ftyp" });
  const moovOffsets = findAscii({ buffer, needle: "moov" });
  const mdatOffsets = findAscii({ buffer, needle: "mdat" });

  console.log("");
  console.log(`ftyp offsets: ${ftypOffsets.slice(0, 5).join(", ")}`);
  console.log(`moov offsets: ${moovOffsets.slice(0, 5).join(", ")}`);
  console.log(`mdat offsets: ${mdatOffsets.slice(0, 5).join(", ")}`);

  const firstMoov = moovOffsets[0];
  const firstMdat = mdatOffsets[0];

  if (firstMoov === undefined) {
    console.log("WARN: no moov atom found — file is likely truncated or unusual.");
  } else if (firstMdat === undefined) {
    console.log("Only moov found, no mdat. Unusual.");
  } else if (firstMoov < firstMdat) {
    console.log(`OK: moov (offset ${firstMoov}) precedes mdat (offset ${firstMdat}) — fast-start MP4.`);
  } else {
    console.log(
      `ISSUE: mdat (offset ${firstMdat}) precedes moov (offset ${firstMoov}) — NOT fast-start. Bunny may reject this.`,
    );
  }

  console.log("");
  console.log(`Local file kept at: ${filePath}`);
};

inspect().catch((error) => {
  console.error("Inspect failed:", error);
  process.exitCode = 1;
});
