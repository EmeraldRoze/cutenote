import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function InvitePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [sentName, setSentName] = useState('')

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    setLoading(true)
    try {
      await api.post('/invites', { name, phone: digits })
      setSentName(name)
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px', fontSize: '15px',
    borderRadius: '12px', border: '1.5px solid var(--border-default)',
    background: 'var(--white)', color: 'var(--ink)',
    outline: 'none', fontFamily: 'var(--font-body)',
  }

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💌</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
            Text sent!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            We texted {sentName} a link to share their mailing address. Once they fill it in, you'll be able to send them a QuteNote!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => { setSent(false); setName(''); setPhone('') }}
              style={{
                padding: '14px 24px', fontSize: '15px', fontWeight: 500,
                borderRadius: '50px', border: 'none', cursor: 'pointer',
                background: 'var(--lavender)', color: '#fff',
                fontFamily: 'var(--font-body)',
              }}
            >
              Invite another Qutie
            </button>
            <button
              onClick={() => navigate('/home')}
              style={{
                padding: '12px 24px', fontSize: '14px', fontWeight: 500,
                borderRadius: '50px', border: '1.5px solid var(--lavender-light)',
                background: 'var(--white)', color: 'var(--lavender-dark)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Home
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--ink)' }}>
          Invite a Qutie
        </h1>
        <div style={{ width: '60px' }} />
      </nav>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          background: 'var(--white)', borderRadius: '20px',
          border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
          padding: '28px 24px',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Enter your friend's name and phone number. We'll text them a link to share their mailing address so you can send them a QuteNote!
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px', display: 'block' }}>
                Their name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px', display: 'block' }}>
                Their phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(555) 123-4567"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#C9868D', textAlign: 'center' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || phone.replace(/\D/g, '').length < 10}
              style={{
                padding: '16px 24px', fontSize: '15px', fontWeight: 500,
                borderRadius: '50px', border: 'none', cursor: loading ? 'default' : 'pointer',
                background: loading ? 'var(--lavender-pale)' : 'var(--lavender)',
                color: '#fff', fontFamily: 'var(--font-body)',
                marginTop: '4px', transition: 'background 0.15s',
              }}
            >
              {loading ? 'Sending...' : 'Send invite text'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
