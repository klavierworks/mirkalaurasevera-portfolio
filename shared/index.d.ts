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


  type Slide = UnprocessedSlide & {
    width: number;
    height: number;
    aspectRatio: number;
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
}


export { };
