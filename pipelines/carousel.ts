import { getImageMetadata, getVimeoMetadata } from './media';
import { Slide, UnprocessedSlide } from '../shared/index.d';

// Updates the JSON object with image dimensions and aspect ratio.
export const processUnprocessedSlide = async (item: UnprocessedSlide): Promise<Slide> => {
  const { width, height } = await getImageMetadata(item.src);

  if (!width || !height) {
    throw new Error(`Could not read image dimensions for ${item.src}`);
  }

  const [line1, ...rest] = item.line1.split(',');

  const videoInfo = await getVimeoMetadata(item.videoId);

  const video = videoInfo ? {
    url: videoInfo.play?.hls?.link,
    width: videoInfo.width,
    height: videoInfo.height,
    fallback: videoInfo.pictures?.sizes?.reverse?.()?.[0],
    mp4Url: videoInfo.play?.progressive?.[0]?.link,
  } : undefined;

  return {
    src: item.src,
    video,
    order: Number(item.order),
    line1,
    line2: rest.join(',').trim(),
    line3: item.line2,
    width,
    height,
    aspectRatio: width / height,
  };
};
