import styles from './Preloader.module.css';
import { CYPRESS } from '@/shared/cypress';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Projects from '@/pages/projects';
import Carousel from '../Carousel/Carousel';

if (typeof window !== 'undefined') {
  window.requiresPreload = [];
  window.hasPreloaded = false;
}

type PreloaderProps = {
  children: React.ReactNode;
  onPreloadComplete?: (isLoaded: boolean) => void;
  projects: Project[];
  slides: Slide[];
}

const Preloader = ({ children,  onPreloadComplete, projects, slides }: PreloaderProps) => {
  const [hasPreloaded, setHasPreloaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (hasPreloaded || typeof window === 'undefined') {
      return;
    }

    const interval = setInterval(() => {
      const hasLoadedImages = window.requiresPreload.length === 0;

      if (hasLoadedImages) {
        clearInterval(interval);
        setHasPreloaded(true);
        window.hasPreloaded = true;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasPreloaded]);

  useEffect(() => {
    onPreloadComplete?.(true);
  }, [hasPreloaded, onPreloadComplete]);

  return (
    <>
      {hasPreloaded ? children : (
        <>
          <div className={styles.layers}>
            <Carousel activeSlideIndex={0} isCarouselVisible={false} slides={slides} />
            <Projects isPreloading slides={slides} projects={projects} />
          </div>
          <div className={styles.loading} data-cy={CYPRESS.PRELOADER}>Loading...</div>
        </>
      )}
    </>
  );
}
export default Preloader;