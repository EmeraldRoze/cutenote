import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { PROMPTS, OCCASIONS } from '../../lib/prompts'
import QEmoji from '../../components/QEmoji'
import StepRecipient from './StepRecipient'

export interface NoteData {
  recipientId: string
  recipientName: string
  occasionType: string
  cardDesignType: 'ARTIST' | 'USER_UPLOAD'
  cardDesignId?: string
  cardImageUrl?: string
  noteText: string
  toneUsed: string
  fontChoice: string
}

const ARTIST_DESIGNS = [
  { id: 'design-1', artist: 'Luna Park', title: 'Bloom', gradient: 'linear-gradient(135deg, #D9C9F1, #EEE6FA)', art: 'flower' },
  { id: 'design-2', artist: 'Doodle Co.', title: 'Confetti', gradient: 'linear-gradient(135deg, #EEE6FA, #D9C9F1)', art: 'popper' },
  { id: 'design-3', artist: 'Inkwell', title: 'Stargazer', gradient: 'linear-gradient(135deg, #5A32D6, #A78BC7)', art: 'star' },
]

const PENS = [
  { value: 'CAVEAT', label: 'Caveat', family: "'Caveat', cursive" },
  { value: 'DANCING_SCRIPT', label: 'Dancing', family: "'Dancing Script', cursive" },
  { value: 'REENIE_BEANIE', label: 'Reenie', family: "'Reenie Beanie', cursive" },
  { value: 'PATRICK_HAND', label: 'Patrick', family: "'Patrick Hand', cursive" },
]
const PEN_FAMILY: Record<string, string> = Object.fromEntries(PENS.map(p => [p.value, p.family]))

const CARD_ART: Record<string, string> = { 'design-1': 'flower', 'design-2': 'popper', 'design-3': 'star' }

const uv = '#5A32D6'

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.01em' }
const label: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-mid)' }
const primaryBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  width: '100%', height: '52px', borderRadius: '10px', border: 'none', cursor: 'pointer',
  background: uv, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700,
  fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em',
}

export default function SendFlow() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState<'card' | 'write' | 'review' | 'sent'>('card')
  const [note, setNote] = useState<Partial<NoteData>>({ occasionType: 'JUST_BECAUSE', fontChoice: 'CAVEAT', toneUsed: 'HEARTFELT' })
  const [pickingRecipient, setPickingRecipient] = useState(false)
  const [sentNoteId, setSentNoteId] = useState<string | null>(null)

  const toName = params.get('toName') ?? undefined

  function update(data: Partial<NoteData>) {
    setNote((prev) => ({ ...prev, ...data }))
  }

  const stepIndex = { card: 1, write: 2, review: 3, sent: 3 }[step]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Reenie+Beanie&family=Patrick+Hand&display=swap" />

      {/* Header */}
      <nav style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        {step !== 'sent' && (
          <button
            onClick={() => {
              if (step === 'card') navigate('/home')
              else if (step === 'write') setStep('card')
              else setStep('write')
            }}
            style={{
              width: '36px', height: '36px', borderRadius: '50%', background: 'var(--lavender-pale)',
              border: 'none', cursor: 'pointer', color: uv, fontSize: '16px', flexShrink: 0,
            }}
          >←</button>
        )}
        {step !== 'sent' && <span style={label}>Step {stepIndex} of 3</span>}
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '8px 24px 0' }}>

        {/* ── STEP 1: CHOOSE A CARD ─────────────────────────────── */}
        {step === 'card' && (
          <>
            <h2 style={sectionTitle}>Choose a card</h2>

            {/* To: row */}
            <button
              onClick={() => setPickingRecipient(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                margin: '16px 0 20px', padding: '10px 14px', borderRadius: '10px',
                background: '#fff', cursor: 'pointer', textAlign: 'left',
                border: note.recipientId ? '1px solid var(--stone)' : `1.5px dashed var(--lavender-soft)`,
              }}
            >
              <span style={label}>To</span>
              <span style={{ flex: 1, fontSize: '15px', fontFamily: 'var(--font-body)', color: note.recipientName ? 'var(--ink)' : 'var(--ink-muted)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
                {note.recipientName ?? (toName ? `Find ${toName}` : 'Pick your person')}
              </span>
              <span style={{ color: uv, fontWeight: 700, fontSize: '13px' }}>{note.recipientId ? 'CHANGE' : 'CHOOSE'}</span>
            </button>

            <p style={{ ...label, marginBottom: '12px' }}>Artist picks</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {ARTIST_DESIGNS.map((d) => {
                const selected = note.cardDesignId === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => update({ cardDesignType: 'ARTIST', cardDesignId: d.id, cardImageUrl: undefined })}
                    style={{
                      aspectRatio: '3/4', borderRadius: '6px', overflow: 'hidden', padding: 0, cursor: 'pointer',
                      border: selected ? `1.5px solid ${uv}` : '1px solid var(--stone)',
                      boxShadow: selected ? '0 4px 14px rgba(90,50,214,0.2)' : 'none',
                    }}
                  >
                    <div style={{ width: '100%', height: '100%', background: d.gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <QEmoji name={d.art} size={36} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--ink)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>{d.title}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '26px', borderRadius: '6px', cursor: 'pointer', marginBottom: '28px',
              border: `1.5px dashed var(--lavender-soft)`, background: note.cardImageUrl ? 'var(--lavender-pale)' : 'transparent',
            }}>
              <QEmoji name="camera" size={30} />
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)' }}>
                {note.cardImageUrl ? 'Photo picked. Tap to swap it.' : 'Upload a picture'}
              </span>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) update({ cardDesignType: 'USER_UPLOAD', cardImageUrl: URL.createObjectURL(file), cardDesignId: undefined })
                }} />
            </label>

            <button
              style={{ ...primaryBtn, opacity: note.recipientId && (note.cardDesignId || note.cardImageUrl) ? 1 : 0.45 }}
              disabled={!note.recipientId || !(note.cardDesignId || note.cardImageUrl)}
              onClick={() => setStep('write')}
            >
              Write your note →
            </button>
          </>
        )}

        {/* ── STEP 2: WRITE YOUR NOTE ───────────────────────────── */}
        {step === 'write' && (
          <WriteStep note={note} update={update} onNext={() => setStep('review')} />
        )}

        {/* ── STEP 3: READY TO SEND ─────────────────────────────── */}
        {step === 'review' && (
          <ReviewStep note={note as NoteData} editingNoteId={sentNoteId} onSent={(id) => { setSentNoteId(id); setStep('sent') }} onEdit={() => setStep('write')} />
        )}

        {/* ── IT'S ON ITS WAY ───────────────────────────────────── */}
        {step === 'sent' && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <QEmoji name="envelope" size={64} />
            <h2 style={{ ...sectionTitle, fontSize: '27px', margin: '20px 0 10px' }}>It's on its way.</h2>
            <p style={{ fontSize: '15px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)', marginBottom: '8px' }}>
              {note.recipientName?.split(' ')[0]} gets a real postcard in 3–5 business days.
            </p>
            <p style={{ fontSize: '16px', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: uv, marginBottom: '10px' }}>
              Go make their day.
            </p>
            <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginBottom: '26px' }}>
              Changed your mind about a word? You can edit this note for the next 2 hours.
            </p>
            <button
              style={{ ...primaryBtn, background: '#fff', color: uv, border: `1.5px solid ${uv}`, marginBottom: '12px' }}
              onClick={() => setStep('write')}
            >
              Edit this note
            </button>
            <button style={primaryBtn} onClick={() => { setNote({ occasionType: 'JUST_BECAUSE', fontChoice: 'CAVEAT', toneUsed: 'HEARTFELT' }); setSentNoteId(null); setStep('card') }}>
              Send another
            </button>
            <button
              style={{ ...primaryBtn, background: 'var(--lavender-light)', color: 'var(--ink)', marginTop: '12px' }}
              onClick={() => navigate('/home')}
            >
              Back home
            </button>
          </div>
        )}
      </div>

      {/* Recipient sheet */}
      {pickingRecipient && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(43,34,56,0.45)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setPickingRecipient(false)}>
          <div style={{ width: '100%', maxHeight: '80vh', overflowY: 'auto', background: 'var(--cream)', borderRadius: '16px 16px 0 0', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}>
            <StepRecipient
              initialQuery={toName}
              onNext={(data) => { update(data); setPickingRecipient(false) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Write step: ruled writing card, prompts dropdown with occasion chips, pen row ── */
function WriteStep({ note, update, onNext }: {
  note: Partial<NoteData>
  update: (d: Partial<NoteData>) => void
  onNext: () => void
}) {
  const [promptsOpen, setPromptsOpen] = useState(false)
  const [promptPage, setPromptPage] = useState(0)
  const occasion = note.occasionType ?? 'JUST_BECAUSE'
  const allPrompts = PROMPTS[occasion] ?? PROMPTS['JUST_BECAUSE'] ?? []
  const visible = allPrompts.slice(promptPage * 3, promptPage * 3 + 3)

  useEffect(() => { setPromptPage(0) }, [occasion])

  return (
    <>
      <h2 style={sectionTitle}>Write your note</h2>
      <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)', margin: '6px 0 16px' }}>
        To {note.recipientName} · printed in your pen below
      </p>

      <textarea
        value={note.noteText ?? ''}
        onChange={(e) => update({ noteText: e.target.value })}
        placeholder="Write from the heart. Or open a prompt below."
        rows={7}
        maxLength={450}
        style={{
          width: '100%', padding: '16px', borderRadius: '10px', resize: 'vertical',
          border: '1px solid var(--stone)', outline: 'none', background: '#fff',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--cream-ruled) 27px, var(--cream-ruled) 28px)',
          fontFamily: PEN_FAMILY[note.fontChoice ?? 'CAVEAT'], fontSize: '20px', lineHeight: '28px', color: 'var(--ink)',
        }}
        onFocus={(e) => { e.target.style.border = `1.5px solid ${uv}` }}
        onBlur={(e) => { e.target.style.border = '1px solid var(--stone)' }}
      />
      <p style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'right', margin: '6px 0 16px' }}>
        {(note.noteText ?? '').length}/450
      </p>

      {/* Prompts dropdown (occasion lives in here) */}
      <button
        onClick={() => setPromptsOpen(!promptsOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          height: '40px', padding: '0 14px', borderRadius: '6px', cursor: 'pointer',
          background: 'var(--lavender-pale)', border: `1.5px dashed var(--lavender-soft)`,
          color: uv, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}
      >
        Need a prompt? <span>{promptsOpen ? '▴' : '▾'}</span>
      </button>

      {promptsOpen && (
        <div style={{ padding: '14px', border: '1px solid var(--stone)', borderRadius: '12px', background: '#fff', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {OCCASIONS.map((o) => {
              const selected = occasion === o.value
              return (
                <button key={o.value} onClick={() => update({ occasionType: o.value })} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                  borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontWeight: 700, fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase',
                  background: selected ? 'var(--lavender-pale)' : '#fff',
                  border: selected ? `1.5px solid ${uv}` : '1px solid var(--stone)',
                  color: selected ? uv : 'var(--ink-mid)',
                }}>
                  <QEmoji name={o.art} size={16} />{o.label}
                </button>
              )
            })}
          </div>
          {visible.map((p) => (
            <button key={p} onClick={() => {
              const clean = p.replace(/[…:.]+\s*$/, '')
              update({ noteText: ((note.noteText ?? '') + (note.noteText ? '\n' : '') + clean + ' ').trimStart() })
            }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: '8px',
              borderRadius: '10px', border: '1px solid var(--stone)', background: 'var(--cream)',
              fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink)', cursor: 'pointer',
              textTransform: 'none', letterSpacing: 0, fontWeight: 400,
            }}>
              {p}
            </button>
          ))}
          {allPrompts.length > 3 && (
            <button onClick={() => setPromptPage((promptPage + 1) % Math.ceil(allPrompts.length / 3))} style={{
              background: 'none', border: 'none', color: uv, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              ↻ More prompts
            </button>
          )}
        </div>
      )}

      {/* Pen row */}
      <p style={{ ...label, margin: '20px 0 4px' }}>Your pen</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-muted)', margin: '0 0 10px' }}>Soon: teach QuteNote your own handwriting.</p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {PENS.map((p) => {
          const selected = (note.fontChoice ?? 'CAVEAT') === p.value
          return (
            <button key={p.value} onClick={() => update({ fontChoice: p.value })} style={{
              flex: 1, padding: '10px 4px', borderRadius: '10px', cursor: 'pointer',
              background: selected ? 'var(--lavender-pale)' : '#fff',
              border: selected ? `1.5px solid ${uv}` : '1px solid var(--stone)',
              fontFamily: p.family, fontSize: '17px', color: 'var(--ink)',
              textTransform: 'none', letterSpacing: 0, fontWeight: 400,
            }}>
              {p.label}
            </button>
          )
        })}
      </div>

      <button
        style={{ ...primaryBtn, opacity: (note.noteText ?? '').trim().length >= 3 ? 1 : 0.45 }}
        disabled={(note.noteText ?? '').trim().length < 3}
        onClick={onNext}
      >
        Ready to send →
      </button>
    </>
  )
}

/* ── Review step: postcard preview + send ── */
function ReviewStep({ note, onSent, onEdit, editingNoteId }: { note: NoteData; onSent: (id: string | null) => void; onEdit: () => void; editingNoteId: string | null }) {
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [needsSub, setNeedsSub] = useState(false)

  const design = ARTIST_DESIGNS.find((d) => d.id === note.cardDesignId)

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      if (editingNoteId) {
        await api.patch(`/notes/${editingNoteId}`, { noteText: note.noteText, fontChoice: note.fontChoice })
        onSent(editingNoteId)
      } else {
        const r = await api.post('/notes', {
          recipientId: note.recipientId,
          occasionType: note.occasionType,
          noteText: note.noteText,
          toneUsed: note.toneUsed,
          fontChoice: note.fontChoice,
          cardDesignType: note.cardDesignType,
          cardDesignId: note.cardDesignId,
          cardImageUrl: note.cardImageUrl,
        })
        onSent(r.data.data.id ?? null)
      }
    } catch (err: any) {
      const msg = err.response?.data?.error ?? ''
      if (err.response?.status === 402 || err.response?.status === 403 || /subscri/i.test(msg)) setNeedsSub(true)
      else setError(msg || 'Something went sideways. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <h2 style={sectionTitle}>Ready to send</h2>
      <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)', margin: '6px 0 18px' }}>
        One last look before it hits the mail.
      </p>

      {/* Postcard preview */}
      <div style={{
        borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--stone)',
        boxShadow: '0 8px 24px rgba(43,34,56,0.12)', marginBottom: '20px', background: '#fff',
      }}>
        <div style={{
          height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: note.cardImageUrl ? `url(${note.cardImageUrl}) center/cover` : design?.gradient ?? 'var(--lavender-pale)',
        }}>
          {!note.cardImageUrl && <QEmoji name={CARD_ART[note.cardDesignId ?? ''] ?? 'envelope'} size={48} />}
        </div>
        <div style={{
          padding: '16px', minHeight: '110px', position: 'relative',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, var(--cream-ruled) 23px, var(--cream-ruled) 24px)',
        }}>
          <p style={{ fontFamily: PEN_FAMILY[note.fontChoice], fontSize: '18px', lineHeight: '24px', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
            {note.noteText}
          </p>
          <span style={{
            position: 'absolute', top: '10px', right: '10px', width: '38px', height: '46px',
            border: `1.5px dashed var(--lavender-soft)`, borderRadius: '4px', background: 'var(--lavender-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QEmoji name="heart" size={20} />
          </span>
        </div>
      </div>

      <p style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)', marginBottom: '20px' }}>
        To <strong>{note.recipientName}</strong> · we print it, stamp it, and mail it. No address needed on your end.
      </p>

      {error && (
        <div style={{ background: 'var(--error-pale)', color: 'var(--error)', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
          {error}
        </div>
      )}

      {needsSub ? (
        <>
          <div style={{ background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
            Your note is ready. A membership mails it: $7.95/mo for two postcards a month.
          </div>
          <button style={primaryBtn} onClick={() => navigate('/subscribe')}>Subscribe and send</button>
        </>
      ) : (
        <button style={{ ...primaryBtn, opacity: sending ? 0.7 : 1 }} disabled={sending} onClick={handleSend}>
          {sending ? 'Sending…' : editingNoteId ? 'Save changes' : 'Send it'}
        </button>
      )}
      <button onClick={onEdit} style={{ ...primaryBtn, background: 'var(--lavender-light)', color: 'var(--ink)', marginTop: '12px' }}>
        Edit the note
      </button>
    </>
  )
}
