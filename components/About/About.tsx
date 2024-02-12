import styles from './About.module.css';

type AboutProps = {
  className: string;
}

const About = ({ className }: AboutProps) => {
  return (
    <main className={className}>
      <article className={styles.bio}>
        <p>...is a conceptual artist working across Photography, Video and Creative Direction.</p>
        <p>She is based in Amsterdam / Paris and is represented globally by DMB.</p>
        <a className={styles.link} href="mailto:mls@mirkalaurasevera.com">mls@mirkalaurasevera.com</a>
        <a className={styles.link} href="https://www.instagram.com/mirkalaurasevera">Instagram</a>
      </article>
      <article className={styles.clients}>
        <h2 className={styles.heading}>Selected clients</h2>
        <p>
          Apple, AnOther Magazine, COS, Hermès, Louis Vuitton, NIKE, Margiela, Mac Guffin Magazine, Paul Smith, The New Yorker, VICE, Vogue, WIRED, ZEIT.
        </p>
      </article>
      <article className={styles.exhibitions}>
        <h2 className={styles.heading}>Selected exhibitions</h2>
        <p>
          {`Nieuwe Instituut, Rotterdam 2022, Marséll Paradise, Milan 2022, Photo Élysée, Lausanne 2019, Black Iris, Berlin 2018, Chamber, New York 2016, Austin Center for Photography, Austin Texas 2014, pavlov's dog, Berlin 2014, Signal Gallery, New York 2013.`}
        </p>
      </article>
    </main>
  );
}

export default About;