import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { requireAuth, AuthRequest } from '../middleware/auth'
import rateLimit from 'express-rate-limit'

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000'

export const authRouter = Router()

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Try again in a minute.' },
})

// ─── Sign Up ──────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  displayName: z.string().min(1, 'Please enter your name.').max(50),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores.'),
})

authRouter.post('/register', authLimiter, async (req: Request, res: Response) => {
  const result = signUpSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }

  const { email, password, displayName, username } = result.data

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing) {
    const field = existing.email === email ? 'email' : 'username'
    return res.status(409).json({ error: `That ${field} is already taken.` })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, username, displayName, passwordHash },
    select: {
      id: true, email: true, username: true, displayName: true,
      avatarUrl: true, subscriptionStatus: true, points: true,
      currentStreak: true, isAdmin: true,
      notesAllowance: true, notesUsed: true, giftedCredits: true,
    },
  })

  const token = signToken(user.id)
  return res.status(201).json({ data: { token, user } })
})

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid email or password.' })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, username: true, displayName: true,
      avatarUrl: true, subscriptionStatus: true, points: true,
      currentStreak: true, isAdmin: true, passwordHash: true,
      notesAllowance: true, notesUsed: true, giftedCredits: true,
    },
  })

  // Resist timing attacks — always compare even if user not found
  const hash = user?.passwordHash ?? '$2b$12$invalidhashpadding000000000000000000000000000000000000'
  const valid = await bcrypt.compare(password, hash)

  if (!user || !valid) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const { passwordHash: _, ...safeUser } = user
  const token = signToken(user.id)
  return res.json({ data: { token, user: safeUser } })
})

// ─── Me ───────────────────────────────────────────────────────────────────────

authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, email: true, username: true, displayName: true,
      avatarUrl: true, subscriptionStatus: true, points: true,
      currentStreak: true, isAdmin: true,
      notesAllowance: true, notesUsed: true, giftedCredits: true,
    },
  })

  if (!user) return res.status(404).json({ error: 'Account not found.' })
  return res.json({ data: user })
})

// ─── Forgot Password ────────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().email(),
})

authRouter.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  const result = forgotSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  const user = await prisma.user.findUnique({ where: { email: result.data.email } })

  // Always return success to avoid revealing which emails exist
  if (!user) {
    return res.json({ data: { message: 'If that email is in our system, we sent a reset link.' } })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  })

  const resetUrl = `${WEB_URL}/reset-password?token=${token}`
  console.log(`[Password Reset] ${user.email} → ${resetUrl}`)

  // TODO: send email via SendGrid when keys are configured

  return res.json({ data: { message: 'If that email is in our system, we sent a reset link.' } })
})

// ─── Reset Password ─────────────────────────────────────────────────────────

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

authRouter.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  const result = resetSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }

  const reset = await prisma.passwordReset.findUnique({
    where: { token: result.data.token },
  })

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return res.status(400).json({ error: 'This reset link has expired or already been used. Request a new one.' })
  }

  const passwordHash = await bcrypt.hash(result.data.password, 12)

  await prisma.user.update({
    where: { id: reset.userId },
    data: { passwordHash },
  })

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  })

  return res.json({ data: { message: 'Password updated! You can log in now.' } })
})
