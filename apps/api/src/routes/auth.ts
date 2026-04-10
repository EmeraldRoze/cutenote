import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import rateLimit from 'express-rate-limit'

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
    return res.status(400).json({ error: result.error.errors[0].message })
  }

  const { email, password, displayName, username } = result.data

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    return res.status(400).json({ error: 'An account with that email already exists.' })
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) {
    return res.status(400).json({ error: 'That username is taken. Try another.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, passwordHash, displayName, username },
    select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, subscriptionStatus: true, points: true, currentStreak: true },
  })

  const token = signToken(user.id)
  return res.status(201).json({ data: { user, token } })
})

// ─── Log In ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Please enter your email and password.' })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }

  const token = signToken(user.id)
  return res.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        subscriptionStatus: user.subscriptionStatus,
        points: user.points,
        currentStreak: user.currentStreak,
      },
      token,
    },
  })
})

// ─── Me ───────────────────────────────────────────────────────────────────────

import { requireAuth, AuthRequest } from '../middleware/auth'

authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      subscriptionStatus: true,
      notesAllowance: true,
      notesUsed: true,
      giftedCredits: true,
      points: true,
      currentStreak: true,
      longestStreak: true,
      isAdmin: true,
    },
  })
  if (!user) return res.status(404).json({ error: 'Account not found.' })
  return res.json({ data: user })
})
