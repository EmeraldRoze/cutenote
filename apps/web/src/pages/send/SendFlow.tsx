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
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => step === 1 ? navigate('/home') : back()}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Send a Cute Note</h1>
      </div>

      {/* Progress bar */}
      <div className="bg-white px-4 pb-4">
        <div className="flex gap-1 mt-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-rose-400' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Step {step} of {STEPS.length} — {STEPS[step - 1]}</p>
      </div>

      {/* Step content */}
      <div className="max-w-lg mx-auto px-4 py-6">
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
