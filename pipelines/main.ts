const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const directoryPath: string = path.join('public', 'carousel');
const outputPath: string = path.join('public', 'carousel.json');

const getImageMetadata = async (filePath: string) => {
  try {
    return await sharp(filePath).metadata();
  } catch (error) {
    console.error(`Error getting metadata for file ${filePath}: `, error);
    throw error; // Rethrow to handle it in the calling function
  }
};

type ImageMetaData = {
  index: string;
  name: string;
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
}

const processImageFile = async (file: string, directoryPath: string): Promise<ImageMetaData | null> => {
  const filePath = path.join(directoryPath, file);
  const metadata = await getImageMetadata(filePath);

  const indexMatch = file.match(/^(\d+)/);
  const nameMatch = file.match(/^\d+_(.+)\.\w+$/);

  if (!indexMatch || !nameMatch || !metadata || !metadata.width || !metadata.height) {
    console.error(`Invalid image file: ${file}`);
    return null;
  }


  const index = indexMatch[1];
  const name = nameMatch[1].replace(/-/g, ' ');
  const { width, height } = metadata;
  const aspectRatio = width / height;

  return {
    index,
    name,
    src: file,
    width,
    height,
    aspectRatio
  };
};


const processFiles = async (): Promise<void> => {
  try {
    const files: string[] = await fs.readdir(directoryPath);
    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png)$/i));

    const imageDataPromises: Promise<ImageMetaData | null>[] = imageFiles.map(file => processImageFile(file, directoryPath));
    const imagesData: ImageMetaData[] = (await Promise.all(imageDataPromises)).filter((data): data is ImageMetaData => data !== null);

    await fs.writeFile(outputPath, JSON.stringify(imagesData, null, 2), 'utf8');
    console.log('Carousel data has been written to JSON file successfully.');
  } catch (err) {
    console.error('Error processing files:', err);
  }
};

processFiles();
