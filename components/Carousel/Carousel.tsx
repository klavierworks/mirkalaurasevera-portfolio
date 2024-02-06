import { Dispatch, MouseEvent, SetStateAction, use, useCallback, useEffect, useState } from 'react';
import styles from './Carousel.module.css';
import useWindowSize from '@/hooks/useWindowSize';
import Slide from '../Slide/Slide';
import { useSpring } from '@react-spring/web';
import { useRouter, useSearchParams } from 'next/navigation';
import { SLIDES, SlideType } from '@/pages';

type CarouselProps = {
  isFocused: boolean;
}

const Carousel = ({ isFocused }: CarouselProps ) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlideIndex = Number(searchParams.get('slide') ?? "0");

  const changeSlide = useCallback((direction: number) => {
    const url = new URL(window.location.href);
      const nextSlide = (activeSlideIndex + direction) % SLIDES.length;
      url.searchParams.set('slide', String(nextSlide));

    router.replace(url.pathname + url.search);
  }, [activeSlideIndex, router]);

  const handleNext = useCallback((event: MouseEvent<HTMLUListElement>) => {
    changeSlide(1);
    event.preventDefault();
  }, [changeSlide]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        changeSlide(1);
      }

      if (event.key === 'ArrowLeft') {
        changeSlide(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeSlide]);
  
  if (!isFocused ) {
    return null;
  }

  return (
    <article className={styles.frame}>
      <h2 className={styles.heading}>Selected Work</h2>
      <ul className={styles.carousel} onClick={handleNext}>
        {SLIDES.map((slide, index) => (
          <Slide
            activeSlideIndex={activeSlideIndex}
            key={slide.src}
            index={index}
            slide={slide}
            />
        ))}
      </ul>
    </article>
  );
}

export default Carousel;