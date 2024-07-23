import { CYPRESS } from '@/shared/cypress';
import styles from './Title.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

type TitleProps = {
  activeSlideIndex: number;
}

const Title = ({ activeSlideIndex }: TitleProps) => {
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <nav className={styles.titleContainer}>
      <h1 className={styles.title} onClick={() => router.push(`/${activeSlideIndex}`)} data-cy={CYPRESS.PAGE_TOGGLE_LINK}>Mirka Laura Severa</h1>
      <div className={styles.menu}>
        <Link href="/projects" className={currentRoute === '/projects' ? styles.isActive : ''} data-cy={CYPRESS.PAGE_TOGGLE_LINK}>Projects</Link>
        <Link href="/about" className={currentRoute === '/about' ? styles.isActive : ''} data-cy={CYPRESS.PAGE_TOGGLE_LINK}>About</Link>
      </div>
    </nav>
  )
}

export default Title;