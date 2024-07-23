import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import styles from './ProjectMedia.module.css';
import Media from "@/components/Media/Media"

type ProjectMediaProps = {
  isFirstSlide: boolean;
  isVisible: boolean;
  media: Project['media'][0];
  toggleIsVisible: (isIntersecting: boolean) => void;
}

const ProjectMedia = ({ isFirstSlide, isVisible, media, toggleIsVisible }: ProjectMediaProps) => {
  const { ref } = useIntersectionObserver({
    initialIsIntersecting: isFirstSlide,
    threshold: 0.9,
    onChange: (isIntersecting) => toggleIsVisible(isIntersecting),
  });

  return (
    <div className={`${styles.mediaContainer} ${isVisible && styles.isVisible}`} ref={ref}>
      <Media className={styles.media} isActive media={media} />
    </div>
  )
}

export default ProjectMedia