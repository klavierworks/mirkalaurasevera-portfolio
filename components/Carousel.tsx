import { use, useCallback, useEffect, useState } from 'react';
import styles from './Carousel.module.css';
import Image from "next/image";
import useWindowSize from '@/hooks/useWindowSize';
import Slide from './Slide/Slide';
import { useSpring } from '@react-spring/web';

export type SlideType = {
  src: string;
  name: string;
  width: number;
  height: number;
}

const SLIDES: SlideType[] = [
  { src: 'MLS_SunsetEgg_01.jpeg', name: 'SunsetEgg', width: 3162, height: 2161 },
  { src: 'MLS_OralOceanNicchi_02.jpg', name: 'Oral Ocean Nicchi', width: 2000, height: 2667 },
  { src: 'MLS_Security_03.jpeg', name: 'Security', width: 1193, height: 1670 },
  { src: 'MLS_UVhorse_05.jpg', name: 'UVhorse', width: 2000, height: 1537 },
  { src: 'MLS_FashionSnowman)06.jpeg', name: 'Fashion Snowman', width: 2100, height: 2678 },
  { src: 'MLS_Worm_07.jpeg', name: 'Worm', width: 1272, height: 1696 },
  { src: 'MLS_SpringFeelings_09.jpg', name: 'Spring Feelings', width: 2500, height: 3218 },
  { src: 'MLS_Cyclist_10.jpg', name: 'Cyclist', width: 2000, height: 2726 },
  { src: 'MLS_Bottle_11.jpg', name: 'Bottle', width: 2000, height: 2646 },
  { src: 'MLS_Cave_13.jpg', name: 'Cave', width: 2500, height: 3062 },
 { src: 'MLS_Cyclist_14.jpeg', name: 'Cyclist', width: 1586, height: 2163 },
]

const Carousel = ({ isFocused }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const changeSlide = useCallback((direction: number) => setActiveSlideIndex(currentIndex => (currentIndex + direction) % SLIDES.length), []);
  
  const handleNext = () => changeSlide(1);

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
  if (!isFocused) {

    return null;
  }
  return (
    <article className={styles.frame}>
      <h2 className={styles.heading}>Selected Work</h2>
      <ul className={styles.carousel} onClick={handleNext}>
        {SLIDES.map((slide, index) => (
          <Slide
            key={slide.src}
            isActive={index === activeSlideIndex}
            slide={slide}
          />
          ))}
      </ul>
    </article>
  );
}

export default Carousel;