import { getImageProps } from "next/image";
import { CSSProperties, ForwardedRef, forwardRef, useEffect, useMemo, useState } from "react";

type CustomImageProps = {
  className: string;
  image: ImageObject;
  isLazyLoaded?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

const CustomImage = forwardRef(({ className, isLazyLoaded, image, onClick, style }: CustomImageProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  const { alt, src, width, height, thumbnail } = image;

  const imageProps = useMemo(() => {
    const { props } = getImageProps({
      src,
      width,
      height,
      alt,
      quality: 90,
      sizes: '100vw',
      loading: isLazyLoaded ? 'lazy' : 'eager',
      blurDataURL: thumbnail,
    })
  
    return props
  }, [src, width, height, alt, isLazyLoaded, thumbnail])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.requiresPreload.includes(src)) {
      return;
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


  {/* eslint-disable-next-line jsx-a11y/alt-text */}
  return (
    <img
      alt={alt}
      className={className}
      {...imageProps}
      onClick={onClick}
      ref={ref as ForwardedRef<HTMLImageElement>}
      style={style} />
  )
})

CustomImage.displayName = 'CustomImage';

export default CustomImage;