import Project from './index';
import { getSlides, getProjects } from '@/utils/api';

export default Project;

export const getStaticProps = async ({ params: { slug } }: {params: {slug: string}}) => {
  const slides = await getSlides(true)
  const projects = await getProjects(true)

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