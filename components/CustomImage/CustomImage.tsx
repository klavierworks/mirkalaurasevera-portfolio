import styles from './CustomImage.module.css';
import { getImageProps } from "next/image";
import { ForwardedRef, forwardRef, useEffect, useMemo, useState } from "react";

type CustomImageProps = {
  className: string;
  image: ImageObject;
  isLazyLoaded?: boolean;
  onClick?: () => void;
  width?: string | number;
  height?: string | number;
}

const getSize = (size: string | number) => {
  if (typeof size === 'number') {
    return size;
  }
  if (typeof window === 'undefined') {
    return parseInt(size, 10);
  }
  if (size.endsWith('vw') || size.endsWith('vh')) {
    const number = size.replace('vw', '').replace('vh', '');
    const vwSize = (window.innerWidth * parseInt(number, 10)) / 100;
    return vwSize;
  }
  return parseInt(size, 10);
}

const CustomImage = forwardRef(({ className, isLazyLoaded, image, onClick, width, height }: CustomImageProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  const { alt, src, thumbnail } = image;
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  
  // Low-res placeholder - works on both server and client
  const placeholderProps = useMemo(() => { 
    const { props } = getImageProps({
      src,
      width: image.width / 100,
      height: image.height / 100,
      alt,
      quality: 5, // Very low quality
      sizes: '10vw', // Small size
      loading: isLazyLoaded ? 'lazy' : 'eager',
      blurDataURL: thumbnail,
    });
    
    return props;
  }, [image.width, image.height, src, alt, isLazyLoaded, thumbnail]);

  // High-quality image - only on client (uses viewport width)
  const highQualityProps = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    let intrinsicWidth = image.width;
    let intrinsicHeight = image.height;
    
    if (width) {
      intrinsicWidth = getSize(width);
    }
    if (height) {
      intrinsicHeight = getSize(height);
    }
    
    const { props } = getImageProps({
      src,
      width: intrinsicWidth,
      height: intrinsicHeight,
      alt,
      quality: 90,
      sizes: '100vw',
      loading: isLazyLoaded ? 'lazy' : 'eager',
      blurDataURL: thumbnail,
    });
    
    return props;
  }, [image.width, image.height, width, height, src, alt, isLazyLoaded, thumbnail]);

  useEffect(() => {
    if (typeof window === 'undefined' || !highQualityProps) {
      return;
    }
    
    if (window.requiresPreload?.includes(src)) {
      return;
    }
    
    if (!window.requiresPreload) {
      window.requiresPreload = [];
    }
    
    window.requiresPreload.push(src);
    
    const preload = async () => {
      const image = new Image();
      image.src = highQualityProps.src;
      image.srcset = highQualityProps.srcSet as string;
      image.sizes = highQualityProps.sizes as string;
      image.decoding = 'async';
      
      try {
        await image.decode();
        setIsHighQualityLoaded(true);
      } catch (e) {
        console.error(e);
      }
      
      // Remove src from array
      window.requiresPreload = window.requiresPreload.filter((url: string) => url !== src);
    }
    
    preload();
  }, [highQualityProps, src]);

  return (
    <div className={`${styles.container} ${className}`} onClick={onClick} style={{ aspectRatio: image.aspectRatio }}>
      <img
        {...placeholderProps}
        alt={alt}
        ref={ref as ForwardedRef<HTMLImageElement>}
        style={placeholderProps.style}
        className={styles.placeholder}
      />
      <img
        {...(highQualityProps || {})}
        alt={alt}
        onClick={onClick}
        ref={ref as ForwardedRef<HTMLImageElement>}
        style={{
          opacity: isHighQualityLoaded ? 1 : 0,
          ...(highQualityProps || {}).style
        }}
        className={styles.highQualityImage}
      />
    </div>
  )
})

CustomImage.displayName = 'CustomImage';

export default CustomImage;