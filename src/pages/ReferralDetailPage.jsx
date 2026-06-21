import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './ReferralDetailPage.module.css'

const BASE_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'

function formatDate(iso) {
  return iso ? iso.replace(/-/g, '/') : ''
}

function formatProfit(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val)
}

export default function ReferralDetailPage() {
  const { id } = useParams()
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const token = Cookies.get('jwt_token')
    fetch(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => {
        const d = json.data
        let found = null
        if (d) {
          if (d.id !== undefined) {
            // API returned the row directly inside data
            found = String(d.id) === String(id) ? d : null
          } else if (Array.isArray(d.referrals)) {
            // API returned referrals array, find by id
            found = d.referrals.find(r => String(r.id) === String(id)) || null
          }
        }
        if (found) {
          setRow(found)
        } else {
          setNotFound(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading referral…</p>
        </div>
      </main>
      <Footer />
    </div>
  )

  if (notFound || !row) return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>Referral not found</h1>
            <p>The referral you're looking for doesn't exist or couldn't be loaded.</p>
            <Link to="/" className={styles.backLink}>← Back to dashboard</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Link to="/" className={styles.backLink}>← Back to dashboard</Link>
          <div className={styles.card}>
            <h1 className={styles.title}>Referral Details</h1>
            <h2 className={styles.name}>{row.name}</h2>
            <dl className={styles.dl}>
              <div className={styles.dlRow}>
                <dt>Referral ID</dt>
                <dd>{row.id}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Service Name</dt>
                <dd>{row.serviceName}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Date</dt>
                <dd>{formatDate(row.date)}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Profit</dt>
                <dd>{formatProfit(row.profit)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}