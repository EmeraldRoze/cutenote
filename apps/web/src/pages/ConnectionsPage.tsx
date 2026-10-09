import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import TabBar from '../components/TabBar'
import QEmoji from '../components/QEmoji'
import { inviteByText } from '../lib/inviteText'

// "Your QTs" — layout from the App Screens board, rendered in the Oct 2026 system

const uv = '#5A32D6'
const label: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-mid)' }

interface Connection {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  hasAddress: boolean
  connectedAt: string
}
interface SearchResult { id: string; username: string; displayName: string; avatarUrl: string | null }
interface PendingRequest { id: string; username: string; displayName: string; avatarUrl: string | null; requestId: string }
interface ImportantDate { id: string; connectionName: string; label: string; month: number; day: number }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ConnectionsPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [requested, setRequested] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      api.get('/connections').then((res) => setConnections(res.data.data)),
      api.get('/connections/requests').then((res) => setPendingRequests(res.data.data)),
      api.get('/important-dates').then((res) => setDates(res.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      const res = await api.get(`/users?q=${encodeURIComponent(query)}`)
      setResults(res.data.data)
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  async function sendRequest(userId: string) {
    await api.post(`/connections/request/${userId}`)
    setRequested(new Set([...requested, userId]))
  }
  async function acceptRequest(requestId: string) {
    await api.post(`/connections/accept/${requestId}`)
    setPendingRequests((p) => p.filter((r) => r.requestId !== requestId))
    api.get('/connections').then((res) => setConnections(res.data.data))
  }
  async function declineRequest(requestId: string) {
    await api.post(`/connections/decline/${requestId}`)
    setPendingRequests((p) => p.filter((r) => r.requestId !== requestId))
  }
  async function removeConnection(userId: string) {
    await api.delete(`/connections/${userId}`)
    setConnections((c) => c.filter((x) => x.id !== userId))
  }
  async function togglePrivacy() {
    await api.post('/connections/privacy', { isPrivate: !user?.isPrivate })
    refreshUser?.()
  }

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const dateFor = useMemo(() => {
    const map = new Map<string, ImportantDate>()
    for (const d of dates) {
      const key = d.connectionName.toLowerCase()
      if (!map.has(key)) map.set(key, d)
    }
    return (name: string) => map.get(name.toLowerCase())
  }, [dates])

  const shownConnections = query.length >= 2
    ? connections.filter((c) => c.displayName.toLowerCase().includes(query.toLowerCase()) || c.username.toLowerCase().includes(query.toLowerCase()))
    : connections

  const rowCard: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px 6px 14px',
    borderRadius: '12px', background: '#fff', border: '1px solid var(--stone)',
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '110px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '28px 24px 0' }}>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Your QTs</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--ink-mid)', margin: '6px 0 14px' }}>The people worth showing up for.</p>

        {/* Invite teaser */}
        <button onClick={() => navigate('/invite')} style={{
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px',
          borderRadius: '14px', background: 'var(--lavender-pale)', border: `1.5px dashed var(--lavender-soft)`,
          cursor: 'pointer', textAlign: 'left', marginBottom: '12px',
        }}>
          <QEmoji name="gift" size={40} />
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', textTransform: 'none', letterSpacing: 0 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Every friend = a free card.</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400, color: 'var(--ink-mid)' }}>You get one, they get one.</span>
          </span>
          <span style={{ color: uv, fontSize: '16px' }}>→</span>
        </button>

        {/* Search + text-a-friend */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search QTs, or find someone new"
          style={{
            width: '100%', height: '46px', padding: '0 14px', borderRadius: '10px',
            border: '1px solid var(--stone)', background: '#fff', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--ink)', flex: 1,
          }}
          onFocus={(e) => { e.target.style.border = `1.5px solid ${uv}` }}
          onBlur={(e) => { e.target.style.border = '1px solid var(--stone)' }}
        />
        <button onClick={() => inviteByText(user?.displayName?.split(' ')[0]).catch(() => navigate('/invite'))} style={{
          height: '46px', padding: '0 12px', borderRadius: '10px', background: '#fff', border: '1px solid var(--stone)',
          color: uv, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px',
          letterSpacing: '0.1em', whiteSpace: 'nowrap',
        }}>Text a friend</button>
        </div>

        {/* People on QuteNote matching search (not yet QTs) */}
        {results.filter((r) => !connections.some((c) => c.id === r.id) && r.id !== user?.id).length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ ...label, marginBottom: '8px' }}>On QuteNote</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.filter((r) => !connections.some((c) => c.id === r.id) && r.id !== user?.id).map((r) => (
                <div key={r.id} style={rowCard}>
                  <span style={{ width: '42px', height: '42px', minWidth: '42px', borderRadius: '21px', background: 'var(--lavender-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '12px' }}>{initials(r.displayName)}</span>
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>{r.displayName}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>@{r.username}</div>
                  </div>
                  <button
                    disabled={requested.has(r.id)}
                    onClick={() => sendRequest(r.id)}
                    style={{
                      height: '34px', padding: '0 12px', borderRadius: '999px', cursor: 'pointer',
                      border: `1.5px solid ${uv}`, background: requested.has(r.id) ? 'var(--lavender-pale)' : '#fff',
                      color: uv, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em',
                    }}
                  >
                    {requested.has(r.id) ? 'Requested' : 'Add QT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ ...label, marginBottom: '8px' }}>Wants to be your QT</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingRequests.map((r) => (
                <div key={r.requestId} style={{ ...rowCard, background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)' }}>
                  <span style={{ width: '42px', height: '42px', minWidth: '42px', borderRadius: '21px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '12px' }}>{initials(r.displayName)}</span>
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>{r.displayName}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>@{r.username}</div>
                  </div>
                  <button onClick={() => acceptRequest(r.requestId)} style={{ height: '34px', padding: '0 12px', borderRadius: '999px', border: 'none', background: uv, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', cursor: 'pointer' }}>Yes</button>
                  <button onClick={() => declineRequest(r.requestId)} style={{ height: '34px', padding: '0 10px', borderRadius: '999px', border: '1px solid var(--stone)', background: '#fff', color: 'var(--ink-mid)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', cursor: 'pointer' }}>No</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QTs list */}
        {loading ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', padding: '20px 0' }}>Fetching your people…</p>
        ) : shownConnections.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', padding: '20px 0' }}>
            {query.length >= 2 ? 'No QTs match that.' : 'No QTs yet. Search for someone above, or send an invite.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shownConnections.map((c) => {
              const d = dateFor(c.displayName)
              return (
                <div key={c.id} style={rowCard}>
                  <button onClick={() => navigate(`/profile/${c.username}`)} style={{
                    flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    textTransform: 'none', letterSpacing: 0, fontWeight: 400,
                  }}>
                    <span style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '24px', background: 'var(--lavender-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--ink)' }}>{initials(c.displayName)}</span>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{c.displayName}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>@{c.username}</span>
                      {d && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)', marginTop: '2px' }}>
                          <QEmoji name={/birth/i.test(d.label) ? 'cake' : 'star'} size={16} />
                          {d.label} {MONTHS[d.month - 1]} {d.day}
                        </span>
                      )}
                    </span>
                  </button>
                  <button onClick={() => navigate(`/send?toName=${encodeURIComponent(c.displayName.split(' ')[0])}`)} aria-label={`Write to ${c.displayName}`} style={{
                    height: '34px', padding: '0 12px', borderRadius: '6px', cursor: 'pointer',
                    background: 'var(--lavender-pale)', border: `1.5px dashed var(--lavender-soft)`, color: uv,
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em',
                  }}>Write</button>
                  <button onClick={() => removeConnection(c.id)} aria-label={`Remove ${c.displayName}`} style={{
                    width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'transparent',
                    color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '15px',
                  }}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Privacy */}
        <div style={{ marginTop: '22px', padding: '14px 16px', borderRadius: '14px', background: '#fff', border: '1px solid var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>Who sees your sends</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>
              {user?.isPrivate ? 'Private: your sends stay off feeds.' : 'Public: your sends show on QT feeds. Messages are never shown.'}
            </div>
          </div>
          <span style={{ display: 'flex', padding: '3px', borderRadius: '10px', background: 'var(--lavender-pale)' }}>
            <button onClick={() => user?.isPrivate || togglePrivacy()} style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '8px', background: user?.isPrivate ? '#fff' : 'transparent', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)', cursor: 'pointer' }}>Private</button>
            <button onClick={() => user?.isPrivate && togglePrivacy()} style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '8px', background: user?.isPrivate ? 'transparent' : '#fff', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)', cursor: 'pointer' }}>Public</button>
          </span>
        </div>
      </div>
      <TabBar />
    </div>
  )
}
