import Index from './index';
import slides from '../shared/carousel.json';

export default Index;

export async function getStaticProps() {
  const slides = await import('../shared/carousel.json');
  return {
    props: {
      slides: slides.default,
    },
  };
}

export async function getStaticPaths() {
  const paths = slides.map((_, index: number) => ({
    params: {
      slide: index.toString(),
    },
  }));

  return {
    paths,
    fallback: false
  };
}