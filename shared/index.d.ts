declare global {
  interface Window {
    hasPreloaded: { [key: string]: boolean };
  }
  interface UnprocessedSlide {
    order: number | string;
    line1: string;
    line2: string;
    line3: string;
    src: string;
    videoId?: string;
  }

  type SimpleImageMetaData = {
    src: string;
    width: number;
    height: number;
    aspectRatio: number;
  }

  type Slide = Omit<UnprocessedSlide, 'order'> & SimpleImageMetaData & {
    order: number;
    video?: {
      url: string;
      width: number;
      height: number;
      mp4Url: string;
      fallback?: {
        width: number;
        height: number;
        link: string;
      };
    };
  }

  type UnprocessedProject = {
    order: number | string;
    title: string;
    description: string;
    slug: string;
    images: string[];
    thumbnailSrc: string;
  }

  type Project = Omit<UnprocessedProject, 'order' | 'thumbnailSrc'> & {
    randomRotation: number;
    thumbnail: SimpleImageMetaData;
    order: number;
  }
}


export {
  Slide,
  UnprocessedSlide,
};
