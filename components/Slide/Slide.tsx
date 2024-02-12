import Image from "next/image"
import styles from './Slide.module.css';
import { CSSProperties, ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import useMaximumScalingFactor from "@/hooks/useMaximumScalingFactor";
import useSlideSpring from "./useSlideSpring";
import { SlideType } from "@/pages";
import useMaximumScale from "./useTargetScale";
import useTargetScale from "./useTargetScale";

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
    || activeSlideIndex === 0 && index === totalSlides - 1;
  
  const [isFocused, setIsFocused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const zIndex = useMemo(() => {  
    if (activeSlideIndex < 4 && index < 4) {
      return index + totalSlides;
    }
    return index;
  }, [activeSlideIndex, index, totalSlides]);

  const rotate = useMemo(() => {
    if (!isLoaded) {
      return 0;
    }
    if (isPreviouslyActive) {
      return 1080;
    }
    if (isActive) {
      return 720;
    }
    return 0;
  }, [isActive, isLoaded, isPreviouslyActive]);

  const targetScale = useTargetScale({
    startSizeRef: imageRef,
    targetSizeRef: spacerRef
  });

  const scale = useMemo(() => {
    if (!isLoaded) {
      return 0;
    }
    if (isPreviouslyActive) {
      return 1;
    }
    if (isActive) {
      return targetScale;
    }
    return 0;
  }, [isActive, isLoaded, isPreviouslyActive,targetScale]);

  const [spring] = useSpring({
    delay: isActive ? 350 : 0,
    zIndex,
    scale,
    rotate,
    immediate: (key: string) => key === 'zIndex',
    onStart: () => {
      setIsFocused(false);
    },
    onRest: () => {
      setIsFocused(isActive);
    },
  }, [index, zIndex, scale, rotate]);

  return (
    <li className={`${styles.slide} ${isFocused ? styles.isFocused : ''}`} style={spring as unknown as CSSProperties}>
      <animated.div className={styles.imageWrapper} style={spring}>
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
      </animated.div>
      <div className={styles.imageSpacer} ref={spacerRef} />
      <p className={styles.title}>{`${name} ${caption ? `– ${caption}` : ''}`}</p>
    </li>
  );
}

export default Slide;