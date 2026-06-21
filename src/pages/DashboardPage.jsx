import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './DashboardPage.module.css'

const BASE_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'
const PAGE_SIZE = 10

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

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const [page, setPage] = useState(1)
  const [referrals, setReferrals] = useState([])
  const [copied, setCopied] = useState({})
  const navigate = useNavigate()
  const searchTimeout = useRef(null)

const fetchReferrals = useCallback(async (q, s) => {
    const token = Cookies.get('jwt_token')
    const params = new URLSearchParams()
    if (q) params.set('search', q)
    if (s) params.set('sort', s)
    const url = `${BASE_URL}${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      let msg = `Error ${res.status}`
      await res.json().then(j => {
        if (j.message) msg = `${j.message} (${res.status})`
      }).catch(() => null)
      throw new Error(msg)
    }
    return res.json()
  }, [])

  // Initial fetch on page load
 useEffect(() => {
    fetchReferrals('', 'desc')
      .then(json => {
        const d = json.data || json
        setData(d)
        setReferrals(d.referrals || [])
        setError('')
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [fetchReferrals])

  // Re-fetch when search or sort changes
  const doFetch = useCallback((q, s) => {
    setPage(1)
    fetchReferrals(q, s)
      .then(json => {
        const d = json.data || json
        setReferrals(d.referrals || [])
      })
      .catch(e => setError(e.message))
  }, [fetchReferrals])

  function handleSearch(val) {
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => doFetch(val, sort), 400)
  }

  function handleSort(val) {
    setSort(val)
    doFetch(search, val)
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(c => ({ ...c, [key]: true }))
      setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 1500)
    })
  }

  // Pagination calculations
  const totalPages = Math.ceil(referrals.length / PAGE_SIZE)
  const paged = referrals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const from = referrals.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, referrals.length)

  // Loading state
  if (loading) return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading your dashboard…</p>
        </div>
      </main>
      <Footer />
    </div>
  )

  // Error state (only if no data at all)
  if (error && !data) return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.errorWrap} role="alert">{error}</div>
      </main>
      <Footer />
    </div>
  )

  const metrics = data?.metrics || []
  const ss = data?.serviceSummary || {}
  const ref = data?.referral || {}

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Referral Dashboard</h1>
            <p className={styles.subtitle}>
              Track your referrals, earnings, and partner activity in one place.
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          {/* Overview */}
          <section className={styles.section} role="region" aria-label="Overview metrics">
            <h2 className={styles.sectionTitle}>Overview</h2>
            <div className={styles.metricsGrid}>
              {metrics.map(m => (
                <div key={m.id} className={styles.metricCard}>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={styles.metricLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Service Summary */}
          <section className={styles.section} aria-label="Service summary">
            <h2 className={styles.sectionTitle}>Service summary</h2>
            <div className={styles.summaryGrid}>
              {[
                ['Service', ss.service],
                ['Your Referrals', ss.yourReferrals],
                ['Active Referrals', ss.activeReferrals],
                ['Total Ref. Earnings', ss.totalRefEarnings],
              ].map(([label, val]) => (
                <div key={label} className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>{label}</span>
                  <span className={styles.summaryValue}>{val ?? '—'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Share Referral */}
          <section className={styles.section} aria-label="Share referral">
            <h2 className={styles.sectionTitle}>Refer friends and earn more</h2>
            <div className={styles.shareCard}>
              <div className={styles.shareRow}>
                <label className={styles.shareLabel}>Your Referral Link</label>
                <div className={styles.shareInputWrap}>
                  <input
                    readOnly
                    className={styles.shareInput}
                    value={ref.link || ''}
                    aria-label="Referral link"
                  />
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(ref.link || '', 'link')}
                  >
                    {copied.link ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className={styles.shareRow}>
                <label className={styles.shareLabel}>Your Referral Code</label>
                <div className={styles.shareInputWrap}>
                  <input
                    readOnly
                    className={styles.shareInput}
                    value={ref.code || ''}
                    aria-label="Referral code"
                  />
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(ref.code || '', 'code')}
                  >
                    {copied.code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* All Referrals Table */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>All referrals</h2>

            <div className={styles.tableControls}>
              <input
                className={styles.searchInput}
                placeholder="Name or service…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                aria-label="Search referrals"
              />
              <label className={styles.sortLabel}>
                Sort by date
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={e => handleSort(e.target.value)}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </label>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        No matching entries
                      </td>
                    </tr>
                  ) : paged.map(row => (
                    <tr
                      key={row.id}
                      className={styles.tableRow}
                      onClick={() => navigate(`/referral/${row.id}`)}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/referral/${row.id}`)}
                      role="button"
                      aria-label={`View referral for ${row.name}`}
                    >
                      <td>{row.name}</td>
                      <td>{row.serviceName}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>{formatProfit(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Showing {from}–{to} of {referrals.length} entries
              </span>
              <div className={styles.pageButtons}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>

          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}