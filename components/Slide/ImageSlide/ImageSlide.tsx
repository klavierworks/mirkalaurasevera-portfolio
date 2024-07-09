import { getImageProps } from "next/image";
import { ForwardedRef, RefObject, forwardRef, useEffect, useMemo } from "react";

type ImageSlideProps = {
  className: string;
  onClick?: () => void;
  slide: Slide;
}

const ImageSlide = forwardRef(({ className, onClick, slide }: ImageSlideProps, ref: ForwardedRef<HTMLImageElement>) => {
  const { line1, src, width, height } = slide;

  const imageProps = useMemo(() => {
    const { props } = getImageProps({
      src,
      width,
      height,
      alt: line1,
      quality: 90,
      sizes: '100vw',
      loading: 'eager',
    })
  
    return props
  }, [line1, src, width, height])


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
  return <img className={className} {...imageProps} onClick={onClick} ref={ref} />
})

ImageSlide.displayName = 'ImageSlide';

export default ImageSlide;