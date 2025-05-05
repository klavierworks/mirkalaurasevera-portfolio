import * as Index from './index';
import { getProjects, getSlides } from '@/utils/api';

export default Index.default;

export const getStaticProps = async () => {
  const slides = await getSlides(true)
    const projects = await getProjects(true)

  return {
    props: {
      projects,
      slides
    }
  };
};

export async function getStaticPaths() {
  const slides = await getSlides()

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