import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'

export const aiRouter = Router()

const madlibSchema = z.object({
  tone: z.string(),
  occasion: z.string().optional(),
  recipientName: z.string().optional(),
})

// POST /ai/madlibs — generate a note with Claude
aiRouter.post('/madlibs', requireAuth, async (req: AuthRequest, res) => {
  const parsed = madlibSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Missing tone.' })
  }

  const { tone, occasion, recipientName } = parsed.data
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Fallback if API key not set yet
    const name = recipientName ?? 'you'
    return res.json({
      data: {
        text: `Hey ${name}, I just wanted to take a second to tell you how much you mean to me. You show up in the best ways — thoughtful, genuine, and always yourself. I'm lucky to have you in my life. 💌`,
      },
    })
  }

  const toneMap: Record<string, string> = {
    HEARTFELT: 'warm and sincere',
    FUNNY: 'playful and a little funny',
    FORMAL: 'polished and respectful',
    QUIRKY: 'quirky and delightfully weird',
  }

  const occasionMap: Record<string, string> = {
    BIRTHDAY: 'a birthday',
    ANNIVERSARY: 'an anniversary',
    CONGRATULATIONS: 'a congratulations moment',
    HOLIDAY: 'the holidays',
    CONSOLATION: 'thinking of you / sending support',
    JUST_BECAUSE: 'no specific occasion',
    INVITATION: 'an invitation',
    CUSTOM: 'a special occasion',
  }

  const toneLabel = toneMap[tone] ?? 'warm and sincere'
  const occasionLabel = occasion ? occasionMap[occasion] ?? 'a special occasion' : 'no specific occasion'
  const nameClause = recipientName ? ` to ${recipientName}` : ''

  const prompt = `Write a short, personal handwritten note${nameClause} for ${occasionLabel}.
The tone should be ${toneLabel}.
Keep it under 250 characters.
Make it feel like it was written by a real person who genuinely cares.
Do not include any quotation marks around the note.
Just write the note itself — no intro, no explanation.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const json = await response.json() as any

    if (!response.ok) {
      throw new Error(json.error?.message ?? 'Claude API error')
    }

    const text = json.content?.[0]?.text?.trim() ?? ''
    return res.json({ data: { text } })
  } catch (err) {
    const name = recipientName ?? 'you'
    return res.json({
      data: {
        text: `Hey ${name}, just thinking about you today and wanted you to know — you're one of the good ones. 💌`,
      },
    })
  }
})
