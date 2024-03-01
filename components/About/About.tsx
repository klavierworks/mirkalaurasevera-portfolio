import styles from './About.module.css';

type AboutProps = {
  className: string;
}

const About = ({ className }: AboutProps) => {
  return (
    <main className={className}>
      <article className={styles.bio}>
        <p>..is a conceptual artist working across Photography, Video, Set Design, and Creative Direction. </p>
        <p>With nearly two decades of expertise, she serves as a senior Creative on campaigns, crafting innovative narratives and concepts that bring a fresh perspective to the advertising industry.  </p>
        <p>She has showcased her work in exhibitions in Milan, Berlin, and Austin, Texas.</p>
        <p>Her unique ability to bridge the gap between the art and commercial market has garnered recognition worldwide. In 2015, she graduated from the Gerrit Rietveld Academie (Sandberg Institute) with a Master in Applied Arts and simultaneously received the prestigious ADC Young Gun Award for her commercial practice. </p>
        <p>Currently based in Amsterdam and Paris, she is represented globally by DMB.</p>
        <p>© All images are copyrighted and owned by Mirka Laura Severa.</p>
        <a className={styles.link} target="_blank" href="mailto:mls@mirkalaurasevera.com">Work Enquiries</a>
        <a className={styles.link} target="_blank" href="mailto:contact@mirkalaurasevera.com">Press Enquiries</a>
        <a className={styles.link} target="_blank" href="https://www.instagram.com/mirkalaurasevera">Instagram</a>
      </article>
      <article className={styles.clients}>
        <h2 className={styles.heading}>Selected clients</h2>
        <p>
          {`Apple, AnOther Magazine, Hermès, Lacoste, It's Nice That, Louis Vuitton, M Le Magazine du Monde, Margiela, MacGuffin Magazine, Nike, Paul Smith, Prada, The New Yorker, VICE, Vogue, WIRED, ZEIT.`}
        </p>
      </article>
      <article className={styles.exhibitions}>
        <h2 className={styles.heading}>Selected exhibitions</h2>
        <p>
          {`Nieuwe Instituut, Rotterdam 2022, Marséll Paradise, Milan 2022, Photo Élysée, Lausanne 2019, Black Iris, Berlin 2018, Chamber, New York 2016, Austin Center for Photography, Austin Texas 2014, pavlov's dog, Berlin 2014, Signal Gallery, New York 2013.`}
        </p>
      </article>
      <article className={styles.exhibitions}>
        <h2 className={styles.heading}>Selected Talks & Lectures</h2>
        <p>
          {`Nicer Tuesdays, (It's Nice That, Oval Space, London), Crossroads (Lukas Feireiss, Soho House, Berlin), FF (Random Studio, Amsterdam), MD Talk (Mother, London), Capture One (Copenhagen) Jury Member ADC young Guns (ACD Club, New York)`}
        </p>
      </article>
    </main>
  );
}

export default About;