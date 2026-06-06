import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApplication } from '../services/api'

export default function AddApplication() {
  const [form, setForm] = useState({
    company_name: '',
    role: '',
    status: 'applied',
    date_applied: new Date().toISOString().split('T')[0],
    job_description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createApplication(form)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to create application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add Application</h2>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Company Name</label>
          <input style={styles.input} name="company_name" value={form.company_name} onChange={handleChange} required />

          <label style={styles.label}>Role</label>
          <input style={styles.input} name="role" value={form.role} onChange={handleChange} required />

          <label style={styles.label}>Status</label>
          <select style={styles.input} name="status" value={form.status} onChange={handleChange}>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          <label style={styles.label}>Date Applied</label>
          <input style={styles.input} type="date" name="date_applied" value={form.date_applied} onChange={handleChange} required />

          <label style={styles.label}>Job Description</label>
          <textarea style={{...styles.input, height: '150px', resize: 'vertical'}} name="job_description" value={form.job_description} onChange={handleChange} placeholder="Paste the job description here..." />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', padding: '24px' },
  card: { background: 'white', padding: '32px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#333', margin: 0 },
  backBtn: { padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '16px' }
}