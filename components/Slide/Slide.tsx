import  { getImageProps } from "next/image"
import styles from './Slide.module.css';
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { SlideType } from "@/pages";
import useTargetScale from "./useTargetScale";
import classNames from "classnames";

type SlideProps = {
  activeSlideIndex: number;
  isActive: boolean;
  isPreviouslyActive: boolean;
  slide: SlideType;
  zIndex: number;
}

const Slide = ({ isActive, isPreviouslyActive, slide, zIndex }: SlideProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const { line1, line2, line3, src, width, height } = slide;

  const imageProps = useMemo(() => {
    const { props } = getImageProps({
      src: `/carousel/${src}`,
      width,
      height,
      alt: line1,
      quality: 90,
      sizes: '100vw',
      loading: 'eager',
    })
  
    return props
  }, [line1, src, width, height])

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

  return (
    <li className={slideClassNames} style={style}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {isLoaded && <img className={styles.image} ref={imageRef} {...imageProps} />}
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