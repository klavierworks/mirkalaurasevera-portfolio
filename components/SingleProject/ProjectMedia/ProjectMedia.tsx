import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import styles from './ProjectMedia.module.css';
import Media from "@/components/Media/Media"
import { useState } from 'react';

type ProjectMediaProps = {
  isFirstSlide: boolean;
  media: Project['media'][0];
}

const ProjectMedia = ({ isFirstSlide, media }: ProjectMediaProps) => {
  const [isVisible, setIsVisible] = useState(isFirstSlide);

  const { ref } = useIntersectionObserver({
    initialIsIntersecting: isFirstSlide,
    threshold: 0.5,
    onChange: (isIntersecting) => {
      if (!isIntersecting) {
        return;
      }
      setIsVisible(true);
    }
  });

  return (
    <div className={`${styles.mediaContainer} ${isVisible && styles.isVisible}`} ref={ref}>
      <Media
        className={styles.media}
        hasAudio
        isLazyLoaded
        isActive
        media={media}
        width="100vw"
        sizes="(max-width: 1520px) 100vw, 1080px"
      />
    </div>
  )
}

export default ProjectMedia