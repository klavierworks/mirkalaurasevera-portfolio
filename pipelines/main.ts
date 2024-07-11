import dotenv from 'dotenv'
dotenv.config()

import { processUnprocessedSlide } from "./carousel";
import { safelyProcessJsonFilesAndWrite } from "./utils";
import { processUnprocessedProject } from './projects';

safelyProcessJsonFilesAndWrite('./content/slides', './shared/carousel.json', item => processUnprocessedSlide(item as UnprocessedSlide));
safelyProcessJsonFilesAndWrite('./content/projects', './shared/projects.json', item => processUnprocessedProject(item as UnprocessedProject));