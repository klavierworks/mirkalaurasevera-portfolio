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

export default function Home({ slides }: { slides: SlideType[] }) {
  const router = useRouter();
  const isAboutVisible = router.pathname === '/about';

  const [preloaded, setPreloaded] = useState(0);
  const hasPreloaded = preloaded === slides.length;

  useEffect(() => {
    if (hasPreloaded) {
      return;
    }
    Promise.all(slides.map(async (slide: SlideType) => {
      const img = new Image();
      img.src = `/carousel/${slide.src}`;
      img.decoding = 'async';
      await img.decode();
      setPreloaded((preloaded: number) => preloaded + 1);
    }))
  }, [hasPreloaded, setPreloaded, slides]);

  const handleToggleAbout = useCallback(() => {
    router.push(isAboutVisible ? '/' : '/about');
  }, [isAboutVisible, router]);

  if (!hasPreloaded) {
    return `Preloading ${preloaded} of ${slides.length} images...`
  }

  return (
    <main className={`${styles.layout} ${isAboutVisible ? styles.isAbout : ''}`}>
      <h1 className={styles.title} onClick={handleToggleAbout}>Mirka Laura Severa</h1>
      <About className={styles.info} />
      <Carousel isFocused={!isAboutVisible} slides={slides}  />
    </main>
  );
}

export async function getStaticProps() {
  const slides = await import('../public/carousel.json');
  return {
    props: {
      slides: slides.default,
    },
  };
}