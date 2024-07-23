import { createMediaObject, createVideoObject, getImageMetadata, getVimeoMetadata } from './media';
import { Slide, UnprocessedSlide } from '../shared/index.d';

// Updates the JSON object with image dimensions and aspect ratio.
export const processUnprocessedSlide = async (item: UnprocessedSlide): Promise<Slide> => {
  const { width, height } = await getImageMetadata(item.src);

  if (!width || !height) {
    throw new Error(`Could not read image dimensions for ${item.src}`);
  }

  const [line1, ...rest] = item.line1.split(',');


  const video = await createVideoObject(item.videoId);

  return {
    media: await createMediaObject(item.src, item.line1, item.videoId),
    order: Number(item.order),
    line1,
    line2: rest.join(',').trim(),
    line3: item.line2,
  };
};
