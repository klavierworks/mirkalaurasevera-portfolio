import 'dotenv';
import { processUnprocessedSlide } from "./carousel";
import { safelyProcessJsonFilesAndWrite } from "./utils";
import { processUnprocessedProject } from './projects';


safelyProcessJsonFilesAndWrite('./content/slides', './shared/carousel.json', item => processUnprocessedSlide(item as UnprocessedSlide));
safelyProcessJsonFilesAndWrite('./content/projects', './shared/projects.json', item => processUnprocessedProject(item as UnprocessedProject));

// TEST CODE, REMOVE BEFORE GO LIVE
safelyProcessJsonFilesAndWrite('./content/slides', './shared/projects.json', item => {
  const slide = item as UnprocessedSlide;
  const project: UnprocessedProject = {
    thumbnailSrc: slide.src,
    title: slide.line1,
    order: slide.order,
  }
  return processUnprocessedProject(project)
});