import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const addressRouter = Router()
addressRouter.use(requireAuth)

const addressSchema = z.object({
  line1:   z.string().min(1).max(200),
  line2:   z.string().max(200).optional(),
  city:    z.string().min(1).max(100),
  state:   z.string().min(1).max(100),
  zip:     z.string().min(1).max(20),
  country: z.string().min(1).max(100).default('US'),
})

// GET /address/me
addressRouter.get('/me', async (req: AuthRequest, res: Response) => {
  const address = await prisma.address.findUnique({
    where: { userId: req.userId! },
  })
  if (!address) return res.json({ data: null })

  // Return decrypted fields (encryption layer to be added later)
  return res.json({
    data: {
      id:      address.id,
      line1:   address.encryptedLine1,
      line2:   address.encryptedLine2 ?? null,
      city:    address.encryptedCity,
      state:   address.encryptedState,
      zip:     address.encryptedZip,
      country: address.encryptedCountry,
      isVerified: address.isVerified,
    },
  })
})

// POST /address — create or update
addressRouter.post('/', async (req: AuthRequest, res: Response) => {
  const parsed = addressSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message })
  }

  const { line1, line2, city, state, zip, country } = parsed.data

  const address = await prisma.address.upsert({
    where: { userId: req.userId! },
    update: {
      encryptedLine1:   line1,
      encryptedLine2:   line2 ?? null,
      encryptedCity:    city,
      encryptedState:   state,
      encryptedZip:     zip,
      encryptedCountry: country,
    },
    create: {
      userId:           req.userId!,
      encryptedLine1:   line1,
      encryptedLine2:   line2 ?? null,
      encryptedCity:    city,
      encryptedState:   state,
      encryptedZip:     zip,
      encryptedCountry: country,
    },
  })

  return res.json({
    data: {
      id:      address.id,
      line1:   address.encryptedLine1,
      line2:   address.encryptedLine2 ?? null,
      city:    address.encryptedCity,
      state:   address.encryptedState,
      zip:     address.encryptedZip,
      country: address.encryptedCountry,
      isVerified: address.isVerified,
    },
  })
})
