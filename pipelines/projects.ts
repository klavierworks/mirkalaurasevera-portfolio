import { createMediaObject, createThumbnailObject } from './media';
import { createSlugFromString } from './utils';

// Updates the JSON object with image dimensions and aspect ratio.
export const processUnprocessedProject = async (item: UnprocessedProject): Promise<Project> => {
  if (!item.thumbnail) {
    throw new Error('Project is missing thumbnail');
  }

  const thumbnail = await createThumbnailObject(item.thumbnail.image, 300, 500);

  return {
    ...item,
    thumbnail,
    media: await Promise.all(
      item.images.map(({ image, video }) => createMediaObject(image, video))
    ),
    slug: createSlugFromString(item.title),
    randomRotation: (Math.random() - 0.5) * 15,
    order: Number(item.order),
  };
};
