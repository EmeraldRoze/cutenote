import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const invitesRouter = Router()
invitesRouter.use(requireAuth)

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  name: z.string().min(1).max(100),
})

// POST /invites — invite someone not on the platform
invitesRouter.post('/', async (req: AuthRequest, res: Response) => {
  const result = inviteSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const { email, name } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: `${name} is already on QuteNote! Search for them by username instead.` })
  }

  // For now, store the invite as a notification to the sender (email sending is Phase 7)
  await prisma.notification.create({
    data: {
      userId: req.userId!,
      type: 'NOTE_INCOMING',
      title: 'Invite saved',
      body: `We saved your invite for ${name} (${email}). We'll send them an email soon!`,
    },
  })

  return res.status(201).json({ data: { email, name, status: 'saved' } })
})
