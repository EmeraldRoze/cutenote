import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import QEmoji from '../components/QEmoji'

// "Invite friends" — App Screens board layout in the Oct 2026 system

const uv = '#5A32D6'

interface Invite { id: string; recipientName: string; status: string; completedAt: string | null }

export default function InvitePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invites, setInvites] = useState<Invite[]>([])
  const [composing, setComposing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentName, setSentName] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/invites').then((r) => setInvites(r.data.data)).catch(() => {})
  }, [])

  const joined = invites.filter((i) => i.status === 'COMPLETED').length

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
      setError('That needs to be a 10-digit phone number.')
      return
    }
    setLoading(true)
    try {
      await api.post('/invites', { name, phone: digits })
      setSentName(name)
      setName('')
      setPhone('')
      setComposing(false)
      api.get('/invites').then((r) => setInvites(r.data.data)).catch(() => {})
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'That did not go through. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'Your friend'

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '14px 24px 0' }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{
          width: '44px', height: '44px', border: 'none', background: 'transparent',
          color: 'var(--ink)', cursor: 'pointer', fontSize: '18px', textAlign: 'left',
        }}>←</button>

        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '14px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <QEmoji name="gift" size={86} style={{ transform: 'rotate(-8deg)' }} />
            <QEmoji name="envelope" size={86} style={{ transform: 'rotate(8deg)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '26px', lineHeight: 1.18, color: 'var(--ink)', margin: '14px 0 0', letterSpacing: '-0.01em' }}>
            Every friend = a free card.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.45, color: 'var(--ink-mid)', margin: '8px 0 18px' }}>
            You get one, they get one. No catch.
          </p>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <div style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#fff', border: '1px solid var(--stone)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>{joined}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>friends joined</div>
            </div>
            <div style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#fff', border: '1px solid var(--stone)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>{joined}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>free cards earned</div>
            </div>
          </div>
        </div>

        {sentName && !composing && (
          <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '12px', background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink)' }}>
            Text sent. {sentName} gets a link to drop in their address, then your card can fly.
          </div>
        )}

        {/* Message preview + actions */}
        <div style={{ marginTop: '22px', borderRadius: '22px', background: '#fff', boxShadow: '0 -4px 24px rgba(43,34,56,0.08), 0 4px 18px rgba(43,34,56,0.06)', padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>Your text will look like this</div>
          <div style={{ alignSelf: 'flex-end', maxWidth: '300px', borderRadius: '18px', overflow: 'hidden', background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)' }}>
            <div style={{ padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.4 }}>
              I saved you a free postcard on QuteNote. Send one to someone you love.
            </div>
            <div style={{ background: '#fff', borderTop: '1px solid var(--lavender-light)' }}>
              <div style={{ height: '72px', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/site/logo-ink.png" alt="QuteNote" style={{ width: '150px' }} />
              </div>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700 }}>{firstName} saved you a free card</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-mid)' }}>qutenote.com</div>
              </div>
            </div>
          </div>

          {composing ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Their first name" required style={{
                width: '100%', height: '48px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--stone)',
                background: '#fff', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--ink)',
              }} />
              <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(555) 123-4567" inputMode="tel" required style={{
                width: '100%', height: '48px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--stone)',
                background: '#fff', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--ink)',
              }} />
              {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--error)' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} style={{
                  flex: 1, height: '52px', border: 'none', borderRadius: '10px', background: uv, color: '#fff',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase',
                  letterSpacing: '0.12em', cursor: 'pointer', opacity: loading ? 0.7 : 1,
                }}>{loading ? 'Sending…' : 'Send the text'}</button>
                <button type="button" onClick={() => setComposing(false)} style={{
                  height: '52px', padding: '0 16px', borderRadius: '10px', border: '1px solid var(--stone)', background: '#fff',
                  color: 'var(--ink-mid)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px',
                  textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer',
                }}>Back</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setComposing(true)} style={{
                flex: 1, height: '52px', border: 'none', borderRadius: '10px', background: uv, color: '#fff',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase',
                letterSpacing: '0.12em', cursor: 'pointer',
              }}>Invite by text</button>
              <button onClick={() => { navigator.clipboard?.writeText('https://qutenote.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{
                height: '52px', padding: '0 16px', borderRadius: '10px', border: '1px solid var(--stone)', background: '#fff',
                color: 'var(--ink)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px',
                textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer',
              }}>{copied ? 'Copied' : 'Copy link'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
