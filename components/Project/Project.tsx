import CustomVideo from "../CustomVideo/CustomVideo";
import Media from "../Media/Media";
import styles from "./Project.module.css";
import Link from "next/link";

type ProjectProps = {
  isActive: boolean;
  project: Project;
}

const Project = ({ isActive, project }: ProjectProps) => {
  return (
    <Link key={project.slug} href={`/projects/${project.slug}`}>
      <article className={`${styles.project} ${isActive ? styles.isActive : ''}`} key={project.slug}>
        <Media 
          className={styles.media}
          media={project.thumbnail}
          isActive={isActive}
          style={{
            aspectRatio: project.thumbnail?.image?.aspectRatio,
            rotate: `${project.randomRotation}deg`,
          }}
        />
      </article>
    </Link>
  )
}

export default Project;