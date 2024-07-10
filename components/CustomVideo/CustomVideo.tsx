import { CSSProperties, ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import styles from './CustomVideo.module.css';
import Hls from "hls.js";
import CustomImage from "../CustomImage/CustomImage";

type CustomVideoProps = {
  className: string;
  fallback: ImageObject;
  isActive: boolean;
  style?: CSSProperties;
  video: VideoObject
}

const CustomVideo = forwardRef(({ className, fallback, isActive, style, video }: CustomVideoProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  useEffect(() => {
    let videoEl = videoRef.current;
    let src = video?.url;
    if (!videoEl || !src) {
      return;
    }
    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = src;
      return;
    }
    if (typeof window === 'undefined' ) {
      return;
    }
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoEl);
      return;
    }
    videoEl.src = video.mp4Url ?? '';
  }, [video.mp4Url, video.url]);

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

	const handleProgress = () => {
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
    <div className={`${styles.container} ${className} ${hasStartedPlaying && styles.hasStartedPlaying}`} style={style}>
      <video
        className={styles.video}
        controls={false}
        loop
        muted
        playsInline
        ref={videoRef}
        onClick={handleClick}
        onProgress={handleProgress}
      />
      <CustomImage
        className={styles.fallback}
        image={fallback}
        onClick={handleThumbnailClick}
        ref={ref}
      />
    </div>
  )
})

CustomVideo.displayName = 'CustomVideo';
export default CustomVideo;