import styles from './Preloader.module.css';
import { CYPRESS } from '@/shared/cypress';
import { useEffect, useState } from "react";

type PreloaderProps = {
  children: React.ReactNode;
  onPreloadComplete?: (isLoaded: boolean) => void;
  slides: Slide[];
}

const Preloader = ({ children, onPreloadComplete, slides }: PreloaderProps) => {
  const [hasPreloaded, setHasPreloaded] = useState(false);

  useEffect(() => {
    if (hasPreloaded || typeof window === 'undefined') {
      return;
    }
    
    const interval = setInterval(() => {
      const hasCompletedPreload = slides.every((slide) => window.hasPreloaded[slide.src]);

      if (hasCompletedPreload) {
        clearInterval(interval);
        setHasPreloaded(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasPreloaded, slides]);

  useEffect(() => {
    onPreloadComplete?.(hasPreloaded);
  }, [hasPreloaded, onPreloadComplete]);

  return (
    <>
      {children}
      {!hasPreloaded && <div className={styles.loading} data-cy={CYPRESS.PRELOADER}>Loading...</div>}
    </>
  );
}
export default Preloader;