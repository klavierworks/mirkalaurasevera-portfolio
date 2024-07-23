import * as Index from './index';
import slides from '../shared/carousel.json';

export default Index.default;

export const getStaticProps = () => {
  return {
    props: {
      slides
    }
  };
};

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