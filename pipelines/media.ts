import path from 'path';
import sharp from 'sharp';
import { VimeoVideoDetails } from './pipelines';

export const getImageMetadata = async (imagePath: string): Promise<sharp.Metadata> => {
  const metadata = await sharp(`./public${imagePath}`).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions for ${imagePath}`);
  }
  return metadata;
}

// Fetch data from Vimeo API by video ID using Vimeo JS SDK
export const getVimeoMetadata = async (rawVideoId?: string): Promise<VimeoVideoDetails | null> => {
  if (!rawVideoId) {
    return null;
  }

  const videoId = rawVideoId.includes('vimeo') ? rawVideoId.split('/').pop() : rawVideoId;

  const url = `https://api.vimeo.com/videos/${videoId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${process.env.VIMEO_CLIENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: VimeoVideoDetails = await response.json();

    return data;
  } catch (error) {
    console.error(`Error fetching Vimeo video info for ${videoId}:`, error);
    throw error;
  }
}

export const createVideoObject = async (videoId?: string, hasAudio?: boolean) => {
  const videoInfo = await getVimeoMetadata(videoId);

  if (!videoInfo) {
    return undefined;
  }

  return {
    hasAudio,
    url: videoInfo.play?.hls?.link,
    width: videoInfo.width,
    height: videoInfo.height,
    fallback: videoInfo.pictures?.sizes?.reverse?.()?.[0],
    mp4Url: videoInfo.play?.progressive?.[0]?.link,
  } as VideoObject;
}

export const createImageObject = async (src: string, alt?: string) => {
  const { width, height } = await getImageMetadata(src);

  if (!width || !height) {
    throw new Error(`Could not read image dimensions for ${src}`);
  }

  return {
    alt,
    src,
    width,
    height,
    aspectRatio: width / height,
  } as ImageObject;
}

export const createMediaObject = async (imageSrc: string, alt: string, videoId?: string, hasAudio?: boolean): Promise<MediaObject> => {
  const image = await createImageObject(imageSrc, alt);
  const video = await createVideoObject(videoId, hasAudio);

  return {
    image,
    video,
  }
}
