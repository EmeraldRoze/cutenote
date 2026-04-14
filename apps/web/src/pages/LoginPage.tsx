import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.data.token, res.data.data.user)
      navigate('/home')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 600, color: 'var(--lavender-deep)', lineHeight: 1.1 }}>
            QuteNote
          </h1>
          <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '20px', color: 'var(--lavender)', marginTop: '6px' }}>
            Send something real.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)',
          borderRadius: '28px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
          padding: '36px 32px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--ink)', marginBottom: '24px' }}>
            Welcome back
          </h2>

          {error && (
            <div style={{ background: 'var(--error-pale)', border: '1px solid rgba(224,78,107,0.3)', color: 'var(--error)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%', padding: '11px 16px', fontSize: '14px',
                  borderRadius: '10px', border: '1.5px solid var(--border-default)',
                  background: 'var(--white)', color: 'var(--ink)',
                  outline: 'none', fontFamily: 'var(--font-body)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%', padding: '11px 16px', fontSize: '14px',
                  borderRadius: '10px', border: '1.5px solid var(--border-default)',
                  background: 'var(--white)', color: 'var(--ink)',
                  outline: 'none', fontFamily: 'var(--font-body)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 24px', fontSize: '15px', fontWeight: 500,
                borderRadius: '50px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'var(--lavender-light)' : 'var(--lavender)',
                color: '#fff', boxShadow: loading ? 'none' : 'var(--shadow-button)',
                fontFamily: 'var(--font-body)', marginTop: '4px',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink-muted)', marginTop: '24px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--lavender-dark)', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
