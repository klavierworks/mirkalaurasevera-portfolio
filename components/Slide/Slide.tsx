import Image from "next/image"
import styles from './Slide.module.css';
import { CSSProperties, ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import useMaximumScalingFactor from "@/hooks/useMaximumScalingFactor";
import useSlideSpring from "./useSlideSpring";
import { SlideType } from "@/pages";
import useMaximumScale from "./useTargetScale";
import useTargetScale from "./useTargetScale";
import classNames from "classnames";

type SlideProps = {
  activeSlideIndex: number;
  index: number;
  slide: SlideType;
  totalSlides: number;
}

const Slide = ({ activeSlideIndex, index, slide, totalSlides }: SlideProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const { name, caption, src, width, height } = slide;

  const isActive = activeSlideIndex === index;
  const isPreviouslyActive =
    activeSlideIndex === index + 2
    || activeSlideIndex === index + 1
    || activeSlideIndex === 0 && index === totalSlides - 2
    || activeSlideIndex === 0 && index === totalSlides - 1
    || activeSlideIndex === 1 && index === totalSlides - 1
  
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const isZIndexLifted = activeSlideIndex < 4 && index < 4;

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
    '--z-index': isZIndexLifted ? index + totalSlides : index,
  } as CSSProperties

  return (
    <li className={slideClassNames} style={style}>
      <Image
        className={styles.image}
        src={`/carousel/${src}`}
        alt={name}
        loading="lazy"
        sizes="100vw"
        quality={90}
        ref={imageRef}
        fill={false}
        width={width}
        onLoad={handleLoad}
        height={height}
      />
      <div className={styles.imageSpacer} ref={spacerRef} />
      <p className={styles.title}>{`${name} ${caption ? `– ${caption}` : ''}`}</p>
    </li>
  );
}

export default Slide;