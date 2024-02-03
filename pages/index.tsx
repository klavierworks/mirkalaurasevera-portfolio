import { useRouter } from "next/router";
import About from "../components/About/About";
import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useCallback } from "react";

export default function Home() {
  const router = useRouter();

  const isAboutVisible = router.pathname === '/about';
  
  const handleToggleAbout = useCallback(() => {
    router.push(isAboutVisible ? '/' : '/about');
  }, [isAboutVisible, router]);

  return (
    <main className={`${styles.info} ${isAboutVisible ? styles.isAbout : ''}`}>
      <About />
      <Carousel isFocused={!isAboutVisible} />
      <h1 className={styles.title} onClick={handleToggleAbout}>Mirka Laura Severa</h1>
    </main>
  );
}
