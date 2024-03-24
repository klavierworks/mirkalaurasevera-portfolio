import  { getImageProps } from "next/image"
import styles from './Slide.module.css';
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import useTargetScale from "./useTargetScale";
import classNames from "classnames";
import { CYPRESS } from "@/shared/cypress";
import ImageSlide from "./ImageSlide/ImageSlide";
import VideoSlide from "./VideoSlide/VideoSlide";

type SlideProps = {
  index: number;
  isActive: boolean;
  isPreviouslyActive: boolean;
  slide: Slide;
  zIndex: number;
}

const Slide = ({ index, isActive, isPreviouslyActive, slide, zIndex }: SlideProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const { line1, line2, line3, src, width, height } = slide;

  const [isLoaded, setIsLoaded] = useState(false);

  const targetScale = useTargetScale({
    startSizeRef: imageRef,
    targetSizeRef: spacerRef
  });

  const slideClassNames = classNames(styles.slide, {
    [styles.isLoaded]: isLoaded,
    [styles.isPreviouslyActive]: isPreviouslyActive,
    [styles.isActive]: isActive,
  });

  const style = {
    '--target-scale': targetScale,
    '--aspect-ratio': `${width} / ${height}`,
    '--z-index': zIndex,
  } as CSSProperties

  const cyAttribute = useMemo(() => {
    if (isActive) {
      return CYPRESS.SLIDE_ACTIVE;
    }
    if (isPreviouslyActive) {
      return CYPRESS.SLIDE_PREV;
    }
    return CYPRESS.SLIDE;
  }, [isActive, isPreviouslyActive]);

  return (
    <li className={slideClassNames} data-cy={cyAttribute} data-cy-index={index} style={style}>
      {slide.video ? (
        <VideoSlide
          className={styles.media}
          isActive={isActive}
          isLoaded={isLoaded}
          setIsLoaded={setIsLoaded}
          slide={slide}
          ref={imageRef}
          />
      ) : (
        <ImageSlide
          className={styles.media}
          isLoaded={isLoaded}
          setIsLoaded={setIsLoaded}
          slide={slide}
          ref={imageRef}
        />
      )}
      <div className={styles.imageSpacer} ref={spacerRef} />
      <div className={styles.title}>
        <p className={styles.content}>
          {line1 && <>{line1}<br /></>}
          {line2 && <>{line2}<br /></>}
          {line3 && <span className={styles.italics}>{line3}</span>}
        </p>
      </div>
    </li>
  );
}

export default Slide;