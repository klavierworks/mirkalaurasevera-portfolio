import { SlideType } from "@/pages";
import { RefObject } from "react";

const useTargetScale = ({ startSizeRef, targetSizeRef }: { startSizeRef: RefObject<HTMLElement>, targetSizeRef: RefObject<HTMLElement> }) => {
  if (!startSizeRef.current || !targetSizeRef.current) {
    return;
  }

  const { clientWidth: width, clientHeight: height } = startSizeRef.current;
  const isImageLandscape = width > height;

  const targetWidth = targetSizeRef.current.clientWidth;
  const targetHeight = targetSizeRef.current.clientHeight;

  const heightScale = targetHeight / height;
  const widthScale = targetWidth / width;
  console.log(heightScale, widthScale)
  return Math.min(heightScale, widthScale);
}

export default useTargetScale;