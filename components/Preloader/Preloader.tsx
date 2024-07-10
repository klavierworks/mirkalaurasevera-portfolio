import styles from './Preloader.module.css';
import { CYPRESS } from '@/shared/cypress';
import { useEffect, useState } from "react";

type PreloaderProps = {
  children: React.ReactNode;
  onPreloadComplete?: (isLoaded: boolean) => void;
  data: {
    projects?: Project[];
    slides?: Slide[];
  }
}

const Preloader = ({ children, data, onPreloadComplete }: PreloaderProps) => {
  const [hasPreloaded, setHasPreloaded] = useState(false);

  useEffect(() => {
    if (hasPreloaded || typeof window === 'undefined') {
      return;
    }
    
    const interval = setInterval(() => {
      const hasCompletedPreload = data.slides ? data.slides.every((item) => window.hasPreloaded[item.media.image.src]) : true;

      if (hasCompletedPreload) {
        clearInterval(interval);
        setHasPreloaded(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasPreloaded, data]);

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