import Carousel from "../components/Carousel/Carousel";
import styles from './index.module.css';
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type HomeProps = {
  slides: Slide[];
}

export default function Home({ slides }: HomeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const preservedActiveSlideIndex = searchParams.get('activeSlideIndex') ? Number(searchParams.get('activeSlideIndex')) : undefined;
  const initialSlideIndex = preservedActiveSlideIndex ?? Number(pathname.replace('/', ''));
  const [activeSlideIndex, setActiveSlideIndex] = useState(Number.isInteger(initialSlideIndex) ? initialSlideIndex : 0);

  useEffect(() => {
    setActiveSlideIndex(initialSlideIndex);
  }, [initialSlideIndex]);

  return <Carousel activeSlideIndex={activeSlideIndex} className={styles.carousel} setActiveSlideIndex={setActiveSlideIndex} slides={slides} />;
}

export const getStaticProps = async () => {
  const slides = await import('../shared/carousel.json');
  const projects = await import('../shared/projects.json');

  return {
    props: {
      slides: slides.default,
      projects: projects.default,
    },
  };
}
