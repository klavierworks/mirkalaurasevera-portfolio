import { useRouter } from "next/router";
import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useCallback, useState } from "react";
import Preloader from "@/components/Preloader/Preloader";
import classNames from "classnames";

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

  const [isLoaded, setIsLoaded] = useState(false);
  const layoutClassNames = classNames(styles.layout, {
    [styles.isAbout]: isAboutVisible,
    [styles.isLoaded]: isLoaded,
    isViewingCarousel: isLoaded && !isAboutVisible,
  });

  return (
    <main className={layoutClassNames}>
      <h1 className={styles.title} onClick={handleToggleAbout}>Mirka Laura Severa</h1>
      <Preloader onPreloadComplete={setIsLoaded} slides={slides}>
        <About className={styles.info} />
        <Carousel slides={slides}  />
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