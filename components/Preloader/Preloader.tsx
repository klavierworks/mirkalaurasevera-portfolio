import styles from './Preloader.module.css';
import { CYPRESS } from '@/shared/cypress';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Projects from '@/pages/projects';
import Carousel from '../Carousel/Carousel';

if (typeof window !== 'undefined') {
  window.requiresPreload = [];
}

type PreloaderProps = {
  children: React.ReactNode;
  onPreloadComplete?: (isLoaded: boolean) => void;
}

const Preloader = ({ children,  onPreloadComplete }: PreloaderProps) => {
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
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasPreloaded]);

  useEffect(() => {
    onPreloadComplete?.(hasPreloaded);
  }, [hasPreloaded, onPreloadComplete]);

  return (
    <>
      {hasPreloaded ? children : (
        <>
          <div className={styles.layers}>
            <Carousel activeSlideIndex={0} isCarouselVisible={false} />
            <Projects isPreloading />
          </div>
          <div className={styles.loading} data-cy={CYPRESS.PRELOADER}>Loading...</div>
        </>
      )}
    </>
  );
}
export default Preloader;