import sharp from 'sharp';
import { VimeoVideoDetails } from '../shared/pipelines.d';

export const getImageMetadata = async (imagePath: string): Promise<sharp.Metadata> => {
  const metadata = await sharp(`./public${imagePath}`).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions for ${imagePath}`);
  }
  return metadata;
}

// Fetch data from Vimeo API by video ID using Vimeo JS SDK
export const getVimeoMetadata = async (videoId?: string): Promise<VimeoVideoDetails | null> => {
  if (!videoId) {
    return null;
  }

  const url = `https://api.vimeo.com/videos/${videoId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: VimeoVideoDetails = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Vimeo video info:', error);
    throw error;
  }
}
