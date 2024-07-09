import * as Index from '../index';
import styles from './Projects.module.css';

type ProjectsProps = {
  projects: Project[];
}

const Projects = ({ projects }: ProjectsProps) => {
  return (
    <div className={styles.projects}>
      {projects.map(slide => (
        <article className={styles.project} key={slide.thumbnail.src}>
          <img alt="" style={{
            aspectRatio: slide.thumbnail.aspectRatio,
            rotate: `${(Math.random() - 0.5) * 15}deg`,
          }} src={slide.thumbnail.src} />
        </article>
      ))}
    </div>
  );
}

export default Projects;

export const getStaticProps = Index.getStaticProps;