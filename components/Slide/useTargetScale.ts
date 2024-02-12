import { RefObject, useMemo } from "react";

const useTargetScale = ({ startSizeRef, targetSizeRef }: { startSizeRef: RefObject<HTMLElement>, targetSizeRef: RefObject<HTMLElement> }) => {
  if (!startSizeRef.current || !targetSizeRef.current) {
    return 1;
  }

  const { clientWidth: width, clientHeight: height } = startSizeRef.current;

  const targetWidth = targetSizeRef.current.clientWidth;
  const targetHeight = targetSizeRef.current.clientHeight;

  const heightScale = targetHeight / height;
  const widthScale = targetWidth / width;

  return Math.min(heightScale, widthScale);
}

export default useTargetScale;