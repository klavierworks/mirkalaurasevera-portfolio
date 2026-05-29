import { readFile, writeFile } from 'fs/promises';
import sharp from 'sharp';
const baseUrl = `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`;

const generatePlaceholder = async (passedUrl: string) => {
  let url = passedUrl;
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  // Check cache first
  const urlHash = Buffer.from(url).toString('base64');
  try {
    const result = await readFile(`./cache/${urlHash}.cache`, 'utf-8');
  if (result && result.startsWith('data:image/')) {
      return result;
    }
  } catch (e) {}
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Now process with Sharp
  const image = await sharp(buffer)
    .resize(5)
    .blur()
    .toBuffer();
  
  const base64 = `data:image/jpeg;base64,${image.toString('base64')}`;

  // Cache to json file
  await writeFile(`./cache/${urlHash}.cache`, base64, 'utf-8');

  return base64;
}

const createImageObject = async (image: any, includes: any[]) => {
  if (!image) {
    return null;
  }
  const imageId = image.sys.id;
  const asset = includes.find((asset: any) => asset.sys.id === imageId);

  if (!asset) {
    console.log('Error: Asset not found for ID:', imageId);
    return null;
  }

  return {
    src: `https:${asset.fields.file.url}`,
    width: asset.fields.file.details.image.width,
    height: asset.fields.file.details.image.height,
    aspectRatio: asset.fields.file.details.image.width / asset.fields.file.details.image.height,
    alt: asset.fields.file.fileName,
    placeholder: await generatePlaceholder(asset.fields.file.url),
  } as ImageObject
}
const BUNNY_CDN_BASE = 'https://vz-6b3f851c-0fe.b-cdn.net';
const BUNNY_PLAYER_BASE = 'https://player.mediadelivery.net/play';

const parseBunnyVideoId = (raw?: string): string | null => {
  if (!raw) {
    return null;
  }

  // iframe.mediadelivery.net/embed/.../<videoId>
  if (raw.includes('iframe.mediadelivery.net')) {
    let id = raw.split('/').pop() ?? '';

    if (id.includes('?')) {
      id = id.split('?')[0];
    }

    return id || null;
  }

  // https://vz-xxxx.b-cdn.net/<videoId>/playlist.m3u8
  if (raw.includes('.b-cdn.net')) {
    const parts = raw.split('/');
    const playlistIndex = parts.findIndex(part => part === 'playlist.m3u8');

    if (playlistIndex > 0) {
      return parts[playlistIndex - 1] || null;
    }
  }

  // raw id fallback
  return raw || null;
};

const inMemoryDimensionsCache: Record<string, { width: number; height: number }> = {};
const getThumbnailDimensions = async (videoId: string) => {
  if (inMemoryDimensionsCache[videoId]) {
    return inMemoryDimensionsCache[videoId];
  }

  const cachePath = `./cache/${videoId}.video.cache`;
  try {
    const cached = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(cached) as { width: number; height: number };
    inMemoryDimensionsCache[videoId] = parsed;
    return parsed;
  } catch (e) {}

  const response = await fetch(`${BUNNY_CDN_BASE}/${videoId}/thumbnail.jpg`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  const dims = { width: metadata.width ?? 0, height: metadata.height ?? 0 };

  await writeFile(cachePath, JSON.stringify(dims), 'utf-8');
  inMemoryDimensionsCache[videoId] = dims;
  return dims;
}

const createVideoObject = async (rawVideoId: string | undefined, hasAudio = false): Promise<VideoObject | undefined> => {
  const videoId = parseBunnyVideoId(rawVideoId);
  if (!videoId) {
    return undefined;
  }

  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const { width, height } = await getThumbnailDimensions(videoId);

  return {
    hasAudio,
    url: `${BUNNY_CDN_BASE}/${videoId}/playlist.m3u8`,
    mp4Url: `${BUNNY_PLAYER_BASE}/${libraryId}/${videoId}`,
    width,
    height,
  };
}

const createMediaObject = async (media: any, images: any[], entries: any[]) => {
  const entry = entries.find((entry: any) => entry.sys.id === media.sys.id);
  
  if (!entry) {
    console.log('Error: Entry not found for ID:', media.sys.id);
    return null;
  }

  let video: VideoObject | null = null;
  try {
    video = await createVideoObject(entry.fields.video, entry.fields.hasAudio ?? false) ?? null;
  } catch (error) {
    console.error('Error creating media object video:', error, entry);
  }
  
  return {
    image: await createImageObject(entry.fields.image, images) ?? null,
    video,
  }
}

export const getAboutPage = async () => {
  const response = await fetch(
    `${baseUrl}/entries?content_type=about`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.log('Error fetching about page:', response.status, response.statusText);
    throw new Error('Failed to fetch about page');
  }

  const data = await response.json();

  const aboutData = data.items[0].fields;
  return {
    bio: formatText(aboutData.bio),
    information: formatText(aboutData.information),
  }
}


export const getSlides = async () => {
  const response = await fetch(
    `${baseUrl}/entries?content_type=slides&include=3&order=fields.order`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.log('Error fetching slides: test', response.status, response.statusText, `${baseUrl}/entries?content_type=slides`);
    throw new Error('Failed to fetch slides');
  }

  const data = await response.json();

  const assets = data.includes['Asset'] ?? [];
  const entries = data.includes['Entry'] ?? [];

  return Promise.all(data.items.map((item: any) => item.fields).map(async (slide: any) => {
    return {
      order: slide.order,
      line1: slide.line1 ?? null,
      line2: slide.line2 ?? null,
      media: await createMediaObject(slide.media, assets, entries),
    } as Slide
  }))
}

export const getProjects = async () => {
  const response = await fetch(
    `${baseUrl}/entries?content_type=projects&include=3&order=fields.order`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.log('Error fetching projects:', response.status, response.statusText);
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();

  const assets = data.includes['Asset'] ?? [];
  const entries = data.includes['Entry'] ?? [];

  return Promise.all(data.items.map((item: any) => item.fields).map(async (project: any, index: number) => {
    return {
      id: data.items[index].sys.id,
      slug: createSlugFromString(project.title),
      title: project.title,
      description: formatText(project.description),
      order: project.order,
      randomRotation: Math.floor(Math.random() * 8),
      thumbnail: await createMediaObject(project.thumbnail, assets, entries),
      media: project.media ? await Promise.all(project.media.map(async (media: any) => createMediaObject(media, assets, entries))) : [],
    } as Project
  }));
}

// @ts-expect-error
const formatText = (paragraphs) => {
  if (!paragraphs) {
    return null;
  }
  // @ts-expect-error
  return paragraphs.content.map(paragraph => {
    return paragraph.content.map((text: any) => {
      if (text.nodeType === 'text') {
        return text.value;
      }
      if (text.nodeType === 'hyperlink') {
        return `<a href="${text.data.uri}" target="_blank" rel="noopener noreferrer">${text.content[0].value}</a>`;
      }
      return text.value;
    }).join('');
  }).join('<br /><br />');
}


const createSlugFromString = (text: string) => {
  // Replace any non-alphanumeric character with a space
  text = text.replace(/[^a-zA-Z0-9\s]/g, ' ');

  // Convert the string to lowercase
  text = text.toLowerCase();

  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, ' ');

  // Trim leading and trailing spaces
  text = text.trim();

  // Replace spaces with hyphens
  text = text.replace(/\s/g, '-');

  // Remove any trailing hyphens
  text = text.replace(/-+$/g, '');

  return text;
}
