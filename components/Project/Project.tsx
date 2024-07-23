import Media from "../Media/Media";
import styles from "./Project.module.css";
import Link from "next/link";
import { animated, config, useSpring } from "@react-spring/web";

type ProjectProps = {
  className: string;
  order: number;
  project: Project;
}

const Project = ({className, order, project }: ProjectProps) => {
  const spring = useSpring({
    from: {
      y: 1000,
      x: 0,
      rotate: (order % 2 ? 1 : -1) * project.randomRotation,
    },
    to: {
      y: 0,
      x: 0,
      rotate: (order % 2 ? 1 : -1) * project.randomRotation,
    },
    config: config.slow,
    delay: 750 * Math.random()
  })

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`${styles.project} ${className}`}
    >
      <animated.article style={spring}>
        <Media 
          className={styles.media}
          media={project.thumbnail}
          isActive
        />
      </animated.article>
    </Link>
  )
}

export default Project;