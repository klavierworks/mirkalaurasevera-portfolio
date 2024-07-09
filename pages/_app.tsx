import Preloader from '@/components/Preloader/Preloader';
import '../styles/global.css';
import styles from './_app.module.css';
import type { AppProps } from 'next/app'
import Head from 'next/head';
import Title from '@/components/Title/Title';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

if (typeof window !== 'undefined') {
  window.hasPreloaded = {};
}

const PortfolioApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.setTimeout(() => {
      setHasCompletedIntro(true);
    }, 600);
  }, [isLoaded]);

  const layoutClassNames = classNames(styles.layout, {
    isLoaded,
    hasCompletedIntro,
    [styles.isHome]: router.pathname === '/' || router.pathname === '/[slide]',
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
      <Title />
      <Preloader onPreloadComplete={setIsLoaded} data={pageProps}>
        <Component {...pageProps} />
      </Preloader>
    </main>
    </>
  );
}

export default PortfolioApp;
