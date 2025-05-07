const baseUrl = `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`;

const createImageObject = (image: any, includes: any[]) => {
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
  } as ImageObject
}

const cache: Record<string, VimeoVideoDetails> = {}
const getVimeoMetadata = async (rawVideoId?: string): Promise<VimeoVideoDetails | null> => {
  if (!rawVideoId) {
    return null;
  }

  const videoId = rawVideoId.includes('vimeo') ? rawVideoId.split('/').pop() : rawVideoId;

  if (!videoId) {
    console.log('Error: Invalid Vimeo video ID:', rawVideoId);
    return null;
  }

  if (cache[videoId]) {
    return cache[videoId];
  }

  const url = `https://api.vimeo.com/videos/${videoId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${process.env.VIMEO_CLIENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: VimeoVideoDetails = await response.json();

    cache[videoId] = data;
    return data;
  } catch (error) {
    console.error(`Error fetching Vimeo video info for ${videoId}:`, error);
    throw error;
  }
}

const createVideoObject = async (videoId: string | undefined, hasAudio = false) => {
  if (!videoId) {
    return undefined;
  }

  const videoInfo = await getVimeoMetadata(videoId);
  
  if (!videoInfo) {
    return undefined;
  }
  
  return {
    hasAudio,
    url: videoInfo.play?.hls?.link,
    width: videoInfo.width,
    height: videoInfo.height,
    fallback: videoInfo.pictures?.sizes?.reverse?.()?.[0],
    mp4Url: videoInfo.play?.progressive?.[0]?.link,
  } as VideoObject;
}

const createMediaObject = async (media: any, images: any[], entries: any[]) => {
  const entry = entries.find((entry: any) => entry.sys.id === media.sys.id);
  if (!entry) {
    console.log('Error: Entry not found for ID:', media.sys.id);
    return null;
  }

  return {
    image: createImageObject(entry.fields.image, images) ?? null,
    video: await createVideoObject(entry.fields.video, false) ?? null,
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
