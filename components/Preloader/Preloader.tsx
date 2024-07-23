import styles from './Preloader.module.css';
import { CYPRESS } from '@/shared/cypress';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

if (typeof window !== 'undefined') {
  window.hasPreloadedImages = {};
}

type PreloaderProps = {
  children: React.ReactNode;
  onPreloadComplete?: (isLoaded: boolean) => void;
}

const Preloader = ({ children,  onPreloadComplete }: PreloaderProps) => {
  const [hasPreloaded, setHasPreloaded] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const hasLoadedImages = Object.values(window.hasPreloadedImages).every((isLoaded: boolean) => isLoaded);
    setHasPreloaded(hasLoadedImages);
  }, [pathname]);

  useEffect(() => {
    if (hasPreloaded || typeof window === 'undefined') {
      return;
    }

    const interval = setInterval(() => {
      const hasLoadedImages = Object.values(window.hasPreloadedImages).every((isLoaded: boolean) => isLoaded);

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
      {children}
      {!hasPreloaded && <div className={styles.loading} data-cy={CYPRESS.PRELOADER}>Loading...</div>}
    </>
  );
}
export default Preloader;