import { useState } from 'react'
import { api } from '../../lib/api'
import type { NoteData } from './SendFlow'

const TONES = [
  { value: 'HEARTFELT', label: 'Heartfelt' },
  { value: 'FUNNY', label: 'Funny' },
  { value: 'FORMAL', label: 'Formal' },
  { value: 'QUIRKY', label: 'Quirky' },
]

const PROMPTS: Record<string, string[]> = {
  BIRTHDAY: [
    "Another year of being absolutely awesome. Here's to you:",
    "I can't believe it's your birthday again. Time flies when you're this cool:",
    "On your birthday, I just want to say:",
  ],
  CONGRATULATIONS: [
    "You did it! I always knew you would because:",
    "This is huge and you deserve every bit of it:",
    "I am so proud of you. Here's what I want you to know:",
  ],
  JUST_BECAUSE: [
    "No reason needed — I just wanted to tell you:",
    "I was thinking about you today and realized:",
    "You showed up for me and I never want you to forget:",
  ],
}

const MAX_CHARS = 300

export default function StepWrite({
  note,
  onNext,
  onBack: _onBack,
}: {
  note: Partial<NoteData>
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  const [mode, setMode] = useState<'blank' | 'prompt' | 'madlib'>('blank')
  const [tone, setTone] = useState('HEARTFELT')
  const [text, setText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const prompts = PROMPTS[note.occasionType ?? ''] ?? PROMPTS['JUST_BECAUSE']
  const remaining = MAX_CHARS - text.length

  async function generateMadlib() {
    setAiLoading(true)
    try {
      const res = await api.post('/ai/madlibs', {
        tone,
        occasion: note.occasionType,
        recipientName: note.recipientName,
      })
      setText(res.data.data.text ?? '')
    } catch {
      setText(`Hey ${note.recipientName}, just thinking about you and wanted to say — you're one of the good ones. 💌`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
        Write your note
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '20px' }}>
        Sometimes we choke on our feelings. We got you.
      </p>

      {/* Tone selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TONES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            style={{
              padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 500,
              border: tone === t.value ? '1.5px solid var(--lavender)' : '1.5px solid var(--border-default)',
              background: tone === t.value ? 'var(--lavender)' : 'var(--white)',
              color: tone === t.value ? '#fff' : 'var(--ink-mid)',
              cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mode tabs */}
      <div style={{
        display: 'flex', background: 'var(--lavender-pale)',
        borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px',
      }}>
        {(['blank', 'prompt', 'madlib'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1, padding: '8px', borderRadius: '9px', fontSize: '12px', fontWeight: 500,
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
              background: mode === m ? 'var(--white)' : 'transparent',
              color: mode === m ? 'var(--ink)' : 'var(--ink-muted)',
              boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {m === 'madlib' ? '✨ AI Help' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Prompt suggestions */}
      {mode === 'prompt' && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setText(p + ' ')}
              style={{
                width: '100%', textAlign: 'left', fontSize: '13px',
                background: 'var(--white)', border: '1.5px solid var(--border-default)',
                borderRadius: '12px', padding: '12px 16px', color: 'var(--ink-mid)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lavender)'; e.currentTarget.style.color = 'var(--ink)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--ink-mid)' }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* AI madlib */}
      {mode === 'madlib' && (
        <button
          onClick={generateMadlib}
          disabled={aiLoading}
          style={{
            width: '100%', marginBottom: '16px', padding: '12px 24px', fontSize: '14px', fontWeight: 500,
            borderRadius: '12px', border: '1.5px solid var(--lavender-light)', cursor: aiLoading ? 'not-allowed' : 'pointer',
            background: 'var(--lavender-pale)', color: 'var(--lavender-dark)',
            fontFamily: 'var(--font-body)', opacity: aiLoading ? 0.6 : 1, transition: 'opacity 0.15s',
          }}
        >
          {aiLoading ? '✨ Writing something cute...' : '✨ Generate a note for me'}
        </button>
      )}

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={`Write your note to ${note.recipientName ?? 'them'}...`}
          rows={5}
          style={{
            width: '100%', padding: '14px 16px', fontSize: '14px',
            borderRadius: '14px', border: '1.5px solid var(--border-default)',
            background: 'var(--white)', color: 'var(--ink)',
            outline: 'none', fontFamily: 'var(--font-body)', resize: 'none',
            lineHeight: 1.6,
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
        />
        <span style={{
          position: 'absolute', bottom: '12px', right: '14px', fontSize: '11px',
          color: remaining < 30 ? (remaining < 10 ? 'var(--error)' : 'var(--lavender)') : 'var(--ink-muted)',
        }}>
          {remaining}
        </span>
      </div>

      <button
        disabled={text.trim().length < 5}
        onClick={() => onNext({ noteText: text.trim(), toneUsed: tone })}
        style={{
          width: '100%', marginTop: '16px', padding: '13px 24px', fontSize: '15px', fontWeight: 500,
          borderRadius: '50px', border: 'none', cursor: text.trim().length < 5 ? 'not-allowed' : 'pointer',
          background: text.trim().length < 5 ? 'var(--lavender-pale)' : 'var(--lavender)',
          color: text.trim().length < 5 ? 'var(--ink-muted)' : '#fff',
          boxShadow: text.trim().length < 5 ? 'none' : 'var(--shadow-button)',
          fontFamily: 'var(--font-body)', transition: 'background 0.15s',
        }}
      >
        Next
      </button>
    </div>
  )
}
