import Carousel from "../components/Carousel";
import styles from './index.module.css';

export default function Home() {
  return (
    <main className={styles.info}>
      <h1 className={styles.title}>Mirka Laura Severa</h1>
      <article className={styles.bio}>
        <p>Mirka Laura Severa is a conceptual artist working across Photography, Video and Creative Direction.</p>
        <p>She is based in Amsterdam / Paris and is represented globally by DMB.</p>
        <a href="mailto:mls@mirkalaurasevera.com">mls@mirkalaurasevera.com</a>
        <a href="https://www.instagram.com/mirkalaurasevera">Instagram</a>
      </article>
      <article className={styles.clients}>
        <h2>Selected clients</h2>
        <p>
          Apple, AnOther Magazine, COS, Hermès, Louis Vuitton, NIKE, Margiela, Mac Guffin Magazine, Paul Smith, The New Yorker, VICE, Vogue, WIRED, ZEIT.
        </p>
      </article>
      <article className={styles.exhibitions}>
        <h2>Selected exhibitions</h2>
        <p>
          Nieuwe Instituut, Rotterdam 2022, Marséll Paradise, Milan 2022, Photo Élysée, Lausanne 2019, Black Iris, Berlin 2018, Chamber, New York 2016, Austin Center for Photography, Austin Texas 2014, pavlov's dog, Berlin 2014, Signal Gallery, New York 2013.
        </p>
      </article>
      <Carousel os />
    </main>
  );
}
