import { MouseEvent, useCallback, useEffect, useRef } from 'react';
import styles from './index.module.css';
import SlideComponent from '../components/Slide/Slide';
import { FullGestureState, useGesture } from '@use-gesture/react';
import { CYPRESS } from '@/shared/cypress';
import slides from '../shared/carousel.json';

type HomeProps = {
  activeSlideIndex: number;
  isCarouselVisible: boolean;
  setActiveSlideIndex: (index: number) => void;
}

const Home = ({ activeSlideIndex, isCarouselVisible, setActiveSlideIndex }: HomeProps ) => {
  const changeSlide = useCallback((direction: number) => {
    const url = new URL(window.location.href);
    let nextSlide = (activeSlideIndex + direction) % slides.length;
    if (nextSlide < 0) {
      nextSlide = slides.length - 1;
    }
    url.pathname = nextSlide.toString();
    setActiveSlideIndex(nextSlide);
    window.history.pushState({}, '', url.href);
  }, [activeSlideIndex, setActiveSlideIndex]);

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

  const totalSlides = slides.length;

  return (
    <article className={styles.frame} {...bind()}>
      <h2 className={styles.heading}>Selected Work</h2>
      <ul className={styles.carousel} onClick={handleNext} data-cy={CYPRESS.CAROUSEL}>
        {slides.map((slide, index) => (
          <SlideComponent
            index={index}
            key={slide.media.image.src}
            slide={slide}
            isActive={activeSlideIndex === index}
            isCarouselVisible={isCarouselVisible}
            isPreviouslyActive={
              activeSlideIndex === index + 2
              || activeSlideIndex === index + 1
              || activeSlideIndex === 0 && index === totalSlides - 2
              || activeSlideIndex === 0 && index === totalSlides - 1
              || activeSlideIndex === 1 && index === totalSlides - 1}
            zIndex={activeSlideIndex < 4 && index < 4 ? index + totalSlides : index}
          />
        ))}
      </ul>
    </article>
  );
}

export default Home;