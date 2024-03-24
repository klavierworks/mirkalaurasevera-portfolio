import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import ImageSlide from "../ImageSlide/ImageSlide";
import styles from './VideoSlide.module.css';

type VideoSlideProps = {
  className: string;
  isActive: boolean;
  isLoaded: boolean;
  setIsLoaded: (isLoaded: boolean) => void;
  slide: Slide;
}

const VideoSlide = forwardRef(({ className,isActive, isLoaded, setIsLoaded, slide }: VideoSlideProps, ref: ForwardedRef<HTMLImageElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (isActive) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

	const handlePlay = () => {
		setHasStartedPlaying(true);
	};

	const handleClick = () => {
    if (!videoRef.current) {
      return;
    }
		if (videoRef.current.paused) {
			videoRef.current.play();
		} else {
			videoRef.current.pause();
		}
	};

	const handleThumbnailClick = () => {
    if (!videoRef.current) {
      return;
    }
		videoRef.current.play();
	};

  return (
    <div className={`${styles.container} ${className} ${hasStartedPlaying && styles.hasStartedPlaying}`}>
      <video
        className={styles.video}
        controls={false}
        loop
        muted
        playsInline
        ref={videoRef}
        onClick={handleClick}
        onPlay={handlePlay}
      >
        <source src={slide.video?.url} type="application/x-mpegURL" />
        <source src={slide.video?.mp4Url} type="video/mp4" />
      </video>
      <ImageSlide
        className={styles.fallback}
        slide={slide}
        isLoaded={isLoaded}
        setIsLoaded={setIsLoaded}
        onClick={handleThumbnailClick}
        ref={ref}
      />
    </div>
  )
})

VideoSlide.displayName = 'VideoSlide';
export default VideoSlide;