import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'

export const notesRouter = Router()

const createNoteSchema = z.object({
  recipientId: z.string().uuid(),
  occasionType: z.string(),
  noteText: z.string().min(5).max(300),
  toneUsed: z.string(),
  fontChoice: z.string(),
  cardDesignType: z.enum(['ARTIST', 'USER_UPLOAD']),
  cardDesignId: z.string().optional(),
  cardImageUrl: z.string().optional(),
})

// POST /notes — save a new note
notesRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createNoteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid note data. Please fill out all fields.' })
  }

  const {
    recipientId,
    occasionType,
    noteText,
    toneUsed,
    fontChoice,
    cardDesignType,
    cardDesignId,
    cardImageUrl,
  } = parsed.data

  // Make sure recipient exists
  const recipient = await prisma.user.findUnique({ where: { id: recipientId } })
  if (!recipient) {
    return res.status(404).json({ error: "We couldn't find that recipient." })
  }

  const note = await prisma.note.create({
    data: {
      senderId: req.userId!,
      recipientId,
      occasionType: occasionType as any,
      noteText,
      toneUsed: toneUsed as any,
      fontChoice: fontChoice as any,
      cardDesignType: cardDesignType as any,
      // cardDesignId is a FK to CardDesign table — skip for now (placeholder designs not in DB yet)
      cardDesignId: null,
      cardImageUrl: cardImageUrl ?? null,
      status: 'PENDING',
    },
  })

  return res.status(201).json({ data: note })
})

// GET /notes/sent — notes the current user sent
notesRouter.get('/sent', requireAuth, async (req: AuthRequest, res) => {
  const notes = await prisma.note.findMany({
    where: { senderId: req.userId! },
    include: { recipient: { select: { id: true, displayName: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return res.json({ data: notes })
})

// GET /notes/received — notes the current user received
notesRouter.get('/received', requireAuth, async (req: AuthRequest, res) => {
  const notes = await prisma.note.findMany({
    where: { recipientId: req.userId! },
    include: { sender: { select: { id: true, displayName: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return res.json({ data: notes })
})
