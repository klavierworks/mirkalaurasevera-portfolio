import { CSSProperties, ForwardedRef, forwardRef, useCallback, useEffect, useRef, useState } from "react";
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
  width?: string | number;
  sizes?: string;
}

const CustomVideo = forwardRef(({ className, fallback, hasAudio, isActive, sizes, video, width, }: CustomVideoProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
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
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        hls.startLevel = hls.levels.length - 2;
      });
      return;
    }
    videoEl.src = video.mp4Url ?? '';
  }, [video.mp4Url, video.url]);

  const [hasErrored, setHasErrored] = useState(true);
  const handlePlay = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      await videoRef.current.play();
      setHasErrored(false);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        console.error('Unknown error during video playback:', error);
        return;
      }
      // Check for iOS Low Power Mode
      // In Low Power Mode, play() is rejected with NotAllowedError or AbortError
      const isLowPowerMode = 
        error.name === 'NotAllowedError' || 
        error.name === 'AbortError';

      if (isLowPowerMode) {
        console.warn('Video playback was prevented, possibly due to iOS Low Power Mode.');
      } else {
        console.error('Video playback failed:', error.name, error.message);
      }
      setHasErrored(true);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (isActive) {
      handlePlay();
    } else {
      videoRef.current.pause();
    }
  }, [isActive, handlePlay]);

	const handleProgress = () => {
		setHasStartedPlaying(true);
	};

	const handleClick = () => {
    if (!videoRef.current) {
      return;
    }
		if (videoRef.current.paused) {
      handlePlay();
		} else {
			videoRef.current.pause();
		}
	};

	const handleThumbnailClick = () => {
    if (!videoRef.current) {
      return;
    }
    handlePlay();
	};

  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className={`${styles.container} ${className} ${hasStartedPlaying && !hasErrored && styles.hasStartedPlaying}`} style={{"--videoAspectRatio": videoAspectRatio} as CSSProperties}>
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
      {fallback && (
        <CustomImage
          className={styles.fallback}
          image={fallback}
          onClick={handleThumbnailClick}
          ref={ref}
          width={width}
          sizes={sizes}
        />
      )}
    </div>
  )
})

CustomVideo.displayName = 'CustomVideo';
export default CustomVideo;