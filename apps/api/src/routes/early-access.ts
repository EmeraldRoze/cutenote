import { Router, Request, Response } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'

export const earlyAccessRouter = Router()

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })

const schema = z.object({
  email: z.string().email('That email looks off. One more try.'),
  source: z.string().max(40).optional(),
})

// POST /early-access — the homepage signup forms land here
earlyAccessRouter.post('/', limiter, async (req: Request, res: Response) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }
  const email = result.data.email.toLowerCase().trim()
  await prisma.earlySignup.upsert({
    where: { email },
    update: {},
    create: { email, source: result.data.source ?? null },
  })
  return res.status(201).json({ data: { ok: true } })
})
