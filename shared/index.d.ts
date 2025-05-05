declare global {
  interface Window {
    requiresPreload: string[];
    hasPreloaded: boolean;
  }

  type ImageObject = {
    alt: string;
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
    thumbnail: string;
  }

  type VideoObject = {
    url: string;
    width: number;
    height: number;
    mp4Url: string;
    hasAudio: boolean;
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

  type Slide = {
    line1: string;
    line2: string;
    line3: string;
    image: ImageObject
  }
  
  type UnprocessedProject = {
    order: number | string;
    title: string;
    description: string;
    media: {
      image: string;
      video: string;
      hasAudio: boolean;
    }[];
    thumbnail: {
      image: string;
      video: string;
    }
  }

  type Project = {
    id: string;
    title: string;
    slug: string;
    description: string;
    randomRotation: number;
    thumbnail: MediaObject;
    media: MediaObject[];
    order: number;
  }
}


export {
  Slide,
  UnprocessedSlide,
};
