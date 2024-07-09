import * as Index from './index';
import styles from './About.module.css';
import content from '../content/about.json';

const About = () => {
  return (
    <div className={styles.column}>
      <article className={styles.bio}>
        <span dangerouslySetInnerHTML={{ __html: content.bio}} />
        <a className={styles.link} target="_blank" href="mailto:mls@mirkalaurasevera.com">Work Enquiries</a>
        <a className={styles.link} target="_blank" href="mailto:contact@mirkalaurasevera.com">Press Enquiries</a>
        <a className={styles.link} target="_blank" href="https://www.instagram.com/mirkalaurasevera">Instagram</a>
      </article>
      <article className={styles.clients}>
        <h2 className={styles.heading}>Selected clients</h2>
        <p>
          {content.clients}
        </p>
      </article>
      <article className={styles.exhibitions}>
        <h2 className={styles.heading}>Selected exhibitions</h2>
        <p>
          {content.exhibitions}
        </p>
      </article>
      <article className={styles.exhibitions}>
        <h2 className={styles.heading}>Selected Talks & Lectures</h2>
        <p>
          {content.talks}
        </p>
      </article>
    </div>
  );
}

export default About;

export const getStaticProps = Index.getStaticProps;
