import { CSSProperties } from "react";
import Media from "../Media/Media";
import styles from "./Project.module.css";
import Link from "next/link";

type ProjectProps = {
  className: string;
  order: number;
  project: Project;
}

const Project = ({className, order, project }: ProjectProps) => {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`${styles.project} ${className}`}
      style={{
        '--order': order,
        '--rotate': `${project.randomRotation}deg`,
      } as CSSProperties}
    >
      <article>
        <Media 
          className={styles.media}
          media={project.thumbnail}
          isActive
        />
      </article>
    </Link>
  )
}

export default Project;