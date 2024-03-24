import { getImageProps } from "next/image";
import { ForwardedRef, RefObject, forwardRef, useEffect, useMemo } from "react";

type ImageSlideProps = {
  className: string;
  isLoaded: boolean;
  onClick?: () => void;
  setIsLoaded: (isLoaded: boolean) => void;
  slide: Slide;
}

const ImageSlide = forwardRef(({ className, isLoaded, onClick, setIsLoaded, slide }: ImageSlideProps, ref: ForwardedRef<HTMLImageElement>) => {
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
      try {
        await image.decode();
      } catch (e) {
        console.error(e);
      }

      window.hasPreloaded[src] = true;
      setIsLoaded(true);
    } 
  
    preload();
  }, [imageProps, isLoaded, setIsLoaded, src]);

  if (!isLoaded) {
    return null;
  }

  {/* eslint-disable-next-line jsx-a11y/alt-text */}
  return <img className={className} {...imageProps} onClick={onClick} ref={ref} />
})

ImageSlide.displayName = 'ImageSlide';

export default ImageSlide;