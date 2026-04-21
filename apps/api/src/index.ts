import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Find .env walking up from cwd
let envPath = path.resolve(process.cwd(), '.env')
if (!fs.existsSync(envPath)) envPath = path.resolve(process.cwd(), '../../.env')
dotenv.config({ path: envPath })
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'

import { authRouter } from './routes/auth'
import { usersRouter } from './routes/users'
import { notesRouter } from './routes/notes'
import { aiRouter } from './routes/ai'
import { connectionsRouter } from './routes/connections'
import { addressRouter } from './routes/address'
import { stripeRouter, handleStripeWebhook } from './routes/stripe'
import { passItForwardRouter } from './routes/pass-it-forward'
import { adminRouter } from './routes/admin'
import { feedRouter } from './routes/feed'
import { importantDatesRouter } from './routes/important-dates'
import { invitesRouter } from './routes/invites'

const app = express()
const PORT = process.env.PORT ?? 4000

// ─── Security & middleware ────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: [
    process.env.WEB_URL ?? 'http://localhost:3000',
    'https://qutenote.com',
    'https://www.qutenote.com',
    'https://cutenote.club',
    'https://www.cutenote.club',
  ],
  credentials: true,
}))
app.use(compression())

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

app.use(express.json({ limit: '1mb' }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/notes', notesRouter)
app.use('/ai', aiRouter)
app.use('/connections', connectionsRouter)
app.use('/address', addressRouter)
app.use('/stripe', stripeRouter)
app.use('/pass-it-forward', passItForwardRouter)
app.use('/admin', adminRouter)
app.use('/feed', feedRouter)
app.use('/important-dates', importantDatesRouter)
app.use('/invites', invitesRouter)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'qutenote-api' })
})

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.listen(PORT, () => {
  console.log(`QuteNote API running on http://localhost:${PORT}`)
})
