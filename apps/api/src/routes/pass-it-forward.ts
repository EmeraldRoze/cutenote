import { Router, Response } from 'express'
import { z } from 'zod'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const passItForwardRouter = Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const giftSchema = z.object({
  recipientId: z.string().uuid().optional(),
  recipientEmail: z.string().email().optional(),
}).refine(d => d.recipientId || d.recipientEmail, {
  message: 'Provide either a recipient user or email.',
})

// POST /pass-it-forward — gift a note credit ($3.49 charge to gifter)
passItForwardRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = giftSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const gifter = await prisma.user.findUnique({ where: { id: req.userId! } })
  if (!gifter) return res.status(404).json({ error: 'User not found.' })

  if (!gifter.stripeCustomerId) {
    return res.status(400).json({ error: 'You need a subscription or payment method to gift a note. Subscribe first!' })
  }

  // Resolve recipient
  let recipientId = parsed.data.recipientId ?? null
  if (recipientId) {
    const exists = await prisma.user.findUnique({ where: { id: recipientId } })
    if (!exists) return res.status(404).json({ error: 'Recipient not found.' })
  }

  // Charge $3.49 via Stripe
  let chargeId: string
  try {
    const invoiceItem = await stripe.invoiceItems.create({
      customer: gifter.stripeCustomerId,
      amount: 349,
      currency: 'usd',
      description: 'QuteNote — Pass It Forward gift ($3.49)',
    })
    const invoice = await stripe.invoices.create({
      customer: gifter.stripeCustomerId,
      auto_advance: true,
    })
    const paid = await stripe.invoices.pay(invoice.id)
    chargeId = (paid as any).charge as string ?? paid.id
  } catch (stripeErr: any) {
    console.error('Pass It Forward charge failed:', stripeErr?.message)
    return res.status(402).json({ error: "We couldn't process the payment. Please check your billing info." })
  }

  // Create the gift record
  const gift = await prisma.passItForward.create({
    data: {
      gifterId: gifter.id,
      recipientId,
      recipientEmail: parsed.data.recipientEmail ?? null,
      stripeChargeId: chargeId,
    },
  })

  // If recipient is a known user, increment their gifted credits
  if (recipientId) {
    await prisma.user.update({
      where: { id: recipientId },
      data: { giftedCredits: { increment: 1 } },
    })
  }

  return res.status(201).json({ data: gift })
})

// GET /pass-it-forward/sent — gifts I've given
passItForwardRouter.get('/sent', requireAuth, async (req: AuthRequest, res: Response) => {
  const gifts = await prisma.passItForward.findMany({
    where: { gifterId: req.userId! },
    include: { recipient: { select: { id: true, displayName: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return res.json({ data: gifts })
})

// GET /pass-it-forward/received — gifts I've received
passItForwardRouter.get('/received', requireAuth, async (req: AuthRequest, res: Response) => {
  const gifts = await prisma.passItForward.findMany({
    where: { recipientId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return res.json({ data: gifts })
})
