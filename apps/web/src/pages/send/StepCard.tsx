import { useRef } from 'react'
import type { NoteData } from './SendFlow'

// Placeholder artist designs — will be replaced with real DB data in Phase 5
const ARTIST_DESIGNS = [
  { id: 'design-1', artist: 'Luna Park', title: 'Bloom', gradient: 'linear-gradient(135deg, #C4BAE0, #F5C2C7)', emoji: '🌸' },
  { id: 'design-2', artist: 'Doodle Co.', title: 'Confetti', gradient: 'linear-gradient(135deg, #fde68a, #fca5a5)', emoji: '🎊' },
  { id: 'design-3', artist: 'Inkwell', title: 'Stargazer', gradient: 'linear-gradient(135deg, #9B8EC4, #3D3470)', emoji: '🌟' },
]

export default function StepCard({
  onNext,
  onBack: _onBack,
}: {
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function selectArtist(design: typeof ARTIST_DESIGNS[0]) {
    onNext({ cardDesignType: 'ARTIST', cardDesignId: design.id })
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onNext({ cardDesignType: 'USER_UPLOAD', cardImageUrl: url })
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
        Pick your card
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px' }}>
        Choose an artist design or use your own photo.
      </p>

      {/* Artist designs */}
      <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px' }}>
        Artist Picks
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {ARTIST_DESIGNS.map((d) => (
          <button
            key={d.id}
            onClick={() => selectArtist(d)}
            style={{
              aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden',
              border: '2px solid transparent', cursor: 'pointer', padding: 0,
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lavender)'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div style={{
              width: '100%', height: '100%', background: d.gradient,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <span style={{ fontSize: '32px' }}>{d.emoji}</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{d.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Upload own photo */}
      <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px' }}>
        Or use your photo
      </p>
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%', border: '2px dashed var(--lavender-light)',
          borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lavender)'; e.currentTarget.style.background = 'var(--lavender-pale)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--lavender-light)'; e.currentTarget.style.background = 'none' }}
      >
        <span style={{ fontSize: '28px' }}>📷</span>
        <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Tap to upload a photo</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />
    </div>
  )
}
