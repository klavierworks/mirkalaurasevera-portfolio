// vimeo/downloadVimeoVideo.ts
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";

type DownloadVimeoVideoParams = {
  videoUrl: string;
  outputDir?: string;
  fileName: string;
};

const DEFAULT_OUTPUT_DIR = "./vimeo-videos";

const ensureDirectoryExists = async ({ dir }: { dir: string }) => {
  await mkdir(dir, { recursive: true });
};

const buildFilePath = ({
  dir,
  fileName,
}: {
  dir: string;
  fileName: string;
}) => {
  return `${dir}/${fileName}`;
};

const fetchVideoStream = async ({ videoUrl }: { videoUrl: string }) => {
  const response = await fetch(videoUrl);

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to download video. Status: ${response.status}. Body: ${text}`,
    );
  }

  return response.body;
};

const writeStreamToFile = async ({
  readable,
  filePath,
}: {
  readable: ReadableStream;
  filePath: string;
}) => {
  const nodeStream = createWriteStream(filePath);

  await pipeline(readable as unknown as NodeJS.ReadableStream, nodeStream);
};

export const downloadVimeoVideo = async ({
  videoUrl,
  outputDir = DEFAULT_OUTPUT_DIR,
  fileName,
}: DownloadVimeoVideoParams) => {
  await ensureDirectoryExists({ dir: outputDir });

  const filePath = buildFilePath({
    dir: outputDir,
    fileName,
  });

  const readable = await fetchVideoStream({ videoUrl });

  await writeStreamToFile({
    readable,
    filePath,
  });

  return { filePath };
};
