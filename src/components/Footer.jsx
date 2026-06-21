import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>Go Business</span>
        <nav className={styles.nav} aria-label="Footer">
          <a href="#">About</a>
          <a href="#">Privacy</a>
        </nav>
        <span className={styles.copy}>© 2024 Go Business</span>
      </div>
    </footer>
  )
}