import '../styles/global.css';
import Preloader from '@/components/Preloader/Preloader';
import styles from './_app.module.css';
import type { AppProps } from 'next/app'
import Head from 'next/head';
import Title from '@/components/Title/Title';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { usePathname, useSearchParams } from 'next/navigation';

const PortfolioApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHome = router.pathname === '/' || router.pathname === '/[slide]';

  const [isLoaded, setIsLoaded] = useState(false);

  const preservedActiveSlideIndex = searchParams.get('activeSlideIndex') ? Number(searchParams.get('activeSlideIndex')) : undefined;
  const initialSlideIndex = preservedActiveSlideIndex ?? Number(pathname.replace('/', ''));
  const [activeSlideIndex, setActiveSlideIndex] = useState(Number.isInteger(initialSlideIndex) ? initialSlideIndex : 0);

  const layoutClassNames = classNames(styles.layout, {
    [styles.isPageLoaded]: isLoaded && (!isHome || isLoaded),
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicons/favicon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicons/favicon-152x152.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/favicons/favicon-128x128.png" />
        <link rel="apple-touch-icon" sizes="64x64" href="/favicons/favicon-60x60.png" />
        <link rel="apple-touch-icon" sizes="48x48" href="/favicons/favicon-57x57.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicons/favicon-512x512.png" />
    </Head>
    <main className={layoutClassNames}>
      <Title activeSlideIndex={activeSlideIndex} />
      <Preloader onPreloadComplete={setIsLoaded}>
        <div className={styles.page}>
          <Component activeSlideIndex={activeSlideIndex} setActiveSlideIndex={setActiveSlideIndex} {...pageProps} />
        </div>
      </Preloader>
    </main>
    </>
  );
}

export default PortfolioApp;
