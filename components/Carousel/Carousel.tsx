import Slide from "./Slide/Slide"

type CarouselProps = {
  activeSlideIndex: number;
  isCarouselVisible: boolean;
  slides: Slide[];
}


const Carousel = ({ activeSlideIndex, isCarouselVisible, slides}: CarouselProps ) => {
  const totalSlides = slides.length;

  return slides.map((slide, index) => (
    <Slide
      index={index}
      key={slide.media.image?.src ?? slide.media.video}
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