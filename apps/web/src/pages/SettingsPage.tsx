import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const cardStyle = {
  background: 'var(--white)',
  borderRadius: '20px',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-card)',
  padding: '20px',
}

const inputStyle = {
  width: '100%', padding: '11px 16px', fontSize: '14px',
  borderRadius: '10px', border: '1.5px solid var(--border-default)',
  background: 'var(--white)', color: 'var(--ink)',
  outline: 'none', fontFamily: 'var(--font-body)',
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      await api.put('/users/me', { displayName: displayName.trim() || undefined, bio: bio.trim() || undefined })
      refreshUser()
      setMessage('Saved!')
    } catch {
      setMessage('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--ink)' }}>
          Settings
        </h1>
        <div style={{ width: '60px' }} />
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardStyle}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>Display Name</p>
          <input
            style={inputStyle}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
          />

          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px', marginTop: '16px' }}>Bio</p>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            placeholder="A little about you..."
          />

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: '16px', width: '100%', padding: '12px', fontSize: '14px', fontWeight: 500,
              borderRadius: '50px', border: 'none', cursor: saving ? 'default' : 'pointer',
              background: 'var(--lavender)', color: '#fff',
              fontFamily: 'var(--font-body)',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {message && <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', marginTop: '8px' }}>{message}</p>}
        </div>
      </div>
    </div>
  )
}
