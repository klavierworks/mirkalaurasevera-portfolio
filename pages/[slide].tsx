import Index, { SlideType } from './index';

export default Index;

export async function getStaticPaths() {
  const slides = (await import('../public/carousel.json')).default;

  const paths = slides.map((slide: SlideType, index: number) => ({
    params: {
      slug: index,
    },
  }));

  return {
    paths,
    fallback: false
  };
}