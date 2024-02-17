import  { getImageProps } from "next/image"
import styles from './Slide.module.css';
import { CSSProperties, ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const { caption, name, src, width, height } = slide;

  const imageProps = useMemo(() => {
 
    const { props } = getImageProps({
      src: `/carousel/${src}`,
      width,
      height,
      alt: name,
      quality: 90,
      sizes: '100vw',
      loading: 'eager',
    })
  
    return props
  }, [src, width, height, name])

  const isActive = activeSlideIndex === index;
  const isPreviouslyActive =
    activeSlideIndex === index + 2
    || activeSlideIndex === index + 1
    || activeSlideIndex === 0 && index === totalSlides - 2
    || activeSlideIndex === 0 && index === totalSlides - 1
    || activeSlideIndex === 1 && index === totalSlides - 1
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded || typeof window === 'undefined') {
      return;
    }
  

    if (window.hasPreloaded[src]) {
      setIsLoaded(true);
      return;
    }


    window.hasPreloaded[src] = false;


    const preload = async () => {
      const image = new Image();
      image.src = imageProps.src;
      image.srcset = imageProps.srcSet as string;
      image.sizes = imageProps.sizes as string;
      image.decoding = 'async';
      await image.decode();
      window.hasPreloaded[src] = true;

      setIsLoaded(true);
    } 
  
    preload();
  }, [imageProps, isLoaded, src]);

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
    '--aspect-ratio': `${width} / ${height}`,
    '--z-index': isZIndexLifted ? index + totalSlides : index,
  } as CSSProperties

  return (
    <li className={slideClassNames} style={style}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {isLoaded && <img className={styles.image} ref={imageRef} {...imageProps} />}
      <div className={styles.imageSpacer} ref={spacerRef} />
      <p className={styles.title}>{`${name} ${caption ? `– ${caption}` : ''}`}</p>
    </li>
  );
}

export default Slide;