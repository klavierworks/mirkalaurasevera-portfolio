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
    description: `
      <p>Sweet Dreams explores the relationship between two objects we all know and need to survive:</p>
      <p>Cakes and Mattresses -
      This projects is revealing their visual and psychological bond: eating and sleeping two essentials humans need – and the right balance – as too much of it won’t be good for us either.</p>
      <p>Creative Direction, Photography, Concept, Set Design</p>
    `,
    order: slide.order,
    slug: slide.src.replaceAll('.', '').replaceAll('/', ''),
  }
  return processUnprocessedProject(project)
});