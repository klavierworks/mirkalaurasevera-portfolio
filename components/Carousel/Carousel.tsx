import Slide from "./Slide/Slide"
import slides from '../../shared/carousel.json';

type CarouselProps = {
  activeSlideIndex: number;
  isCarouselVisible: boolean;
}


const Carousel = ({ activeSlideIndex, isCarouselVisible}: CarouselProps ) => {
  const totalSlides = slides.length;

  return slides.map((slide, index) => (
    <Slide
      index={index}
      key={slide.media.image.src}
      slide={slide}
      isActive={activeSlideIndex === index}
      isCarouselVisible={isCarouselVisible}
      isPreviouslyActive={
        activeSlideIndex === index + 2
        || activeSlideIndex === index + 1
        || activeSlideIndex === 0 && index === totalSlides - 2
        || activeSlideIndex === 0 && index === totalSlides - 1
        || activeSlideIndex === 1 && index === totalSlides - 1}
      zIndex={activeSlideIndex < 4 && index < 4 ? index + totalSlides : index}
    />
  ));
}

export default Carousel;