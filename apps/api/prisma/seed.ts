// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  const hash = await bcrypt.hash('password123', 12)

  // ─── Users ───────────────────────────────────────────────────────────────────

  const emerald = await prisma.user.upsert({
    where: { email: 'emerald@qutenote.com' },
    update: {},
    create: {
      email: 'emerald@qutenote.com',
      username: 'emerald',
      displayName: 'Emerald',
      passwordHash: hash,
      points: 120,
      currentStreak: 4,
      longestStreak: 7,
      subscriptionStatus: 'ACTIVE',
      notesAllowance: 5,
      notesUsed: 1,
    },
  })

  const maya = await prisma.user.upsert({
    where: { email: 'maya@qutenote.com' },
    update: {},
    create: {
      email: 'maya@qutenote.com',
      username: 'maya_k',
      displayName: 'Maya K.',
      passwordHash: hash,
      points: 80,
      currentStreak: 2,
      longestStreak: 5,
      subscriptionStatus: 'ACTIVE',
      notesAllowance: 5,
      notesUsed: 2,
    },
  })

  const sofia = await prisma.user.upsert({
    where: { email: 'sofia@qutenote.com' },
    update: {},
    create: {
      email: 'sofia@qutenote.com',
      username: 'sofia_r',
      displayName: 'Sofia R.',
      passwordHash: hash,
      points: 40,
      currentStreak: 0,
      longestStreak: 3,
      subscriptionStatus: 'FREE',
      notesAllowance: 2,
      notesUsed: 0,
    },
  })

  // ─── Addresses (encrypted placeholder values for now) ────────────────────────

  await prisma.address.upsert({
    where: { userId: maya.id },
    update: {},
    create: {
      userId: maya.id,
      encryptedLine1: 'enc_123_main_st',
      encryptedCity: 'enc_austin',
      encryptedState: 'enc_tx',
      encryptedZip: 'enc_78701',
      encryptedCountry: 'enc_us',
    },
  })

  await prisma.address.upsert({
    where: { userId: sofia.id },
    update: {},
    create: {
      userId: sofia.id,
      encryptedLine1: 'enc_456_elm_ave',
      encryptedCity: 'enc_denver',
      encryptedState: 'enc_co',
      encryptedZip: 'enc_80203',
      encryptedCountry: 'enc_us',
    },
  })

  // ─── Connections (emerald follows maya and sofia) ────────────────────────────

  await prisma.connection.upsert({
    where: {
      followerId_followingId: {
        followerId: emerald.id,
        followingId: maya.id,
      },
    },
    update: {},
    create: {
      followerId: emerald.id,
      followingId: maya.id,
      status: 'ACCEPTED',
    },
  })

  await prisma.connection.upsert({
    where: {
      followerId_followingId: {
        followerId: emerald.id,
        followingId: sofia.id,
      },
    },
    update: {},
    create: {
      followerId: emerald.id,
      followingId: sofia.id,
      status: 'ACCEPTED',
    },
  })

  console.log('✅ Done. Users: emerald, maya_k, sofia_r — all password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
