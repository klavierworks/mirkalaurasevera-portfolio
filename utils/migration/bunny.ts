// bunny/uploadVideoToBunnyCdn.ts
import { readFile, stat } from "node:fs/promises";

const BUNNY_VIDEO_API_BASE_URL = "https://video.bunnycdn.com";
const BUNNY_VIDEO_PLAYBACK_BASE_URL = "https://iframe.mediadelivery.net/embed";

const ENCODING_POLL_INTERVAL_MS = 3000;
const ENCODING_POLL_TIMEOUT_MS = 10 * 60 * 1000;

const STATUS_FINISHED = 4;
const STATUS_ERROR = 5;
const STATUS_UPLOAD_FAILED = 6;

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

type UploadVideoToBunnyCdnParams = {
  filePath: string;
  libraryId: number;
  accessKey: string;
  title?: string;
};

type UploadVideoToBunnyCdnResult = {
  videoId: string;
  playbackUrl: string;
};

type GetVideoInfoResponse = {
  status: number;
  encodeProgress: number;
  storageSize: number;
  length: number;
  width: number;
  height: number;
  transcodingMessages: unknown[];
};

export const buildBunnyVideoPlaybackUrl = ({
  libraryId,
  videoId,
}: {
  libraryId: number;
  videoId: string;
}) => {
  return `${BUNNY_VIDEO_PLAYBACK_BASE_URL}/${libraryId}/${videoId}`;
};

export const isBunnyVideoUrl = ({ url }: { url: string }) => {
  return url.startsWith(`${BUNNY_VIDEO_PLAYBACK_BASE_URL}/`);
};

const buildCreateVideoUrl = ({ libraryId }: { libraryId: number }) => {
  return `${BUNNY_VIDEO_API_BASE_URL}/library/${libraryId}/videos`;
};

const buildVideoUrl = ({
  libraryId,
  videoId,
}: {
  libraryId: number;
  videoId: string;
}) => {
  return `${BUNNY_VIDEO_API_BASE_URL}/library/${libraryId}/videos/${videoId}`;
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
  const response = await fetch(buildCreateVideoUrl({ libraryId }), {
    method: "POST",
    headers: {
      AccessKey: accessKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create Bunny video object. Status: ${response.status}. Body: ${errorBody}`,
    );
  }

  const data = (await response.json()) as { guid?: string };

  if (!data.guid || typeof data.guid !== "string") {
    throw new Error(
      `Bunny did not return a valid guid. Response: ${JSON.stringify(data)}`,
    );
  }

  return data.guid;
};

const uploadVideoBinary = async ({
  libraryId,
  accessKey,
  videoId,
  filePath,
}: {
  libraryId: number;
  accessKey: string;
  videoId: string;
  filePath: string;
}) => {
  const { size } = await stat(filePath);

  if (size === 0) {
    throw new Error(`Refusing to upload empty file: ${filePath}`);
  }

  const fileBuffer = await readFile(filePath);

  const response = await fetch(buildVideoUrl({ libraryId, videoId }), {
    method: "PUT",
    headers: {
      AccessKey: accessKey,
      Accept: "application/json",
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to upload Bunny video binary. Status: ${response.status}. Body: ${errorBody}`,
    );
  }
};

const getVideoInfo = async ({
  libraryId,
  accessKey,
  videoId,
}: {
  libraryId: number;
  accessKey: string;
  videoId: string;
}): Promise<GetVideoInfoResponse> => {
  const response = await fetch(buildVideoUrl({ libraryId, videoId }), {
    headers: {
      AccessKey: accessKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to get Bunny video info. Status: ${response.status}. Body: ${errorBody}`,
    );
  }

  return response.json() as Promise<GetVideoInfoResponse>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForEncoding = async ({
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

  while (Date.now() - startedAt < ENCODING_POLL_TIMEOUT_MS) {
    const info = await getVideoInfo({ libraryId, accessKey, videoId });

    if (info.status !== lastStatus || info.encodeProgress !== lastProgress) {
      const label = STATUS_LABELS[info.status] ?? `Unknown(${info.status})`;
      console.log(
        `  Bunny ${videoId}: status=${info.status} (${label}), encodeProgress=${info.encodeProgress}%`,
      );
      lastStatus = info.status;
      lastProgress = info.encodeProgress;
    }

    if (info.status === STATUS_FINISHED) {
      return info;
    }

    if (info.status === STATUS_ERROR || info.status === STATUS_UPLOAD_FAILED) {
      const label = STATUS_LABELS[info.status] ?? `Unknown(${info.status})`;
      throw new Error(
        `Bunny encoding failed with status ${info.status} (${label}). transcodingMessages=${JSON.stringify(info.transcodingMessages)}`,
      );
    }

    await sleep(ENCODING_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Timed out after ${ENCODING_POLL_TIMEOUT_MS}ms waiting for Bunny encoding of ${videoId}.`,
  );
};

export const uploadVideoToBunnyCdn = async ({
  filePath,
  libraryId,
  accessKey,
  title,
}: UploadVideoToBunnyCdnParams): Promise<UploadVideoToBunnyCdnResult> => {
  const resolvedTitle = title ?? filePath;

  const guid = await createVideoObject({
    libraryId,
    accessKey,
    title: resolvedTitle,
  });

  await uploadVideoBinary({
    libraryId,
    accessKey,
    videoId: guid,
    filePath,
  });

  await waitForEncoding({
    libraryId,
    accessKey,
    videoId: guid,
  });

  return {
    videoId: guid,
    playbackUrl: buildBunnyVideoPlaybackUrl({
      libraryId,
      videoId: guid,
    }),
  };
};
