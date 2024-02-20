import Index, { SlideType } from './index';
import slides from '../public/carousel.json';

export default Index;

export async function getStaticProps({ params }: { params: { slide: string } }) {
  return {
    props: {}
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