import { createThumbnail, getImageMetadata } from './media';

// Updates the JSON object with image dimensions and aspect ratio.
export const processUnprocessedProject = async (item: UnprocessedProject): Promise<Project> => {
  const { width, height } = await getImageMetadata(item.thumbnailSrc);

  if (!width || !height) {
    throw new Error(`Could not read image dimensions for ${item.thumbnailSrc}`);
  }

  const thumbnail = await createThumbnail(item.thumbnailSrc, 300, 500);

  return {
    ...item,
    thumbnail: {
      src: thumbnail,
      width,
      height,
      aspectRatio: width / height,
    },
    randomRotation: (Math.random() - 0.5) * 15,
    order: Number(item.order),
  };
};
