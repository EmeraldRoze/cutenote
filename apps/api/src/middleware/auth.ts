import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { prisma } from '../lib/prisma'

export interface AuthRequest extends Request {
  userId?: string
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not logged in.' })
  }

  const token = authHeader.slice(7)
  try {
    const { userId } = verifyToken(token)
    // confirm user still exists
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return res.status(401).json({ error: 'Account not found.' })
    req.userId = userId
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' })
  }
}

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not logged in.' })
  }

  const token = authHeader.slice(7)
  try {
    const { userId } = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isAdmin: true } })
    if (!user) return res.status(401).json({ error: 'Account not found.' })
    if (!user.isAdmin) return res.status(403).json({ error: 'Not authorized.' })
    req.userId = userId
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' })
  }
}
