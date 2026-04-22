import { Router } from 'express'
import { z } from 'zod'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'
// @ts-ignore — lob package has no types
import Lob from 'lob'

const lob = new Lob(process.env.LOB_API_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

  // Get sender info
  const sender = await prisma.user.findUnique({ where: { id: req.userId! } })
  if (!sender) return res.status(404).json({ error: 'Sender not found.' })

  // Subscription gate: must be subscribed (or have gifted credits)
  const hasGiftedCredits = sender.giftedCredits > 0
  const isSubscribed = sender.subscriptionStatus === 'ACTIVE'
  if (!isSubscribed && !hasGiftedCredits) {
    return res.status(403).json({ error: 'You need an active subscription to send notes. Head to the Subscribe page to get started!' })
  }

  // Determine if this is an overage note (past monthly allowance, no gifted credits)
  const withinAllowance = sender.notesUsed < sender.notesAllowance
  const useGiftedCredit = !withinAllowance && hasGiftedCredits
  const isOverage = isSubscribed && !withinAllowance && !hasGiftedCredits

  // Charge $3.49 overage fee via Stripe
  let overageChargeId: string | null = null
  if (isOverage) {
    if (!sender.stripeCustomerId) {
      return res.status(400).json({ error: 'No payment method on file. Please update your billing info.' })
    }
    try {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: sender.stripeCustomerId,
        amount: 349,
        currency: 'usd',
        description: 'QuteNote — extra postcard ($3.49)',
      })
      const invoice = await stripe.invoices.create({
        customer: sender.stripeCustomerId,
        auto_advance: true,
      })
      const paid = await stripe.invoices.pay(invoice.id)
      overageChargeId = (paid as any).charge as string ?? paid.id
    } catch (stripeErr: any) {
      console.error('Overage charge failed:', stripeErr?.message)
      return res.status(402).json({ error: "We couldn't charge for the extra note. Please check your payment method." })
    }
  }

  // Deduct from allowance or gifted credits
  if (useGiftedCredit) {
    await prisma.user.update({ where: { id: sender.id }, data: { giftedCredits: { decrement: 1 } } })
  } else if (withinAllowance) {
    await prisma.user.update({ where: { id: sender.id }, data: { notesUsed: { increment: 1 } } })
  } else {
    await prisma.user.update({ where: { id: sender.id }, data: { notesUsed: { increment: 1 } } })
  }

  // Get recipient address and check verification
  const recipientAddress = await prisma.address.findUnique({ where: { userId: recipientId } })
  if (!recipientAddress) {
    return res.status(400).json({ error: `${recipient.displayName} hasn't added their address yet. Ask them to add it first!` })
  }
  if (!recipientAddress.isVerified) {
    return res.status(400).json({ error: `${recipient.displayName}'s address couldn't be verified. Ask them to double-check it!` })
  }

  // Get sender address (for return address on postcard)
  const senderAddress = await prisma.address.findUnique({ where: { userId: req.userId! } })

  const note = await prisma.note.create({
    data: {
      senderId: req.userId!,
      recipientId,
      occasionType: occasionType as any,
      noteText,
      toneUsed: toneUsed as any,
      fontChoice: fontChoice as any,
      cardDesignType: cardDesignType as any,
      cardDesignId: null,
      cardImageUrl: cardImageUrl ?? null,
      stripeChargeId: overageChargeId,
      status: 'PENDING',
    },
  })

  // Send postcard via Lob
  try {
    const toAddress: any = {
      name: recipient.displayName,
      address_line1: recipientAddress.encryptedLine1,
      address_city: recipientAddress.encryptedCity,
      address_state: recipientAddress.encryptedState,
      address_zip: recipientAddress.encryptedZip,
      address_country: recipientAddress.encryptedCountry ?? 'US',
    }
    if (recipientAddress.encryptedLine2) toAddress.address_line2 = recipientAddress.encryptedLine2

    const fromAddress: any = senderAddress ? {
      name: sender.displayName,
      address_line1: senderAddress.encryptedLine1,
      address_city: senderAddress.encryptedCity,
      address_state: senderAddress.encryptedState,
      address_zip: senderAddress.encryptedZip,
      address_country: senderAddress.encryptedCountry ?? 'US',
    } : {
      name: 'QuteNote',
      address_line1: '123 Main St',
      address_city: 'Austin',
      address_state: 'TX',
      address_zip: '78701',
      address_country: 'US',
    }
    if (senderAddress?.encryptedLine2) fromAddress.address_line2 = senderAddress.encryptedLine2

    // Simple postcard HTML — front is a colored card, back has the message
    const frontHtml = `<html><body style="margin:0;background:linear-gradient(135deg,#9B8EC4,#C4BAE0);width:6in;height:4in;display:flex;align-items:center;justify-content:center;"><p style="font-family:Georgia,serif;font-size:48px;color:white;text-align:center;">💌</p></body></html>`
    const backHtml = `<html><body style="margin:0;padding:40px;font-family:Georgia,serif;width:6in;height:4in;background:#fffef9;"><p style="font-size:22px;color:#2C2540;line-height:1.6;font-style:italic;">${noteText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p><p style="margin-top:20px;font-size:14px;color:#9590AA;">With love, ${sender.displayName}</p></body></html>`

    const postcard = await lob.postcards.create({
      description: `QuteNote from ${sender.displayName}`,
      to: toAddress,
      from: fromAddress,
      front: frontHtml,
      back: backHtml,
      size: '6x4',
    })

    // Update note with Lob postcard ID and mark as sent
    await prisma.note.update({
      where: { id: note.id },
      data: { status: 'SENT', lobNoteId: postcard.id },
    })
  } catch (lobErr: any) {
    // Don't fail the whole request — note is saved, just log the Lob error
    console.error('Lob postcard error:', lobErr?.message ?? lobErr)
  }

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
