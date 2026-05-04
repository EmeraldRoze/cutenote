import { useState, useMemo, useRef } from 'react'
import type { NoteData } from './SendFlow'

const PROMPTS: Record<string, string[]> = {
  BIRTHDAY: [
    "The world got lucky when it got you because…",
    "I hope this year surprises you with…",
    "Today we celebrate you for…",
    "This year, you're officially old enough to…",
    "You're aging like…",
    "Today we celebrate your incredible talent for…",
    "You've somehow managed to become even more…",
    "This year, I hope you lean all the way into…",
    "You make ordinary things better just by…",
    "This is your year to fully own…",
    "I hope this new year brings you…",
    "You've grown in ways that are really clear when…",
    "You make life lighter just by…",
    "The world feels a little better with you in it because…",
  ],
  ANNIVERSARY: [
    "Looking back on our time together, what stands out most is:",
    "Every year with you feels like:",
    "You still make me feel:",
  ],
  CONGRATULATIONS: [
    "This is such a big deal because…",
    "You worked for this in ways people don't even see, like…",
    "This moment says so much about who you are…",
    "I can't wait to see what you do with…",
    "You're more ready for this than you think because…",
    "This next chapter is going to challenge you to…",
    "A strength you're bringing into this season…",
    "You should be really proud of yourself for…",
    "This is only the beginning of…",
    "I'll be right here cheering you on when…",
  ],
  HOLIDAY: [
    "This time of year always makes me think of:",
    "Wishing you the kind of holiday season that feels like:",
    "What I love most about celebrating with you is:",
  ],
  CONSOLATION: [
    "You don't have to have it all figured out right now, especially…",
    "I'm here for you in whatever way you need, even if that looks like…",
    "It makes sense that you feel…",
    "You're allowed to take your time with…",
    "I wish I could make this easier, but I can remind you…",
    "You're still you, even in the middle of…",
    "If today feels heavy, focus on…",
    "I see how strong you're being, especially when…",
    "You don't have to go through this quietly…",
    "I'm not going anywhere, even when…",
  ],
  JUST_BECAUSE: [
    "Something I don't say enough is…",
    "I really admire the way you…",
    "I don't say this enough, but…",
    "You've made my life better by…",
    "A moment I felt really grateful for you was…",
    "You make hard days easier by…",
    "I feel lucky to know you because…",
    "One thing about you that never goes unnoticed…",
    "You have a way of…",
    "If you ever forget, here's what makes you special…",
    "Remember when we thought it was a good idea to…",
    "The first time I knew we'd be friends was when…",
    "The way you show up for people is…",
    "You have the best taste in…",
    "I trust you with…",
    "You make things feel easier when…",
    "You're really good at noticing…",
    "I appreciate how you…",
    "You make ordinary moments better by…",
    "I'd be lying if I said I didn't…",
    "One thing I wish I told you sooner…",
    "Scientists should study you for your ability to…",
  ],
  INVITATION: [
    "You're invited! Here's what's happening:",
    "I'd love for you to be there because:",
    "It wouldn't be the same without you:",
  ],
  CUSTOM: [
    "I've been meaning to tell you:",
    "Here's something I want you to know:",
    "You deserve to hear this:",
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
  const [mode, setMode] = useState<'blank' | 'prompt'>('blank')
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const allPrompts = PROMPTS[note.occasionType ?? ''] ?? PROMPTS['JUST_BECAUSE']
  const [shuffleKey, setShuffleKey] = useState(0)
  const prompts = useMemo(() => [...allPrompts].sort(() => Math.random() - 0.5).slice(0, 3), [note.occasionType, shuffleKey])
  const remaining = MAX_CHARS - text.length

  function fillPrompt(p: string) {
    const cleaned = p.replace(/[…]+$/, '').trimEnd()
    setText(cleaned + ' ')
    setMode('blank')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }



  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
        Write your note
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '20px' }}>
        Sometimes we choke on our feelings. We got you.
      </p>

      {/* Mode tabs */}
      <div style={{
        display: 'flex', background: 'var(--lavender-pale)',
        borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px',
      }}>
        {(['blank', 'prompt'] as const).map((m) => (
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
            {m === 'blank' ? 'Blank' : 'Starters'}
          </button>
        ))}
      </div>

      {/* Prompt suggestions */}
      {mode === 'prompt' && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '10px' }}>
            Tap one to start writing from there:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {prompts.map((p, i) => (
              <button
                key={i}
                onClick={() => fillPrompt(p)}
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
          {allPrompts.length > 3 && (
            <button
              onClick={() => setShuffleKey(k => k + 1)}
              style={{
                marginTop: '12px', fontSize: '13px', fontWeight: 500,
                color: 'var(--lavender-dark)', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: '6px',
                margin: '12px auto 0',
              }}
            >
              ↻ Show more starters
            </button>
          )}
        </div>
      )}

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
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
        onClick={() => onNext({ noteText: text.trim() })}
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
