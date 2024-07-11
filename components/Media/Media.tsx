import { CSSProperties, ForwardedRef, forwardRef } from "react";
import CustomImage from "../CustomImage/CustomImage";
import CustomVideo from "../CustomVideo/CustomVideo";

type MediaProps = {
  className: string;
  media: MediaObject;
  isActive: boolean;
  style?: CSSProperties;
}

const Media = forwardRef(({
  className,
  media,
  isActive,
  style
}: MediaProps, ref: ForwardedRef<HTMLImageElement | HTMLVideoElement>) => {

  if (media?.video) {
    return (
      <CustomVideo
        className={className}
        fallback={media.image}
        isActive={isActive}
        ref={ref}
        style={style}
        video={media.video}
      />
    )
  }

  if (media?.image) {
    return (
      <CustomImage
        className={className}
        image={media.image}
        ref={ref}
        style={style}
      />
    )
  }

  return 'Error bad media!';
});

Media.displayName = 'Media';

export default Media;