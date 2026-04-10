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

const app = express()
const PORT = process.env.PORT ?? 4000

// ─── Security & middleware ────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.WEB_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(express.json({ limit: '1mb' }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/notes', notesRouter)
app.use('/ai', aiRouter)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cutenote-api' })
})

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.listen(PORT, () => {
  console.log(`CuteNote API running on http://localhost:${PORT}`)
})
