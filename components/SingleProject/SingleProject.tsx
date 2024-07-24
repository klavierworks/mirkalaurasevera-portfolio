import styles from './SingleProject.module.css';
import arrow from './arrow.svg';
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ProjectMedia from './ProjectMedia/ProjectMedia';

type SingleProjectProps = {
  activeProject?: Project;
}

const SingleProject = ({ activeProject }: SingleProjectProps) => {
  const masonryFrameRef = useRef<HTMLDivElement>(null);
  const [visibleProject, setVisibleProject] = useState<Project>();

  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);

  const handleSetVisibleSlideIndex = (isIntersecting: boolean, index: number) => {
    // Catches random fires of the observer when resetting the scroll
    if (masonryFrameRef.current && masonryFrameRef.current.scrollTop < 100) {
      setVisibleSlideIndex(0);
      return;
    }
    if (isIntersecting) {
      setVisibleSlideIndex(index);
      return;
    }
    if (index === 0) {
      return;
    }
    setVisibleSlideIndex(index - 1);
  }

  useEffect(() => {
    if (!activeProject) {
      return
    }

    let ref = masonryFrameRef.current;

    setVisibleProject(activeProject);

    return () => {
      ref?.scrollTo?.(0, 0);
      setVisibleSlideIndex(0);
    }
  }, [activeProject]);

  const frameClassNames = classNames(styles.frame, {
    'has-scrollbar': true,
    [styles.isActive]: activeProject && visibleProject === activeProject,
  });

  return (
    <>
      <div className={frameClassNames} ref={masonryFrameRef}>
        <div className={styles.content}>
          <h1>{visibleProject?.title}</h1>
          <div dangerouslySetInnerHTML={{__html: visibleProject?.description ?? '' }} />
        </div>
        <div className={styles.slider}>
          {visibleProject?.media.map((media, index) => (
            <ProjectMedia
              isFirstSlide={index === 0}
              isVisible={visibleSlideIndex === index}
              key={media.image.src}
              media={media}
              toggleIsVisible={isIntersecting => handleSetVisibleSlideIndex(isIntersecting, index)}
              />
            ))
          }
        </div>
      </div>
      {activeProject && (
        <Link href={`/projects`} className={styles.arrow}>
          <img alt="back icon" src={arrow.src} />
        </Link>
      )}
    </>
  )
}

export default SingleProject;