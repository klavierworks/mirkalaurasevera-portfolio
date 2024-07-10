import { getImageProps } from "next/image";
import { CSSProperties, ForwardedRef, forwardRef, useEffect, useMemo } from "react";

type CustomImageProps = {
  className: string;
  image: ImageObject;
  onClick?: () => void;
  style?: CSSProperties;
}

const CustomImage = forwardRef(({ className, image, onClick, style }: CustomImageProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  const { alt, src, width, height } = image;

  const imageProps = useMemo(() => {
    const { props } = getImageProps({
      src,
      width,
      height,
      alt,
      quality: 90,
      sizes: '100vw',
      loading: 'eager',
    })
  
    return props
  }, [alt, src, width, height])


  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.hasPreloaded[src]) {
      return;
    }

    window.hasPreloaded[src] = false;

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

      window.hasPreloaded[src] = true;
    } 
  
    preload();
  }, [imageProps, src]);

  {/* eslint-disable-next-line jsx-a11y/alt-text */}
  return <img className={className} {...imageProps} onClick={onClick} ref={ref as ForwardedRef<HTMLImageElement>} style={style} />
})

CustomImage.displayName = 'CustomImage';

export default CustomImage;