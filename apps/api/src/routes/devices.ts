import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const devicesRouter = Router()
devicesRouter.use(requireAuth)

const schema = z.object({ token: z.string().min(16).max(200), platform: z.string().max(20).optional() })

// POST /devices — register this phone for reminders
devicesRouter.post('/', async (req: AuthRequest, res: Response) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: 'Invalid device token.' })
  const { token, platform } = result.data
  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId: req.userId! },
    create: { userId: req.userId!, token, platform: platform ?? 'ios' },
  })
  return res.status(201).json({ data: { ok: true } })
})
