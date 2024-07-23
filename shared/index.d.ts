declare global {
  interface Window {
    hasPreloadedImages: { [key: string]: boolean };
  }

  type ImageObject = {
    alt: string;
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
  }

  type VideoObject = {
    url: string;
    width: number;
    height: number;
    mp4Url: string;
    fallback?: {
      width: number;
      height: number;
      link: string;
    };
  }

  type MediaObject = {
    image: ImageObject;
    video?: VideoObject
  }

  interface UnprocessedSlide {
    order: number | string;
    line1: string;
    line2: string;
    line3: string;
    src: string;
    videoId?: string;
  }

  type Slide = {
    order: number;
    media: MediaObject;
    line1: string;
    line2: string;
    line3: string;
  }

  type UnprocessedProject = {
    order: number | string;
    title: string;
    description: string;
    media: {
      image: string;
      video: string;
    }[];
    thumbnail: {
      image: string;
      video: string;
    }
  }

  type Project = Omit<UnprocessedProject, 'order' | 'thumbnail' | 'media'> & {
    randomRotation: number;
    slug: string;
    thumbnail: MediaObject;
    media: MediaObject[];
    order: number;
  }
}


export {
  Slide,
  UnprocessedSlide,
};
