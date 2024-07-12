import styles from './Projects.module.css';
import projectsJson from '../../shared/projects.json';
import Project from '@/components/Project/Project';
import SingleProject from '@/components/SingleProject/SingleProject';
import { useEffect, useRef } from 'react';

const projects = projectsJson as unknown as Project[];

type ProjectsProps = {
  activeProject: Project;
}

const Projects = ({ activeProject }: ProjectsProps) => {
  const masonryFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMutation = (mutations?: MutationRecord[]) => {
      masonryFrameRef.current?.style.setProperty('--masonry-height', `${masonryFrameRef.current.clientHeight}px`);
      masonryFrameRef.current?.classList.add('masonry-ready');
    }

    if (!masonryFrameRef.current) {
      return
    }

    handleMutation();
    const observer = new MutationObserver(handleMutation);
    observer.observe(masonryFrameRef.current, { childList: true });
    return () => {
      observer.disconnect();
    }
  }, [activeProject]);

  return (
    <div className={styles.projects} ref={masonryFrameRef}>
      {projects.map((project, index) => (
        <Project
          className={`${styles.project} ${activeProject?.slug === project.slug ? styles.isActive : ''}`}
          key={project.slug}
          order={index % 2 === 0 ? index / 2 : (projects.length / 2) + index}
          project={project}
        />
      ))}
      <SingleProject activeProject={activeProject} />
    </div>
  );
}

export default Projects;