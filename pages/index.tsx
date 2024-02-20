import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useCallback, useEffect, useMemo, useState } from "react";
import Preloader from "@/components/Preloader/Preloader";
import classNames from "classnames";
import slides from '../public/carousel.json';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SlideType = {
  caption?: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

export default function  Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const previousSlideIndex = searchParams.get('previousSlideIndex');
  const activeSlideIndex = useMemo(() => Number(pathname.replace('/', '') ?? "0"), [pathname]);

  const isAboutVisible = pathname === '/about';

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  const handleToggleAbout = useCallback(() => {
    router.push(isAboutVisible ? `/${previousSlideIndex ?? 0}` : `/about?previousSlideIndex=${activeSlideIndex}`);
  }, [activeSlideIndex, isAboutVisible, previousSlideIndex, router]);

  const layoutClassNames = classNames(styles.layout, {
    [styles.isAbout]: isAboutVisible,
    [styles.isLoaded]: isLoaded,
    [styles.hasCompletedIntro]: hasCompletedIntro,
    isViewingCarousel: isLoaded && !isAboutVisible,
  });

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.setTimeout(() => {
      setHasCompletedIntro(true);
    }, 600);
  }, [isLoaded]);

  return (
    <main className={layoutClassNames}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title} onClick={handleToggleAbout}>Mirka Laura Severa</h1>
      </div>
      <Preloader onPreloadComplete={setIsLoaded} slides={slides}>
        <About className={styles.info} />
        <Carousel activeSlideIndex={activeSlideIndex} className={styles.carousel} />
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