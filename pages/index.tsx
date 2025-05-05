import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.css';
import { FullGestureState, useGesture } from '@use-gesture/react';
import { CYPRESS } from '@/shared/cypress';
import Carousel from '@/components/Carousel/Carousel';
import { getProjects, getSlides } from '@/utils/api';

type HomeProps = {
  activeSlideIndex: number;
  setActiveSlideIndex: (index: number) => void;
  slides: Slide[]
}

const Home = ({ activeSlideIndex, setActiveSlideIndex, slides }: HomeProps ) => {
  const changeSlide = useCallback((direction: number) => {
    const url = new URL(window.location.href);
    let nextSlide = (activeSlideIndex + direction) % slides.length;
    if (nextSlide < 0) {
      nextSlide = slides.length - 1;
    }
    url.pathname = nextSlide.toString();
    setActiveSlideIndex(nextSlide);
    window.history.pushState({}, '', url.href);
  }, [activeSlideIndex, setActiveSlideIndex, slides]);

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

  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  useEffect(() => {
    let timer = window.setTimeout(() => {
      setIsCarouselVisible(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <article className={styles.frame} {...bind()}>
      <h2 className={styles.heading}>Selected Work</h2>
      <ul className={styles.carousel} onClick={handleNext} data-cy={CYPRESS.CAROUSEL}>
        <Carousel activeSlideIndex={activeSlideIndex} isCarouselVisible={isCarouselVisible} slides={slides} />
      </ul>
    </article>
  );
}

export const getStaticProps = async () => {
  const slides = await getSlides(true)
    const projects = await getProjects(true)

  return {
    props: {
      projects,
      slides
    }
  };
};

export default Home;