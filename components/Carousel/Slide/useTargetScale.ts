import { RefObject, useEffect, useMemo, useState } from "react";

const useTargetScale = ({ startSizeRef, targetSizeRef }: { startSizeRef: RefObject<HTMLElement>, targetSizeRef: RefObject<HTMLElement> }) => {
  const [target, setTarget] = useState(0);

  useEffect(() => {
    if (!startSizeRef.current || !targetSizeRef.current) {
      return undefined;
    }

    const { clientWidth: width, clientHeight: height } = startSizeRef.current;

    const targetWidth = targetSizeRef.current.clientWidth;
    const targetHeight = targetSizeRef.current.clientHeight;

    const heightScale = targetHeight / height;
    const widthScale = targetWidth / width;

    setTarget(Math.min(heightScale, widthScale));
  }, [startSizeRef, targetSizeRef]);

  return target;
}

export default useTargetScale;