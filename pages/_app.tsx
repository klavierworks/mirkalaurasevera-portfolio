import Preloader from '@/components/Preloader/Preloader';
import '../styles/global.css';
import styles from './_app.module.css';
import type { AppProps } from 'next/app'
import Head from 'next/head';
import Title from '@/components/Title/Title';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

if (typeof window !== 'undefined') {
  window.hasPreloaded = {};
}

const PortfolioApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHome = router.pathname === '/' || router.pathname === '/[slide]';

  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);


  useEffect(() => {
    if (!isLoaded || !isHome) {
      return;
    }

    let timer = window.setTimeout(() => {
      setIsCarouselVisible(true);
    }, 500);

    return () => {
      window.clearTimeout(timer);
      setIsCarouselVisible(false);
    };
  }, [isLoaded, isHome]);

  const preservedActiveSlideIndex = searchParams.get('activeSlideIndex') ? Number(searchParams.get('activeSlideIndex')) : undefined;
  const initialSlideIndex = preservedActiveSlideIndex ?? Number(pathname.replace('/', ''));
  const [activeSlideIndex, setActiveSlideIndex] = useState(Number.isInteger(initialSlideIndex) ? initialSlideIndex : 0);

  const layoutClassNames = classNames(styles.layout, {
    [styles.isPageLoaded]: isLoaded && (!isHome || isCarouselVisible),
    [styles.isHome]: isHome,
  });

  return (
    <>
      <Head>
        <title>Mirka Laura Severa</title>
        <meta name="description" content="Mirka Laura Severa is a conceptual artist working across Photography, Video, and Creative Direction, based in Amsterdam / Paris and represented globally." />
        <meta name="keywords" content="Mirka Laura Severa, Conceptual Artist, Photography, Video, Creative Direction, Amsterdam, Paris" />
        <meta property="og:title" content="Mirka Laura Severa - Conceptual Artist" />
        <meta property="og:description" content="Mirka Laura Severa is a conceptual artist working across Photography, Video, and Creative Direction, based in Amsterdam / Paris and represented globally." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mirkalaurasevera.com/ogmeta.jpg" />
        <meta property="og:url" content="https://mirkalaurasevera.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mirka Laura Severa" />
        <meta name="twitter:description" content="Mirka Laura Severa is a conceptual artist working across Photography, Video, and Creative Direction, based in Amsterdam / Paris and represented globally." />
        <meta name="twitter:image" content="https://mirkalaurasevera.com/ogmeta.jpg" />
        <link rel="canonical" href="https://mirkalaurasevera.com/" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></meta>
    </Head>
    <main className={layoutClassNames}>
      <Title activeSlideIndex={activeSlideIndex} />
      <Preloader onPreloadComplete={setIsLoaded} data={pageProps}>
        <div className={styles.page}>
          <Component activeSlideIndex={activeSlideIndex} isCarouselVisible={isCarouselVisible} setActiveSlideIndex={setActiveSlideIndex} {...pageProps} />
        </div>
      </Preloader>
    </main>
    </>
  );
}

export default PortfolioApp;
