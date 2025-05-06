import * as Project from './index';
import { getSlides, getProjects } from '@/utils/api';

export default Project.default;

export const getStaticProps = async ({ params: { slug } }: {params: {slug: string}}) => {
  const slides = await getSlides()
  const projects = await getProjects()

  return {
    props: {
      activeProject: projects.find(project => project.slug === slug),
      projects,
      slides
    }
  }
}

export async function getStaticPaths() {
  const projects = await getProjects()

  const paths = projects.map((project) => ({
    params: {
      slug: project.slug,
    },
  }));

  return {
    paths,
    fallback: false
  };
}