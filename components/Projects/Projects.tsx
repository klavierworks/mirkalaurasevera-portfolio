import styles from './Projects.module.css';

type ProjectsProps = {
  projects: Slide[];
}

const Projects = ({ projects }: ProjectsProps) => {
  return (
    <div className={styles.projects}>
      {projects.map(slide => (
        <article className={styles.project} key={slide.src}>
          <img alt="" style={{
            aspectRatio: slide.width / slide.height,
            rotate: `${(Math.random() - 0.5) * 15}deg`,
          }} src={slide.src} />
        </article>
      ))}
    </div>
  );
}

export default Projects;