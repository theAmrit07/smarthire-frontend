import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApplications, analyzeApplication, updateApplication } from '../services/api'

export default function ApplicationDetail() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [cvText, setCvText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchApplication()
  }, [])

  const fetchApplication = async () => {
    try {
      const res = await getApplications()
      const app = res.data.find(a => a.id === parseInt(id))
      if (app) setApplication(app)
      else navigate('/dashboard')
    } catch (err) {
      navigate('/dashboard')
    }
  }

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      setError('Please paste your CV text first')
      return
    }
    setAnalyzing(true)
    setError('')
    try {
      const res = await analyzeApplication(id, cvText)
      setApplication(prev => ({
        ...prev,
        ai_feedback: res.data.feedback,
        ai_match_score: res.data.match_score
      }))
    } catch (err) {
      setError('AI analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await updateApplication(id, { ...application, status: newStatus })
      setApplication(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      setError('Failed to update status')
    }
  }

  if (!application) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.title}>{application.role} at {application.company_name}</h2>
      </div>

      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Application Details</h3>
            <div style={styles.detail}><span style={styles.label}>Company:</span> {application.company_name}</div>
            <div style={styles.detail}><span style={styles.label}>Role:</span> {application.role}</div>
            <div style={styles.detail}><span style={styles.label}>Date Applied:</span> {application.date_applied}</div>
            <div style={styles.detail}>
              <span style={styles.label}>Status:</span>
              <select
                style={styles.select}
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {application.job_description && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Job Description</h3>
              <p style={styles.text}>{application.job_description}</p>
            </div>
          )}
        </div>

        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>AI CV Analysis</h3>
            {application.ai_match_score && (
              <div style={styles.scoreBox}>
                <div style={styles.scoreNumber}>{application.ai_match_score}%</div>
                <div style={styles.scoreLabel}>Match Score</div>
              </div>
            )}
            {application.ai_feedback && (
              <pre style={styles.feedback}>{application.ai_feedback}</pre>
            )}
            <textarea
              style={styles.textarea}
              placeholder="Paste your CV text here to get AI analysis..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={styles.analyzeBtn}
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing...' : '🤖 Analyze with AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  backBtn: { padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  title: { color: '#333', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { color: '#2563eb', marginBottom: '16px', marginTop: 0 },
  detail: { marginBottom: '12px', fontSize: '14px' },
  label: { fontWeight: '600', color: '#666', marginRight: '8px' },
  select: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', marginLeft: '8px' },
  text: { fontSize: '14px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  scoreBox: { textAlign: 'center', padding: '20px', background: '#f0f7ff', borderRadius: '12px', marginBottom: '16px' },
  scoreNumber: { fontSize: '48px', fontWeight: 'bold', color: '#2563eb' },
  scoreLabel: { color: '#666', marginTop: '4px' },
  feedback: { background: '#f8f9fa', padding: '16px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px', overflow: 'auto' },
  textarea: { width: '100%', height: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '12px' },
  analyzeBtn: { width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '12px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }
}