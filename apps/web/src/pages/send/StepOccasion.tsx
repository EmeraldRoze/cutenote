import type { NoteData } from './SendFlow'

const OCCASIONS = [
  { value: 'BIRTHDAY', emoji: '🎂', label: 'Birthday' },
  { value: 'ANNIVERSARY', emoji: '💑', label: 'Anniversary' },
  { value: 'CONGRATULATIONS', emoji: '🎉', label: 'Big Life Moments' },
  { value: 'HOLIDAY', emoji: '✨', label: 'Holiday' },
  { value: 'CONSOLATION', emoji: '🤗', label: 'Hard Times' },
  { value: 'JUST_BECAUSE', emoji: '💌', label: 'Just because' },
  { value: 'INVITATION', emoji: '📬', label: 'Invitation' },
  { value: 'CUSTOM', emoji: '✏️', label: 'Something else' },
]

export default function StepOccasion({
  onNext,
  onBack: _onBack,
}: {
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
        What's the occasion?
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px' }}>
        Pick one — we'll help you nail the tone.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {OCCASIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onNext({ occasionType: o.value })}
            style={{
              background: 'var(--white)', border: '1.5px solid var(--border-default)',
              borderRadius: '20px', padding: '20px', textAlign: 'left',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--lavender)'
              e.currentTarget.style.background = 'var(--lavender-pale)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.background = 'var(--white)'
            }}
          >
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>{o.emoji}</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
