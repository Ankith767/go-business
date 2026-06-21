import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import styles from './LoginPage.module.css'

const LOGIN_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignIn() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (res.ok && json.data?.token) {
        Cookies.set('jwt_token', json.data.token)
        navigate('/')
      } else {
        setError(json.message || 'Invalid email or password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>Go Business</div>
        <p className={styles.tagline}>Sign in to open your referral dashboard.</p>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className={styles.error} role="alert">{error}</div>
        )}

        <button
          className={styles.btn}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}