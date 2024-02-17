import styles from './Preloader.module.css';
import { SlideType } from "@/pages";
import classNames from 'classnames';
import { useEffect, useState } from "react";

type PreloaderProps = {
  children: React.ReactNode;
  slides: SlideType[];
}

const Preloader = ({ children, slides }: PreloaderProps) => {
  const [preloaded, setPreloaded] = useState(0);
  const hasPreloaded = preloaded === slides.length;

  useEffect(() => {
    if (hasPreloaded) {
      return;
    }
    Promise.all(slides.map(async (slide: SlideType) => {
      const img = new Image();
      img.src = `/carousel/${slide.src}`;
      img.decoding = 'async';
      await img.decode();

      setPreloaded((preloaded: number) => preloaded + 1);
    }))
  }, [hasPreloaded, setPreloaded, slides]);

  const preloaderClassNames = classNames(styles.preloader, {
    hasPreloaded: hasPreloaded,
  });

  return (
    <div className={preloaderClassNames}>
      {children}
      {!hasPreloaded && <div className={styles.loading}>Loading...</div>}
    </div>
  );
}
export default Preloader;