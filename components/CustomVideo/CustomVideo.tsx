import { CSSProperties, ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import styles from './CustomVideo.module.css';
import Hls from "hls.js";
import CustomImage from "../CustomImage/CustomImage";
import mute from './mute.svg';
import unmute from './unmute.svg';
import { is } from "cypress/types/bluebird";

type CustomVideoProps = {
  className: string;
  fallback: ImageObject;
  hasAudio?: boolean;
  isActive: boolean;
  video: VideoObject
}

const CustomVideo = forwardRef(({ className, fallback, hasAudio, isActive, video }: CustomVideoProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  const [videoAspectRatio, setVideoAspectRatio] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (!videoRef.current) {
        return;
      }
      setVideoAspectRatio(videoRef.current.videoWidth / videoRef.current.videoHeight);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasStartedPlaying]);

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
      const proxiedSrc = `/api/proxy-vimeo?url=${encodeURIComponent(src)}`;
      hls.loadSource(proxiedSrc);
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

  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className={`${styles.container} ${className} ${hasStartedPlaying && styles.hasStartedPlaying}`} style={{"--videoAspectRatio": videoAspectRatio} as CSSProperties}>
      <video
        autoPlay={isActive}
        className={styles.video}
        controls={false}
        loop
        muted={isMuted}
        playsInline
        ref={videoRef}
        onClick={handleClick}
        onProgress={handleProgress}
      />
      <div className={styles.controls} >
        {hasAudio && (
          <div className={styles.mute} onClick={() => setIsMuted(!isMuted)}>
            <img src={isMuted ? mute.src : unmute.src} alt={isMuted ? 'Unmute' : 'Mute'} />
          </div>
        )}
      </div>
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