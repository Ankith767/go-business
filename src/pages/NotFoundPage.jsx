import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>Sorry, the page you're looking for doesn't exist.</p>
        <Link to="/" className={styles.back}>Back to dashboard</Link>
      </div>
    </div>
  )
}