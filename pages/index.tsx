import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader/Preloader";
import classNames from "classnames";
import { usePathname, useSearchParams } from "next/navigation";
import { CYPRESS } from "../shared/cypress";

export default function Home({ slides }: { slides: Slide[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const preservedActiveSlideIndex = searchParams.get('activeSlideIndex') ? Number(searchParams.get('activeSlideIndex')) : undefined;
  const initialSlideIndex = preservedActiveSlideIndex ?? Number(pathname.replace('/', ''));
  const [activeSlideIndex, setActiveSlideIndex] = useState(Number.isInteger(initialSlideIndex) ? initialSlideIndex : 0);

  useEffect(() => {
    setActiveSlideIndex(initialSlideIndex);
  }, [initialSlideIndex]);

  const [isAboutVisible, setIsAboutVisible] = useState(pathname === '/about');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.pathname = isAboutVisible ? `/about` : `/${activeSlideIndex ?? 0}`;
    if (isAboutVisible) {
      url.searchParams.set('activeSlideIndex', activeSlideIndex.toString());
    } else {
      url.searchParams.delete('activeSlideIndex');
    }
    window.history.pushState({}, '', url.href);
  }, [activeSlideIndex, isAboutVisible]);

  const layoutClassNames = classNames(styles.layout, {
    [styles.isAbout]: isAboutVisible,
    isAbout: isAboutVisible,
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
      <h1 className={styles.title} onClick={() => setIsAboutVisible(!isAboutVisible)} data-cy={CYPRESS.PAGE_TOGGLE_LINK}>Mirka Laura Severa</h1>
      </div>
      <Preloader onPreloadComplete={setIsLoaded} slides={slides}>
        <About className={styles.info} />
        <Carousel activeSlideIndex={activeSlideIndex} className={styles.carousel} setActiveSlideIndex={setActiveSlideIndex} slides={slides} />
      </Preloader>
    </main>
  );
}

export async function getStaticProps() {
  const slides = await import('../shared/carousel.json');
  return {
    props: {
      slides: slides.default,
    },
  };
}