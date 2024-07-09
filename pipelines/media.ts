import sharp from 'sharp';
import { VimeoVideoDetails } from '../shared/pipelines';

export const getImageMetadata = async (imagePath: string): Promise<sharp.Metadata> => {
  const metadata = await sharp(`./public${imagePath}`).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions for ${imagePath}`);
  }
  return metadata;
}

export const createThumbnail = async (imagePath: string, width: number, height: number) => {
  const buffer = await sharp(`./public${imagePath}`)
    .resize(width, height, {
      fit: 'cover',
      position: sharp.strategy.attention
    })
    .toBuffer();
  return `data:image/png;base64,${buffer.toString('base64')}`;
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
    console.error(`Error fetching Vimeo video info for ${videoId}:`, error);
    throw error;
  }
}
