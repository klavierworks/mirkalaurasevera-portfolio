import styles from './CustomImage.module.css';
import { getImageProps } from "next/image";
import { ForwardedRef, forwardRef, useEffect, useMemo, useState } from "react";

type CustomImageProps = {
  className: string;
  image: ImageObject;
  isLazyLoaded?: boolean;
  onClick?: () => void;
  width?: string | number;
  sizes?: string;
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

const CustomImage = forwardRef(({ className, isLazyLoaded, image, onClick, width, sizes = '100vw' }: CustomImageProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  const { alt, src, placeholder } = image;

  const imageProps = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    let intrinsicWidth = image.width;
    
    if (width) {
      intrinsicWidth = getSize(width);
    }
    
    const { props } = getImageProps({
      src,
      width: intrinsicWidth,
      height: intrinsicWidth * (image.height / image.width),
      alt,
      quality: 85,
      sizes,
      placeholder: isLazyLoaded ? 'blur' : undefined,
      blurDataURL: placeholder,
    });

    return props;
  }, [image.width, image.height, width, src, alt, sizes, isLazyLoaded, placeholder]);

  useEffect(() => {
    if (typeof window === 'undefined' || !imageProps) {
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
      image.src = imageProps.src;
      image.srcset = imageProps.srcSet as string;
      image.sizes = imageProps.sizes as string;
      image.decoding = 'async';
      
      try {
        await image.decode();
      } catch (e) {
        console.error(e);
      }
      
      // Remove src from array
      window.requiresPreload = window.requiresPreload.filter((url: string) => url !== src);
    }
    
    preload();
  }, [imageProps, src]);


  return (
    <img
      className={className}
      {...imageProps}
      loading={isLazyLoaded ? 'lazy' : 'eager'}
      alt={alt}
      onClick={onClick}
      ref={ref as ForwardedRef<HTMLImageElement>}
    />
  )
})

CustomImage.displayName = 'CustomImage';

export default CustomImage;