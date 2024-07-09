import Project from './index';
import projects from '../../shared/projects.json';
import { GetStaticPaths, GetStaticPathsContext } from 'next';

export default Project;

export const getStaticProps = ({ params: { slug } }: {params: {slug: string}}) => {
  return {
    props: {
      activeProject: projects.find(project => project.slug === slug), 
    }
  }
}

export async function getStaticPaths() {
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