import * as Project from './index';
import projects from '../../shared/projects.json';

export default Project.default;

export const getStaticProps = ({ params: { slug } }) => {
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