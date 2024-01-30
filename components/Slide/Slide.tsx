import Image from "next/image"
import styles from './Slide.module.css';
import type { SlideType } from "../Carousel";
import { CSSProperties } from "react";
import { animated, useSpring } from "@react-spring/web";

type SlideProps = {
  isActive: boolean;
  slide: SlideType
}

const Slide = ({ isActive, slide }: SlideProps) => {
  const spring = useSpring({
    '--scale': isActive ? 1 : 0,
    '--rotate': isActive ? 720 : 0,
    delay: 250,
  })

  return (
    <animated.li
      className={`${styles.slide} ${isActive ? styles.isActive : ''}`}
      key={slide.src}
      style={spring as CSSProperties}
    >
      <Image className={styles.image} src={`/work/${slide.src}`} alt={slide.name} width={slide.width} height={slide.height} />
      <p className={styles.title}>‘Our System’ by Adam Ehrlich Sachs for New Yorker Mag (2022)</p>
    </animated.li>
  );
}

export default Slide;