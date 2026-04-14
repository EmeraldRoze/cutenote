import { useState } from 'react'
import type { NoteData } from './SendFlow'

const FONTS = [
  { value: 'CAVEAT', label: 'Caveat', family: "'Caveat', cursive", sample: 'The quick brown fox' },
  { value: 'DANCING_SCRIPT', label: 'Dancing Script', family: "'Dancing Script', cursive", sample: 'The quick brown fox' },
  { value: 'REENIE_BEANIE', label: 'Reenie Beanie', family: "'Reenie Beanie', cursive", sample: 'The quick brown fox' },
  { value: 'PATRICK_HAND', label: 'Patrick Hand', family: "'Patrick Hand', cursive", sample: 'The quick brown fox' },
]

export default function StepFont({
  note,
  onNext,
  onBack: _onBack,
}: {
  note: Partial<NoteData>
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  const [selected, setSelected] = useState('CAVEAT')

  const preview = note.noteText ?? 'Your note will look like this when it arrives.'

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
        Pick a handwriting style
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px' }}>
        This is how your words will appear on the card.
      </p>

      {/* Load Google Fonts for handwriting options */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Reenie+Beanie&family=Patrick+Hand&display=swap"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {FONTS.map((font) => (
          <button
            key={font.value}
            onClick={() => setSelected(font.value)}
            style={{
              width: '100%', textAlign: 'left', borderRadius: '16px', padding: '16px 20px',
              border: selected === font.value ? '2px solid var(--lavender)' : '1.5px solid var(--border-default)',
              background: selected === font.value ? 'var(--lavender-pale)' : 'var(--white)',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px' }}>
              {font.label}
            </p>
            <p style={{ fontSize: '20px', color: 'var(--ink)', lineHeight: 1.4, fontFamily: font.family }}>
              {preview.length > 60 ? preview.slice(0, 60) + '…' : preview}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={() => onNext({ fontChoice: selected })}
        style={{
          width: '100%', padding: '13px 24px', fontSize: '15px', fontWeight: 500,
          borderRadius: '50px', border: 'none', cursor: 'pointer',
          background: 'var(--lavender)', color: '#fff',
          boxShadow: 'var(--shadow-button)', fontFamily: 'var(--font-body)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender-dark)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--lavender)')}
      >
        Next
      </button>
    </div>
  )
}
