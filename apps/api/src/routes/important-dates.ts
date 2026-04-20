import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const importantDatesRouter = Router()
importantDatesRouter.use(requireAuth)

const dateSchema = z.object({
  connectionName: z.string().min(1).max(100),
  label: z.string().min(1).max(50),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  reminderDaysBefore: z.number().int().min(0).max(60).optional(),
})

// GET /important-dates
importantDatesRouter.get('/', async (req: AuthRequest, res: Response) => {
  const dates = await prisma.importantDate.findMany({
    where: { userId: req.userId! },
    orderBy: [{ month: 'asc' }, { day: 'asc' }],
  })
  return res.json({ data: dates })
})

// POST /important-dates
importantDatesRouter.post('/', async (req: AuthRequest, res: Response) => {
  const result = dateSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const date = await prisma.importantDate.create({
    data: {
      userId: req.userId!,
      connectionName: result.data.connectionName,
      label: result.data.label,
      month: result.data.month,
      day: result.data.day,
      year: result.data.year ?? null,
      reminderDaysBefore: result.data.reminderDaysBefore ?? 7,
    },
  })
  return res.status(201).json({ data: date })
})

// PUT /important-dates/:id
importantDatesRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.importantDate.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: 'Date not found.' })
  if (existing.userId !== req.userId) return res.status(403).json({ error: 'Not yours.' })

  const result = dateSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const date = await prisma.importantDate.update({
    where: { id: req.params.id },
    data: {
      connectionName: result.data.connectionName,
      label: result.data.label,
      month: result.data.month,
      day: result.data.day,
      year: result.data.year ?? null,
      reminderDaysBefore: result.data.reminderDaysBefore ?? 7,
    },
  })
  return res.json({ data: date })
})

// DELETE /important-dates/:id
importantDatesRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.importantDate.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: 'Date not found.' })
  if (existing.userId !== req.userId) return res.status(403).json({ error: 'Not yours.' })

  await prisma.importantDate.delete({ where: { id: req.params.id } })
  return res.json({ data: { ok: true } })
})
