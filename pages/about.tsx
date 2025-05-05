import styles from './About.module.css';
import { getAboutPage, getProjects, getSlides } from '@/utils/api';

type AboutProps = {
  about: {
    bio: string;
    information: string;
  };
};

const About = ({ about }: AboutProps) => {
  // Replace all heading tags (h1-h6) in string with h2
  const aboutWithStandardisedHeadings = about.information.replace(/<h[1-6]>/g, '<h2>').replace(/<\/h[1-6]>/g, '</h2>');

  return (
    <div className={styles.column}>
      <article className={styles.bio}>
        <span dangerouslySetInnerHTML={{ __html: about.bio}} />
        <a className={styles.link} target="_blank" href="mailto:mls@mirkalaurasevera.com">Work Enquiries</a>
        <a className={styles.link} target="_blank" href="mailto:contact@mirkalaurasevera.com">Press Enquiries</a>
        <a className={styles.link} target="_blank" href="https://www.instagram.com/mirkalaurasevera">Instagram</a>
      </article>
      <article className={styles.about} dangerouslySetInnerHTML={{__html: aboutWithStandardisedHeadings}} />
    </div>
  );
}

export const getStaticProps = async () => {
  const slides = await getSlides(true)
  const projects = await getProjects(true)
  const about = await getAboutPage()

  return {
    props: {
      about,
      projects,
      slides
    }
  };
};


export default About;
