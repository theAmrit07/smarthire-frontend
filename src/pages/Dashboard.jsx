import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats, getApplications, deleteApplication } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        getDashboardStats(),
        getApplications()
      ])
      setStats(statsRes.data)
      setApplications(appsRes.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this application?')) {
      await deleteApplication(id)
      fetchData()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>SmartHire Dashboard</h1>
        <div style={styles.headerRight}>
          <button style={styles.addBtn} onClick={() => navigate('/add')}>+ Add Application</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: '#2563eb' },
          { label: 'Applied', value: stats.applied, color: '#6366f1' },
          { label: 'Interview', value: stats.interview, color: '#f59e0b' },
          { label: 'Offer', value: stats.offer, color: '#10b981' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{...styles.statCard, borderTop: `4px solid ${s.color}`}}>
            <div style={{...styles.statNumber, color: s.color}}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.tableContainer}>
        <h2 style={styles.sectionTitle}>Applications</h2>
        {applications.length === 0 ? (
          <p style={styles.empty}>No applications yet. Add your first one!</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Company', 'Role', 'Status', 'Date', 'AI Score', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} style={styles.tr}>
                  <td style={styles.td}>{app.company_name}</td>
                  <td style={styles.td}>{app.role}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: statusColor(app.status)}}>
                      {app.status}
                    </span>
                  </td>
                  <td style={styles.td}>{app.date_applied}</td>
                  <td style={styles.td}>{app.ai_match_score ? `${app.ai_match_score}%` : '-'}</td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => navigate(`/application/${app.id}`)}>View</button>
                    <button style={{...styles.actionBtn, background: '#ef4444'}} onClick={() => handleDelete(app.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const statusColor = (status) => ({
  applied: '#6366f1', interview: '#f59e0b', offer: '#10b981', rejected: '#ef4444'
}[status] || '#ccc')

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerRight: { display: 'flex', gap: '12px' },
  title: { color: '#2563eb' },
  addBtn: { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  logoutBtn: { padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' },
  statCard: { background: 'white', padding: '20px', borderRadius: '12px', flex: 1, minWidth: '120px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '32px', fontWeight: 'bold' },
  statLabel: { color: '#666', marginTop: '4px' },
  tableContainer: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { marginBottom: '16px', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f0f0f0', color: '#666', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', fontSize: '14px' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px' },
  actionBtn: { padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '12px' },
  empty: { color: '#999', textAlign: 'center', padding: '40px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }
}