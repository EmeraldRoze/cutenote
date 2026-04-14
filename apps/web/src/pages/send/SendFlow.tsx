import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepRecipient from './StepRecipient'
import StepOccasion from './StepOccasion'
import StepCard from './StepCard'
import StepWrite from './StepWrite'
import StepFont from './StepFont'
import StepReview from './StepReview'

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

const STEPS = ['Recipient', 'Occasion', 'Card', 'Write', 'Font', 'Review']

export default function SendFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [note, setNote] = useState<Partial<NoteData>>({})

  function next(data: Partial<NoteData>) {
    setNote((prev) => ({ ...prev, ...data }))
    setStep((s) => s + 1)
  }

  function back() {
    setStep((s) => s - 1)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Header */}
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <button
          onClick={() => step === 1 ? navigate('/home') : back()}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--lavender-pale)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--lavender-dark)', fontSize: '16px', flexShrink: 0,
          }}
        >
          ←
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--ink)' }}>
          Send a Qute Note
        </h1>
      </nav>

      {/* Progress bar */}
      <div style={{ background: 'var(--white)', padding: '12px 20px 16px', borderBottom: '1px solid var(--lavender-pale)' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: '3px', borderRadius: '99px',
                background: i + 1 <= step ? 'var(--lavender)' : 'var(--lavender-pale)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '8px' }}>
          Step {step} of {STEPS.length} — {STEPS[step - 1]}
        </p>
      </div>

      {/* Step content */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px' }}>
        {step === 1 && <StepRecipient onNext={next} />}
        {step === 2 && <StepOccasion onNext={next} onBack={back} />}
        {step === 3 && <StepCard onNext={next} onBack={back} />}
        {step === 4 && <StepWrite note={note} onNext={next} onBack={back} />}
        {step === 5 && <StepFont note={note} onNext={next} onBack={back} />}
        {step === 6 && <StepReview note={note as NoteData} onBack={back} />}
      </div>
    </div>
  )
}
