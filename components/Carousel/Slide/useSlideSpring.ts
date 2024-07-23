import { useSpring } from "@react-spring/web";
import { useMemo } from "react";

type UseSlideSpringProps = {
  activeSlideIndex: number,
  index: number,
  isActive: boolean,
  isPreviouslyActive: boolean,
  setIsFocused: (isFocused: boolean) => void,
  totalSlides: number
}
const useSlideSpring = ({
  activeSlideIndex,
  index,
  isActive,
  isPreviouslyActive,
  setIsFocused,
  totalSlides
}: UseSlideSpringProps) => {
  const zIndex = useMemo(() => {
    if (activeSlideIndex < 4 && index < 4) {
      return index + totalSlides;
    }
    return index;
  }, [activeSlideIndex, index, totalSlides]);

  const rotate = useMemo(() => {
    if (isPreviouslyActive) {
      return 1080;
    }
    if (isActive) {
      return 720;
    }
    return 0;
  }, [isActive, isPreviouslyActive]);

  const scale = useMemo(() => {
    if (isPreviouslyActive) {
      return 1;
    }
    if (isActive) {
      return 1;
    }
    return 0;
  }, [isActive, isPreviouslyActive]);

  const [spring] = useSpring({
    delay: isActive ? 350 : 0,
    zIndex,
    scale,
    rotate,
    immediate: (key: string) => key === 'zIndex',
    onStart: () => {
      setIsFocused(false);
    },
    onRest: () => {
      setIsFocused(isActive);
    },
  }, [index, zIndex, scale, rotate]);

  return spring;
}

export default useSlideSpring;