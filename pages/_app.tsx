import '../styles/global.css';
import type { AppProps } from 'next/app'

if (typeof window !== 'undefined') {
  window.hasPreloaded = {};
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}