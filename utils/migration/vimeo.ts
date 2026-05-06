// vimeo/getLargestDirectVideoFileUrl.ts

type VimeoDownloadItem = {
  link?: string;
  quality?: string;
  rendition?: string;
  width?: number;
  height?: number;
  size?: number;
  fps?: number;
};

type VimeoVideoResponse = {
  download?: VimeoDownloadItem[];
};

type GetLargestDirectVideoFileUrlParams = {
  vimeoUrl: string;
  accessToken: string;
};

const extractVimeoVideoIdentifier = ({ vimeoUrl }: { vimeoUrl: string }) => {
  const { pathname } = new URL(vimeoUrl);
  const pathSegments = pathname.split("/").filter(Boolean);

  let videoId: string | undefined;
  let hash: string | undefined;

  for (let index = 0; index < pathSegments.length; index = index + 1) {
    const segment = pathSegments[index];

    if (!/^\d+$/.test(segment)) {
      continue;
    }

    videoId = segment;
    const nextSegment = pathSegments[index + 1];

    if (nextSegment && !/^\d+$/.test(nextSegment)) {
      hash = nextSegment;
    }
  }

  if (!videoId) {
    throw new Error(`Could not extract a Vimeo video ID from URL: ${vimeoUrl}`);
  }

  return { videoId, hash };
};

const buildVimeoVideoEndpoint = ({
  videoId,
  hash,
}: {
  videoId: string;
  hash?: string;
}) => {
  const searchParams = new URLSearchParams({
    fields: "download.link,download.quality,download.rendition,download.width,download.height,download.size,download.fps",
  });

  const identifier = hash ? `${videoId}:${hash}` : videoId;

  return `https://api.vimeo.com/videos/${identifier}?${searchParams.toString()}`;
};

const fetchVimeoVideo = async ({
  videoId,
  hash,
  accessToken,
}: {
  videoId: string;
  hash?: string;
  accessToken: string;
}): Promise<VimeoVideoResponse> => {
  const endpoint = buildVimeoVideoEndpoint({ videoId, hash });

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Failed to fetch Vimeo video ${videoId}. Status: ${response.status}. Body: ${errorBody}`,
    );
  }

  return response.json() as Promise<VimeoVideoResponse>;
};

const isDownloadItemUsable = ({ item }: { item: VimeoDownloadItem }) => {
  if (!item.link) {
    return false;
  }

  return true;
};

const getPixelCount = ({ item }: { item: VimeoDownloadItem }) => {
  const width = item.width ?? 0;
  const height = item.height ?? 0;

  return width * height;
};

const getSortScore = ({ item }: { item: VimeoDownloadItem }) => {
  const isSource = item.quality === "source" || item.rendition === "source";
  const pixelCount = getPixelCount({ item });
  const size = item.size ?? 0;
  const fps = item.fps ?? 0;

  return {
    isSource: isSource ? 1 : 0,
    pixelCount,
    size,
    fps,
  };
};

const compareDownloadItems = ({
  left,
  right,
}: {
  left: VimeoDownloadItem;
  right: VimeoDownloadItem;
}) => {
  const leftScore = getSortScore({ item: left });
  const rightScore = getSortScore({ item: right });

  if (leftScore.isSource !== rightScore.isSource) {
    return rightScore.isSource - leftScore.isSource;
  }

  if (leftScore.pixelCount !== rightScore.pixelCount) {
    return rightScore.pixelCount - leftScore.pixelCount;
  }

  if (leftScore.size !== rightScore.size) {
    return rightScore.size - leftScore.size;
  }

  if (leftScore.fps !== rightScore.fps) {
    return rightScore.fps - leftScore.fps;
  }

  return 0;
};

const selectLargestDirectVideoFile = ({
  downloads,
}: {
  downloads: VimeoDownloadItem[];
}) => {
  const usableDownloads = downloads.filter((item) => {
    return isDownloadItemUsable({ item });
  });

  if (usableDownloads.length === 0) {
    throw new Error("No direct downloadable video files were returned by Vimeo.");
  }

  const sortedDownloads = [...usableDownloads].sort((left, right) => {
    return compareDownloadItems({
      left,
      right,
    });
  });

  const largestDownload = sortedDownloads[0];

  if (!largestDownload?.link) {
    throw new Error("Could not determine the largest direct video file URL.");
  }

  return largestDownload.link;
};

export const getLargestDirectVideoFileUrl = async ({
  vimeoUrl,
  accessToken,
}: GetLargestDirectVideoFileUrlParams) => {
  const { videoId, hash } = extractVimeoVideoIdentifier({ vimeoUrl });

  const { download = [] } = await fetchVimeoVideo({
    videoId,
    hash,
    accessToken,
  });

  return selectLargestDirectVideoFile({
    downloads: download,
  });
};