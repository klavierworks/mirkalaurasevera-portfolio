import { useMemo } from "react";
import useWindowSize from "./useWindowSize";

const useMaximumScalingFactor = (imageAspectRatio: number): number => {
  const { windowHeight, windowWidth } = useWindowSize();
  return useMemo(() => {
    const screenWidth = windowWidth;
    const screenHeight = windowHeight;
    const screenAspectRatio = screenWidth / screenHeight;

    let scalingFactor: number;

    if (imageAspectRatio > screenAspectRatio) {
      // Image is wider than screen relative to their heights. 
      // Scale up based on height ratio.
      scalingFactor = screenHeight * imageAspectRatio / screenWidth;
    } else {
      // Image is narrower than screen relative to their widths, or they are equal. 
      // Scale up based on width ratio.
      scalingFactor = screenWidth / (screenHeight * imageAspectRatio);
    }

    // Ensure scaling factor enlarges the image sufficiently
    return Math.max(1, scalingFactor); // Ensure we don't scale down the image
  }, [imageAspectRatio, windowHeight, windowWidth]);
};

export default useMaximumScalingFactor;