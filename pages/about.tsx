import * as Index from './index';
import styles from './About.module.css';
import content from '../content/about.json';

const About = () => {
  // Replace all heading tags (h1-h6) in string with h2
  const aboutWithStandardisedHeadings = content.information.replace(/<h[1-6]>/g, '<h2>').replace(/<\/h[1-6]>/g, '</h2>');

  return (
    <div className={styles.column}>
      <article className={styles.bio}>
        <span dangerouslySetInnerHTML={{ __html: content.bio}} />
        <a className={styles.link} target="_blank" href="mailto:mls@mirkalaurasevera.com">Work Enquiries</a>
        <a className={styles.link} target="_blank" href="mailto:contact@mirkalaurasevera.com">Press Enquiries</a>
        <a className={styles.link} target="_blank" href="https://www.instagram.com/mirkalaurasevera">Instagram</a>
      </article>
      <article className={styles.about} dangerouslySetInnerHTML={{__html: aboutWithStandardisedHeadings}} />
    </div>
  );
}

export default About;
