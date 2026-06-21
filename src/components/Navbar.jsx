import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()

  function handleLogout() {
    Cookies.remove('jwt_token')
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Go to dashboard home">
          Go Business
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link to="/" className={styles.navLink}>Home</Link>
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}