import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface Connection {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  hasAddress: boolean
  connectedAt: string
}

interface SearchResult {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

interface PendingRequest {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  requestId: string
}

const paperTexture = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 27px,
    rgba(232,224,213,0.5) 27px,
    rgba(232,224,213,0.5) 28px
  )`,
}

export default function ConnectionsPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [requested, setRequested] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      api.get('/connections').then((res) => setConnections(res.data.data)),
      api.get('/connections/requests').then((res) => setPendingRequests(res.data.data)),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/users?q=${encodeURIComponent(query)}`)
        setResults(res.data.data ?? [])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [query])

  async function sendRequest(userId: string) {
    try {
      await api.post(`/connections/request/${userId}`)
      setRequested((prev) => new Set(prev).add(userId))
    } catch {
      // already requested or other error — silently ignore
    }
  }

  async function acceptRequest(requestId: string) {
    await api.post(`/connections/accept/${requestId}`)
    const accepted = pendingRequests.find((r) => r.requestId === requestId)
    setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId))
    if (accepted) {
      api.get('/connections').then((res) => setConnections(res.data.data))
    }
  }

  async function declineRequest(requestId: string) {
    await api.post(`/connections/decline/${requestId}`)
    setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId))
  }

  async function togglePrivacy() {
    const newVal = !user?.isPrivate
    await api.post('/connections/privacy', { isPrivate: newVal })
    refreshUser?.()
  }

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const cardStyle = {
    background: 'var(--white)',
    borderRadius: '20px',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-card)',
    padding: '20px',
  }

  const avatarStyle = (size: number) => ({
    width: size, height: size, borderRadius: '50%',
    background: 'var(--lavender-pale)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--lavender-dark)', fontSize: size > 36 ? '14px' : '12px', fontWeight: 600,
    flexShrink: 0,
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Nav */}
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Home
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--ink)' }}>
          Quties
        </h1>
        <div style={{ width: '60px' }} />
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Search */}
        <div style={cardStyle}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>Find someone</p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name..."
            style={{
              width: '100%', padding: '11px 16px', fontSize: '14px',
              borderRadius: '10px', border: '1.5px solid var(--border-default)',
              background: 'var(--white)', color: 'var(--ink)',
              outline: 'none', fontFamily: 'var(--font-body)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
          />
          {searching && (
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '8px' }}>Searching...</p>
          )}
          {results.length > 0 && (
            <ul style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', padding: 0 }}>
              {results.map((u) => (
                <li key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--lavender-pale)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={avatarStyle(36) as React.CSSProperties}>
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : getInitials(u.displayName)}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{u.displayName}</p>
                      <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>@{u.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendRequest(u.id)}
                    disabled={requested.has(u.id)}
                    style={{
                      fontSize: '12px', fontWeight: 500, padding: '6px 14px',
                      borderRadius: '50px', border: 'none', cursor: requested.has(u.id) ? 'default' : 'pointer',
                      background: requested.has(u.id) ? 'var(--lavender-pale)' : 'var(--lavender)',
                      color: requested.has(u.id) ? 'var(--ink-muted)' : '#fff',
                      fontFamily: 'var(--font-body)', transition: 'background 0.15s',
                    }}
                  >
                    {requested.has(u.id) ? 'Requested' : 'Connect'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && !searching && results.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '8px' }}>No one found. Maybe invite them?</p>
          )}
        </div>

        {/* Privacy toggle */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
              {user?.isPrivate ? 'Private profile' : 'Public profile'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              {user?.isPrivate
                ? 'People need your approval to connect'
                : 'Anyone can connect with you automatically'}
            </p>
          </div>
          <button
            onClick={togglePrivacy}
            style={{
              padding: '6px 14px', fontSize: '12px', fontWeight: 500,
              borderRadius: '50px', border: '1.5px solid var(--lavender-light)',
              background: user?.isPrivate ? 'var(--lavender)' : 'var(--white)',
              color: user?.isPrivate ? '#fff' : 'var(--lavender-dark)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            {user?.isPrivate ? 'Private' : 'Public'}
          </button>
        </div>

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div style={cardStyle}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>
              Pending requests ({pendingRequests.length})
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
              {pendingRequests.map((r) => (
                <li key={r.requestId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={avatarStyle(36) as React.CSSProperties}>
                      {r.avatarUrl
                        ? <img src={r.avatarUrl} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : getInitials(r.displayName)}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{r.displayName}</p>
                      <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>@{r.username}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => acceptRequest(r.requestId)}
                      style={{
                        fontSize: '12px', fontWeight: 500, padding: '6px 14px',
                        borderRadius: '50px', border: 'none', cursor: 'pointer',
                        background: 'var(--lavender)', color: '#fff',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineRequest(r.requestId)}
                      style={{
                        fontSize: '12px', fontWeight: 500, padding: '6px 14px',
                        borderRadius: '50px', border: '1.5px solid var(--border-default)',
                        background: 'var(--white)', color: 'var(--ink-muted)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Connections list */}
        <div style={{ ...cardStyle, ...paperTexture }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '16px' }}>
            Quties {!loading && `(${connections.length})`}
          </p>
          {loading && <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', padding: '16px 0' }}>Loading...</p>}
          {!loading && connections.length === 0 && (
            <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '16px 0', fontFamily: 'var(--font-handwriting)', fontSize: '17px' }}>
              No connections yet. Search above to find someone.
            </p>
          )}
          {!loading && connections.length > 0 && (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
              {connections.map((c) => (
                <li key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={avatarStyle(40) as React.CSSProperties}>
                      {c.avatarUrl
                        ? <img src={c.avatarUrl} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                        : getInitials(c.displayName)}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{c.displayName}</p>
                      <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>@{c.username}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!c.hasAddress && (
                      <span style={{ fontSize: '11px', color: '#C9868D', fontWeight: 500 }}>no address</span>
                    )}
                    <button
                      onClick={() => navigate(`/send?to=${c.id}`)}
                      disabled={!c.hasAddress}
                      style={{
                        fontSize: '12px', fontWeight: 500, padding: '6px 14px',
                        borderRadius: '50px', border: 'none',
                        cursor: c.hasAddress ? 'pointer' : 'default',
                        background: c.hasAddress ? 'var(--lavender)' : 'var(--lavender-pale)',
                        color: c.hasAddress ? '#fff' : 'var(--ink-muted)',
                        fontFamily: 'var(--font-body)', transition: 'background 0.15s',
                      }}
                    >
                      Send Qute
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
