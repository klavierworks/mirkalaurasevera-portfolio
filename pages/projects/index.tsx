import styles from './Projects.module.css';
import Project from '@/components/Project/Project';
import SingleProject from '@/components/SingleProject/SingleProject';
import { getProjects, getSlides } from '@/utils/api';
import { useEffect, useRef, useState } from 'react';

type ProjectsProps = {
  initialActiveProject?: Project;
  isPreloading?: boolean;
  projects: Project[];
  slides: Slide[];
}

const Projects = ({ initialActiveProject, isPreloading, projects, slides }: ProjectsProps) => {
  const masonryFrameRef = useRef<HTMLDivElement>(null);

  const [activeProject, setActiveProject] = useState(initialActiveProject)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const currentUrl = new URL(window.location.href);

    if (!currentUrl.pathname.startsWith('/projects')) {
      return;
    }
    if (activeProject) {
      currentUrl.pathname = `/projects/${activeProject.slug}`;
    } else {
      currentUrl.pathname = `/projects`;
    }
    window.history.replaceState({}, '', currentUrl.toString());
  }, [activeProject]);

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
          isPreloading={isPreloading}
          order={index % 2 === 0 ? index / 2 : (projects.length / 2) + index}
          project={project}
          setActiveProject={setActiveProject}
        />
      ))}
      <SingleProject activeProject={activeProject} setActiveProject={setActiveProject} />
    </div>
  );
}

export const getStaticProps = async () => {
  const slides = await getSlides()
  const projects = await getProjects()

  return {
    props: {
      projects,
      slides
    }
  }
}

export default Projects;