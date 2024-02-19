import { MouseEvent, useCallback, useEffect, useRef } from 'react';
import styles from './Carousel.module.css';
import Slide from '../Slide/Slide';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlideType } from '@/pages';
import { FullGestureState, useGesture } from '@use-gesture/react';

type CarouselProps = {
  className: string;
  slides: SlideType[];
}

const Carousel = ({ className, slides }: CarouselProps ) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlideIndex = Number(searchParams.get('slide') ?? "0");

  const changeSlide = useCallback((direction: number) => {
    const url = new URL(window.location.href);
    const nextSlide = (activeSlideIndex + direction) % slides.length;
    url.searchParams.set('slide', String(nextSlide));
    console.log(url.href);
    router.push(url.href);
  }, [activeSlideIndex, router,slides]);

  const handleNext = useCallback((event: MouseEvent<HTMLUListElement>) => {
    changeSlide(1);
    event.preventDefault();
  }, [changeSlide]);

  const hasSwiped = useRef(false);
  const startIndex = useRef(activeSlideIndex);
  const handleGesture = useCallback(({ first, last, movement: [_1, movementY] }: FullGestureState<'drag' | 'wheel'>) => {
    if (first) {
      startIndex.current = activeSlideIndex;
      hasSwiped.current = false;
    }
  
    if (last) {
      hasSwiped.current = false;
      return;
    }
  
    if (hasSwiped.current || Math.abs(movementY) < window.innerHeight / 8 || activeSlideIndex !== startIndex.current) {
      return;
    }

    hasSwiped.current = true;
    changeSlide(Math.sign(movementY));
  }, [activeSlideIndex, changeSlide]);

  const bind = useGesture({
    onDrag: handleGesture,
    onWheel: handleGesture
  })

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

  return (
    <article className={`${styles.frame} ${className}`} {...bind()}>
      <h2 className={styles.heading}>Selected Work</h2>
      <ul className={styles.carousel} onClick={handleNext}>
        {slides.map((slide, index) => (
          <Slide
            activeSlideIndex={activeSlideIndex}
            key={slide.src}
            index={index}
            slide={slide}
            totalSlides={slides.length}
          />
        ))}
      </ul>
    </article>
  );
}

export default Carousel;