import { CSSProperties, ForwardedRef, forwardRef } from "react";
import CustomImage from "../CustomImage/CustomImage";
import CustomVideo from "../CustomVideo/CustomVideo";

type MediaProps = {
  className: string;
  hasAudio?: boolean;
  media: MediaObject;
  isActive: boolean;
  isLazyLoaded?: boolean;
  width?: string | number;
  height?: string | number;
}

const Media = forwardRef(({
  className,
  hasAudio,
  media,
  isActive,
  isLazyLoaded,
  width,
  height,
}: MediaProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {
  if (media?.video) {
    return (
      <CustomVideo
        className={className}
        fallback={media.image}
        isActive={isActive}
        hasAudio={hasAudio && media.video.hasAudio}
        ref={ref}
        video={media.video}
      />
    )
  }

  if (media?.image) {
    return (
      <CustomImage
        className={className}
        isLazyLoaded={isLazyLoaded}
        image={media.image}
        ref={ref}
        width={width}
        height={height}
      />
    )
  }

  return 'Error bad media!';
});

Media.displayName = 'Media';

export default Media;