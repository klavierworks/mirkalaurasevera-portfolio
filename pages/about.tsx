import Index from './index';

export default Index;

export async function getStaticProps() {
  const slides = await import('../carousel.json');
  return {
    props: {
      slides: slides.default,
    },
  };
}