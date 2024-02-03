import Image from "next/image"
import styles from './Slide.module.css';
import { SLIDES, type SlideType } from "../Carousel/Carousel";
import { CSSProperties, ChangeEvent, useCallback, useMemo, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

type SlideProps = {
  activeSlideIndex: number;
  index: number;
  slide: SlideType;
}

const Slide = ({ activeSlideIndex, index, slide}: SlideProps) => {
  const isActive = activeSlideIndex === index;
  const isPreviouslyActive =
    activeSlideIndex === index + 2
    || activeSlideIndex === index + 1
    || activeSlideIndex === 0 && index === SLIDES.length - 1;
  
    const [isFocused, setIsFocused] = useState(isActive);
  
    const zIndex = useMemo(() => {
      if (isPreviouslyActive) {
        return 1;
      }
      return 2;
    }, [isPreviouslyActive]);

  const rotate = useMemo(() => {
    if (isPreviouslyActive) {
      return 1080;
    }
    if (isActive) {
      return 720;
    }
    return 0;
  }, [isActive, isPreviouslyActive]);

  const scale = useMemo(() => {
    if (isPreviouslyActive) {
      return 4;
    }
    if (isActive) {
      return 1;
    }
    return 0;
  }, [isActive, isPreviouslyActive]);

  const [spring] = useSpring({
      delay: isActive ? 100 : 0,
      zIndex,
      scale,
      rotate,
      onStart: () => {
        setIsFocused(false);
      },
      onRest: () => {
        setIsFocused(isActive);
      },
  }, [ index,zIndex, scale, rotate])

  return (
    <animated.li
      className={`${styles.slide} ${isFocused ? styles.isFocused : ''}`}
      key={slide.src}
      style={spring}
      >
      <Image className={styles.image} src={`/work/${slide.src}`} alt={slide.name} width={slide.width} height={slide.height} />
      <p className={styles.title}>{`"Slide ${index}" ${slide.caption} active: ${activeSlideIndex} index: ${index} total: ${SLIDES.length}`}</p>
    </animated.li>
  );
}

export default Slide;