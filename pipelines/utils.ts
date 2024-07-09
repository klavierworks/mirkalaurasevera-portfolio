import { promises } from "fs";
import { join } from "path";

// Loads all JSON files from a directory and merges them into a single array.
const loadAndMergeJsonFiles = async (directory: string): Promise<Slide[]> => {
  const files: string[] = await promises.readdir(directory);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const arrays = await Promise.all(jsonFiles.map(file =>
    promises.readFile(join(directory, file), 'utf8').then((data: string) => JSON.parse(data))
  ));
  return arrays.flat();
};

export const safelyProcessJsonFilesAndWrite = async (directory: string, outputFilePath: string, processCallback: (item: unknown) => Promise<unknown>) => {
  try {
    const items = await loadAndMergeJsonFiles(directory);
    const updatedItems = await Promise.all(items.map(item => processCallback(item)));
    await promises.writeFile(outputFilePath, JSON.stringify(updatedItems, null, 2), 'utf8');
  } catch (error) {
    console.error('Error processing JSON files:', error);
  }
}