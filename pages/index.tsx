import { useRouter } from "next/router";
import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useCallback } from "react";
import Preloader from "@/components/Preloader/Preloader";

export type SlideType = {
  caption?: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

export default function  Home({ slides }: { slides: SlideType[] }) {
  const router = useRouter();
  const isAboutVisible = router.pathname === '/about';

  const handleToggleAbout = useCallback(() => {
    router.push(isAboutVisible ? '/' : '/about');
  }, [isAboutVisible, router]);

  return (
    <main className={`${styles.layout} ${isAboutVisible ? styles.isAbout : ''}`}>
      <h1 className={styles.title} onClick={handleToggleAbout}>Mirka Laura Severa</h1>
      <Preloader slides={slides}>
        <About className={styles.info} />
        <Carousel isFocused={!isAboutVisible} slides={slides}  />
      </Preloader>
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