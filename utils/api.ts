const baseUrl = `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`;

export const getImage = async (imageId: string) => {
  const response = await fetch(
    `${baseUrl}/assets/${imageId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.log('Error fetching slides:', response.status, response.statusText);
    throw new Error('Failed to fetch slides');
  }

  const data = await response.json();

  return {
    src: `https:${data.fields.file.url}`,
    width: data.fields.file.details.image.width,
    height: data.fields.file.details.image.height,
    aspectRatio: data.fields.file.details.image.width / data.fields.file.details.image.height,
    alt: data.fields.file.fileName,
  } as Slide['image']
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
    console.log('Error fetching slides:', response.status, response.statusText);
    throw new Error('Failed to fetch slides');
  }

  const data = await response.json();

  const aboutData = data.items[0].fields;
  return {
    bio: formatText(aboutData.bio),
    information: formatText(aboutData.information),
  }
}


export const getSlides = async (includeImages = false) => {
  const response = await fetch(
    `${baseUrl}/entries?content_type=slides`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.log('Error fetching slides:', response.status, response.statusText);
    throw new Error('Failed to fetch slides');
  }

  const data = await response.json();

  const slides = await Promise.all(data.items.map((item: any) => item.fields).map(async (slide: any) => {
    return {
      order: slide.order,
      line1: slide.line1 ?? null,
      line2: slide.line2 ?? null,
      line3: slide.line3 ?? null,
      image: includeImages ? (await getImage(slide.image.sys.id) ?? null) : null,
    } as Slide
  }))

  return slides.sort((a, b) => a.order - b.order);
}

export const getProjects = async (includeImages = false) => {
  const response = await fetch(
    `${baseUrl}/entries?content_type=projects`,
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

  return Promise.all(data.items.map((item: any) => item.fields).map(async (project: any, index: number) => {
    return {
      id: data.items[index].sys.id,
      slug: slugify(project.title),
      title: project.title,
      description: formatText(project.description),
      order: project.order,
      randomRotation: Math.floor(Math.random() * 8),
      thumbnail: includeImages ? {
        image: await getImage(project.thumbnail.sys.id),
      } : null,
      media: includeImages ? await Promise.all(project.media.map(async (media: any) => ({
        image: await getImage(media.sys.id),
      }))) : [],
    } as Project
  }));
}

const formatText = (paragraphs) => {
  return paragraphs.content.map(paragraph => {
    return paragraph.content.map((text: any) => {
      return text.value;
    }).join('');
  }).join('<br /><br />');
}

const slugify = (string: string) => {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
