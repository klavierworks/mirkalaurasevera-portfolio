const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

interface CarouselItem {
  order: number;
  line1: string;
  line2: string;
  line3?: string;
  src: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

// Loads all JSON files from a directory and merges them into a single array.
const loadAndMergeJsonFiles = async (directory: string): Promise<CarouselItem[]> => {
  const files: string[] = await fs.promises.readdir(directory);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const arrays = await Promise.all(jsonFiles.map(file =>
    fs.promises.readFile(path.join(directory, file), 'utf8').then((data: string) => JSON.parse(data))
  ));
  return arrays.flat();
};


// Updates the JSON object with image dimensions and aspect ratio.
const updateImageDetails = async (item: CarouselItem): Promise<CarouselItem> => {
  const metadata = await sharp(`./public/carousel/${item.src}`).metadata();
  const [line1, ...rest] = item.line1.split(',');

  return {
    ...item,
    line1,
    line2: rest.join(',').trim(),
    line3: item.line2,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.width && metadata.height ? metadata.width / metadata.height : undefined,
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
const outputFilePath = './carousel.json';
processImagesAndCreateJson(directory, outputFilePath).then(() => {
  console.log('Created carousel.json with merged content and updated image dimensions and aspect ratios.');
}).catch(console.error);