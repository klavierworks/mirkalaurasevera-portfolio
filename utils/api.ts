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

// Bunny libraries, test in order. Can't get this info from API for a videoID
const BUNNY_CDN_HOSTS = [
  'https://vz-9406f99f-61c.b-cdn.net',
  'https://vz-6b3f851c-0fe.b-cdn.net',
];

const BUNNY_PLAYER_BASE = 'https://player.mediadelivery.net/play';

interface ParsedBunnyVideo {
  videoId: string;
  cdnBase: string | null;
}

const parseBunnyVideoId = (raw?: string): ParsedBunnyVideo | null => {
  if (!raw) {
    return null;
  }

  // iframe.mediadelivery.net/embed/.../<videoId>
  if (raw.includes('iframe.mediadelivery.net')) {
    let id = raw.split('/').pop() ?? '';

    if (id.includes('?')) {
      id = id.split('?')[0];
    }

    return id ? { videoId: id, cdnBase: null } : null;
  }

  // https://vz-xxxx.b-cdn.net/<videoId>/playlist.m3u8
  if (raw.includes('.b-cdn.net')) {
    const parts = raw.split('/');
    const playlistIndex = parts.findIndex(part => part === 'playlist.m3u8');

    if (playlistIndex > 0) {
      const id = parts[playlistIndex - 1];
      if (!id) {
        return null;
      }

      let cdnBase: string | null = null;
      try {
        cdnBase = new URL(raw).origin;
      } catch (e) {}

      return { videoId: id, cdnBase };
    }
  }

  // raw id fallback
  return raw ? { videoId: raw, cdnBase: null } : null;
};

interface ResolvedThumbnail {
  width: number;
  height: number;
  // The host that actually served the thumbnail — reused for the playlist URL.
  cdnBase: string;
}

const inMemoryDimensionsCache: Record<string, ResolvedThumbnail> = {};
const getThumbnailDimensions = async (videoId: string, candidateBases: string[]): Promise<ResolvedThumbnail> => {
  if (inMemoryDimensionsCache[videoId]) {
    return inMemoryDimensionsCache[videoId];
  }

  const cachePath = `./cache/${videoId}.video.cache`;
  try {
    const cached = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(cached) as Partial<ResolvedThumbnail>;
    // Only trust the cache if it records which host served the thumbnail;
    // older entries without a host get re-probed below.
    if (parsed.cdnBase) {
      const resolved = parsed as ResolvedThumbnail;
      inMemoryDimensionsCache[videoId] = resolved;
      return resolved;
    }
  } catch (e) {}

  for (const cdnBase of candidateBases) {
    try {
      const response = await fetch(`${cdnBase}/${videoId}/thumbnail.jpg`);
      if (!response.ok) {
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(buffer).metadata();
      const dims: ResolvedThumbnail = {
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        cdnBase,
      };

      await writeFile(cachePath, JSON.stringify(dims), 'utf-8');
      inMemoryDimensionsCache[videoId] = dims;
      return dims;
    } catch (e) {
      // Not on this host (404 page, non-image body, etc.) — try the next one.
    }
  }

  throw new Error(`Unable to load Bunny thumbnail for video ${videoId} from: ${candidateBases.join(', ')}`);
}

const createVideoObject = async (rawVideoId: string | undefined, hasAudio = false): Promise<VideoObject | undefined> => {
  const parsed = parseBunnyVideoId(rawVideoId);
  if (!parsed) {
    return undefined;
  }

  const { videoId, cdnBase } = parsed;
  // If the stored URL carried its own host, trust it; otherwise probe the
  // known hosts in order and use whichever serves this video.
  const candidateBases = cdnBase ? [cdnBase] : BUNNY_CDN_HOSTS;

  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const { width, height, cdnBase: resolvedBase } = await getThumbnailDimensions(videoId, candidateBases);

  return {
    hasAudio,
    url: `${resolvedBase}/${videoId}/playlist.m3u8`,
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
