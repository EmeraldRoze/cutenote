import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const feedRouter = Router()
feedRouter.use(requireAuth)

// GET /feed — activity from people I follow
feedRouter.get('/', async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
  const limit = 20
  const skip = (page - 1) * limit

  const followingIds = await prisma.connection.findMany({
    where: { followerId: req.userId!, status: 'ACCEPTED' },
    select: { followingId: true },
  })
  const ids = followingIds.map((c) => c.followingId)
  ids.push(req.userId!)

  const notes = await prisma.note.findMany({
    where: {
      senderId: { in: ids },
      status: { in: ['SENT', 'PRINTED'] },
    },
    select: {
      id: true,
      occasionType: true,
      status: true,
      createdAt: true,
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      recipient: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  })

  const data = notes.map((n) => ({
    id: n.id,
    type: 'note_sent' as const,
    occasionType: n.occasionType,
    status: n.status,
    sender: n.sender,
    recipient: n.recipient,
    createdAt: n.createdAt,
  }))

  return res.json({ data })
})
