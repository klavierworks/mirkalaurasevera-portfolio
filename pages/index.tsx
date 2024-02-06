import { useRouter } from "next/router";
import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useCallback, useEffect, useState } from "react";

export type SlideType = {
  caption?: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

export const SLIDES: SlideType[] = [
  { src: 'MLS_001.jpg', name: 'Oral Ocean', width: 3162, height: 2161, caption: undefined },
  { src: 'MLS_002.jpg', name: 'Cyclist', width: 2000, height: 2667, caption: undefined },
  //{ src: 'MLS_003.mov', name: 'The Bottle Pick Up', width: 1193, height: 1670, caption: undefined },
  { src: 'MLS_004.jpg', name: 'Swallow', width: 2000, height: 1537, caption: undefined },
  { src: 'MLS_005.jpeg', name: 'Worm', width: 2000, height: 1537, caption: undefined },
  { src: 'MLS_006.jpg', name: 'UV-Horse', width: 2100, height: 2678, caption: undefined },
  //{ src: 'MLS_007.mov', name: 'Shoe Space', width: 1272, height: 1696, caption: undefined },
  { src: 'MLS_008.jpg', name: 'Spring Feelings', width: 2500, height: 3218, caption: undefined },
  { src: 'MLS_009.jpg', name: 'The Bottle', width: 2500, height: 3218, caption: undefined },
  { src: 'MLS_010.jpeg', name: 'Fashion Snowman', width: 2000, height: 2726, caption: undefined },
  { src: 'MLS_011.jpg', name: 'Bready on Striped Towel', width: 2000, height: 2646, caption: undefined },
  { src: 'MLS_012.jpeg', name: 'Cyclist', width: 2000, height: 2646, caption: undefined },
  { src: 'MLS_013.jpg', name: 'Doglick', width: 2500, height: 3062, caption: undefined },
 { src: 'MLS_014.jpeg', name: 'ysl', width: 1586, height: 2163, caption: undefined },
 { src: 'MLS_015.jpeg', name: 'Sunny Side Up', width: 1586, height: 2163, caption: undefined },
 { src: 'MLS_016.jpeg', name: 'Security Check', width: 1586, height: 2163, caption: undefined },
 //{ src: 'MLS_017.mov', name: '', width: 1586, height: 2163, caption: undefined },
]

export default function Home() {
  const router = useRouter();

  const isAboutVisible = router.pathname === '/about';
  const [preloaded, setPreloaded] = useState(0);
  useEffect(() => {
    Promise.all(SLIDES.map(async (slide: SlideType) => {
      const img = new Image();
      img.src = `/work/${slide.src}`;
      img.decoding = 'async';
      await img.decode();
      setPreloaded((preloaded: number) => preloaded + 1);
    }))
  }, [setPreloaded]);

  const handleToggleAbout = useCallback(() => {
    router.push(isAboutVisible ? '/' : '/about');
  }, [isAboutVisible, router]);

  const hasPreloaded = preloaded === SLIDES.length;
  if (!hasPreloaded) {
    return `Preloading ${preloaded} of ${SLIDES.length} images...`
  }
  return (
    <main className={`${styles.layout} ${isAboutVisible ? styles.isAbout : ''}`}>
      <h1 className={styles.title} onClick={handleToggleAbout}>Mirka Laura Severa</h1>
      <About />
      <Carousel isFocused={!isAboutVisible}  />
    </main>
  );
}
