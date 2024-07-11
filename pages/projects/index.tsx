import Link from 'next/link';
import styles from './Projects.module.css';
import projectsJson from '../../shared/projects.json';
import classNames from 'classnames';
import arrow from './arrow.svg';
import Project from '@/components/Project/Project';
import Media from '@/components/Media/Media';

const projects = projectsJson as unknown as Project[];

type ProjectsProps = {
  activeProject: Project;
}

const Projects = ({ activeProject }: ProjectsProps) => {
  const frameClassNames = classNames(styles.projects, {
    [styles.hasActiveProject]: activeProject
  });

  return (
    <div className={frameClassNames}>
      {projects.map((project) => (
        <Project
          key={project.slug}
          isActive={activeProject?.slug === project.slug}
          project={project}
        />
      ))}
      <div className={styles.activeProject}>
        <div className={styles.content}>
          <h1>{activeProject?.title}
            <Link href={`/projects`} className={styles.arrow}>
              <img alt="back icon" src={arrow.src} />
            </Link>
          </h1>
          <p dangerouslySetInnerHTML={{__html: activeProject?.description}} />
          {activeProject?.media?.map((media) => (
            <div className={styles.mediaContainer} key={media.image.src}>
              <Media className={styles.media} isActive media={media} />
            </div>
          ))}
        </div>
      </div>        
    </div>
  );
}

export default Projects;