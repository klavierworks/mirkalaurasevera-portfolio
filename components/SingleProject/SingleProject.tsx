import styles from './SingleProject.module.css';
import arrow from './arrow.svg';
import Link from "next/link";
import Media from "../Media/Media";
import { useEffect, useState } from 'react';
import classNames from 'classnames';

type SingleProjectProps = {
  activeProject?: Project;
}

const SingleProject = ({ activeProject }: SingleProjectProps) => {
  const [visibleProject, setVisibleProject] = useState<Project>();

  useEffect(() => {
    if (!activeProject) {
      return
    }

    setVisibleProject(activeProject);
  }, [activeProject]);

  const frameClassNames = classNames(styles.frame, {
    [styles.isActive]: !!activeProject
  });

  if (!visibleProject) {
    return null
  }

  return (
    <>
      <div className={frameClassNames}>
        <div className={styles.content}>
          <h1>{visibleProject.title}</h1>
          <div dangerouslySetInnerHTML={{__html: visibleProject.description }} />
          {visibleProject.media.map((media) => (
            <div className={styles.mediaContainer} key={media.image.src}>
              <Media className={styles.media} isActive media={media} />
            </div>
          ))}
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