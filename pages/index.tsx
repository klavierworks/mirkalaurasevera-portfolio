import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader/Preloader";
import classNames from "classnames";
import { usePathname, useSearchParams } from "next/navigation";
import { CYPRESS } from "../shared/cypress";
import Title from "../components/Title/Title";
import Projects from "../components/Projects/Projects";

export default function Home({ slides }: { slides: Slide[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const preservedActiveSlideIndex = searchParams.get('activeSlideIndex') ? Number(searchParams.get('activeSlideIndex')) : undefined;
  const initialSlideIndex = preservedActiveSlideIndex ?? Number(pathname.replace('/', ''));
  const [activeSlideIndex, setActiveSlideIndex] = useState(Number.isInteger(initialSlideIndex) ? initialSlideIndex : 0);

  useEffect(() => {
    setActiveSlideIndex(initialSlideIndex);
  }, [initialSlideIndex]);

  const isHome = pathname === '/';
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  const isViewingCarousel = isLoaded && isHome;

  const layoutClassNames = classNames(styles.layout, {
    [styles.isNotHome]: !isHome,
    isNotHome: !isHome,
    [styles.isLoaded]: isLoaded,
    [styles.hasCompletedIntro]: hasCompletedIntro,
    isViewingCarousel,
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
      <Title />
      <Preloader onPreloadComplete={setIsLoaded} slides={slides}>
        {!isHome && !isViewingCarousel && <Projects projects={slides} />}
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