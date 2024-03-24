require('dotenv').config()
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Loads all JSON files from a directory and merges them into a single array.
const loadAndMergeJsonFiles = async (directory: string): Promise<Slide[]> => {
  const files: string[] = await fs.promises.readdir(directory);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const arrays = await Promise.all(jsonFiles.map(file =>
    fs.promises.readFile(path.join(directory, file), 'utf8').then((data: string) => JSON.parse(data))
  ));
  return arrays.flat();
};

// Fetch data from Vimeo API by video ID using Vimeo JS SDK
const getVimeoVideoInfo = async (videoId?: string): Promise<VimeoVideoDetails | null> => {
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


// Updates the JSON object with image dimensions and aspect ratio.
const updateImageDetails = async (item: UnprocessedSlide): Promise<Slide> => {
  const metadata = await sharp(`./public${item.src}`).metadata();
  const [line1, ...rest] = item.line1.split(',');

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions for ${item.src}`);
  }

  const videoInfo = await getVimeoVideoInfo(item.videoId);

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
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.width / metadata.height,
  };
};


// Processes the images and updates a single JSON file.
const processImagesAndCreateJson = async (directory: string, outputFilePath: string) => {
  const items = await loadAndMergeJsonFiles(directory);
  const updatedItems = await Promise.all(items.map(updateImageDetails));
  await fs.promises.writeFile(outputFilePath, JSON.stringify(updatedItems, null, 2), 'utf8');
};

// Example usage
const directory = './content/slides';
const outputFilePath = './shared/carousel.json';
processImagesAndCreateJson(directory, outputFilePath).then(() => {
  console.log('Created carousel.json with merged content and updated image dimensions and aspect ratios.');
}).catch(console.error);