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
  }


  type Slide = UnprocessedSlide & {
    width: number;
    height: number;
    aspectRatio: number;
  }
}


export { };
