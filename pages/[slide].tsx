import Index, { SlideType } from './index';
import slides from '../public/carousel.json';

export default Index;

export async function getStaticProps() {
  const slides = await import('../public/carousel.json');
  return {
    props: {
      slides: slides.default,
    },
  };
}

export async function getStaticPaths() {
  const paths = slides.map((slide: SlideType, index: number) => ({
    params: {
      slide: index.toString(),
    },
  }));

  return {
    paths,
    fallback: false
  };
}