import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface AddressData {
  line1: string
  line2: string
  city: string
  state: string
  zip: string
  country: string
}

export default function AddressPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<AddressData>({ line1: '', line2: '', city: '', state: '', zip: '', country: 'US' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/address/me').then((res) => {
      if (res.data.data) {
        const a = res.data.data
        setForm({ line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, zip: a.zip, country: a.country })
      }
    }).finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      await api.post('/address', form)
      setSaved(true)
      setTimeout(() => navigate('/home'), 1200)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', fontSize: '14px',
    borderRadius: '10px', border: '1.5px solid var(--border-default)',
    background: 'var(--white)', color: 'var(--ink)',
    outline: 'none', fontFamily: 'var(--font-body)',
  }

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: 'var(--ink)', marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Nav */}
      <nav style={{
        background: 'var(--white)', borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Home
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--ink)' }}>
          My Address
        </h1>
        <div style={{ width: '60px' }} />
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Explanation */}
        <div style={{
          background: 'var(--lavender-pale)', borderRadius: '16px',
          border: '1px solid var(--lavender-light)', padding: '16px 20px', marginBottom: '24px',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--lavender-deep)', lineHeight: 1.6 }}>
            Your address is how your Quties send you physical notes. It's stored privately and only used for mailing.
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px', padding: '40px 0' }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'var(--white)', borderRadius: '20px',
              border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
            }}>

              {error && (
                <div style={{ background: 'var(--error-pale)', border: '1px solid rgba(224,78,107,0.3)', color: 'var(--error)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              {saved && (
                <div style={{ background: '#EBF2E9', border: '1px solid #B5C9B0', color: '#6B9265', borderRadius: '10px', padding: '12px 16px', fontSize: '14px' }}>
                  Address saved!
                </div>
              )}

              <div>
                <label style={labelStyle}>Street address</label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Apt, suite, etc. <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="Apt 4B"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  placeholder="Austin"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>State</label>
                  <input
                    type="text"
                    placeholder="TX"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>ZIP code</label>
                  <input
                    type="text"
                    placeholder="78701"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', marginTop: '16px', padding: '14px 24px', fontSize: '15px', fontWeight: 500,
                borderRadius: '50px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? 'var(--lavender-light)' : 'var(--lavender)',
                color: '#fff', boxShadow: saving ? 'none' : 'var(--shadow-button)',
                fontFamily: 'var(--font-body)', transition: 'background 0.15s',
              }}
            >
              {saving ? 'Saving...' : 'Save address'}
            </button>

            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', textAlign: 'center', marginTop: '12px' }}>
              US addresses only for now. More countries coming soon.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
