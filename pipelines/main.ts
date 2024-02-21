const fs = require('fs');
const sharp = require('sharp');

interface CarouselItem {
  number: number;
  line1: string;
  line2: string;
  line3?: string;
  src: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

// Reads the JSON file and parses its content.
const readJsonFile = async (filePath: string): Promise<CarouselItem[]> => {
  const data = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(data);
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

// Processes the images and updates the JSON file.
const processImagesAndUpdateJson = async (filePath: string) => {
  const items = await readJsonFile(filePath);
  const updatedItems = await Promise.all(items.map(updateImageDetails));
  await fs.promises.writeFile(filePath, JSON.stringify(updatedItems, null, 2), 'utf8');
};

// Example usage
const filePath = './carousel.json';
processImagesAndUpdateJson(filePath).then(() => {
  console.log('Updated carousel.json with image dimensions and aspect ratios.');
}).catch(console.error);
