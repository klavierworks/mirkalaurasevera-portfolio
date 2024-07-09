import Link from 'next/link';
import styles from './Projects.module.css';
import projects from '../../shared/projects.json';
import classNames from 'classnames';
import arrow from './arrow.svg';

type ProjectsProps = {
  activeProject: Project;
}

const Projects = ({ activeProject }: ProjectsProps) => {
  const frameClassNames = classNames(styles.projects, {
    [styles.hasActiveProject]: activeProject
  });

  return (
    <div className={frameClassNames}>
      {projects.map(project => (
        <Link key={project.slug} href={`/projects/${project.slug}`}>
          <article className={`${styles.project} ${activeProject?.slug === project.slug ? styles.isActive : ''}`} key={project.thumbnail.src}>
            <img alt="" style={{
              aspectRatio: project.thumbnail.aspectRatio,
              rotate: `${project.randomRotation}deg`,
            }} src={project.thumbnail.src} />
          </article>
        </Link>
      ))}
      <div className={styles.activeProject}>
        <h1>{activeProject?.title}
          <Link href={`/projects`} className={styles.arrow}>
            <img alt="back icon" src={arrow.src} />
          </Link>
        </h1>
        <p dangerouslySetInnerHTML={{__html: activeProject?.description}} />
        {activeProject?.images.map((imageSrc) => (
          <img key={imageSrc} alt="" className={styles.image} src={imageSrc} />
        ))}
      </div>        
    </div>
  );
}

export default Projects;