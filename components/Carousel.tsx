import { MouseEvent, use, useCallback, useEffect, useState } from 'react';
import styles from './Carousel.module.css';
import Image from "next/image";
import useWindowSize from '@/hooks/useWindowSize';
import Slide from './Slide/Slide';
import { useSpring } from '@react-spring/web';

export type SlideType = {
  caption: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

export const SLIDES: SlideType[] = [
  { src: 'MLS_SunsetEgg_01.jpeg', name: 'SunsetEgg', width: 3162, height: 2161, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_OralOceanNicchi_02.jpg', name: 'Oral Ocean Nicchi', width: 2000, height: 2667, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_Security_03.jpeg', name: 'Security', width: 1193, height: 1670, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_UVhorse_05.jpg', name: 'UVhorse', width: 2000, height: 1537, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_FashionSnowman)06.jpeg', name: 'Fashion Snowman', width: 2100, height: 2678, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_Worm_07.jpeg', name: 'Worm', width: 1272, height: 1696, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_SpringFeelings_09.jpg', name: 'Spring Feelings', width: 2500, height: 3218, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_Cyclist_10.jpg', name: 'Cyclist', width: 2000, height: 2726, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_Bottle_11.jpg', name: 'Bottle', width: 2000, height: 2646, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
  { src: 'MLS_Cave_13.jpg', name: 'Cave', width: 2500, height: 3062, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
 { src: 'MLS_Cyclist_14.jpeg', name: 'Cyclist', width: 1586, height: 2163, caption: "by Adam Ehrlich Sachs for New Yorker Mag (2022)" },
]

type CarouselProps = {
  isFocused: boolean;
}

const Carousel = ({ isFocused }: CarouselProps ) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const changeSlide = useCallback((direction: number) => setActiveSlideIndex(currentIndex => (currentIndex + direction) % SLIDES.length), []);

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
  
  if (!isFocused) {

    return null;
  }
  return (
    <article className={styles.frame}>
      <h2 className={styles.heading}>Selected Work</h2>
      <ul className={styles.carousel} onClick={handleNext}>
        {SLIDES.map((slide, index) => (
          <>
          <Slide
            key={slide.src}
            index={index}
            activeSlideIndex={activeSlideIndex}
            slide={slide}
            />
            </>
        ))}
      </ul>
    </article>
  );
}

export default Carousel;