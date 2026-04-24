import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function GoogleAuthSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login?error=google_failed')
      return
    }

    localStorage.setItem('cn_token', token)
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        login(token, res.data.data)
        navigate('/home')
      })
      .catch(() => {
        navigate('/login?error=google_failed')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
      <p style={{ fontSize: '15px', color: 'var(--ink-muted)' }}>Signing you in...</p>
    </div>
  )
}
