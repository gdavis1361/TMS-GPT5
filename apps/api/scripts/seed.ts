import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_SEED !== 'true') {
    console.error('Refusing to seed in production without FORCE_SEED=true')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'change-me'

    const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!existing) {
      const hash = await argon2.hash(adminPassword, { type: argon2.argon2id })
      await prisma.user.create({
        data: {
          email: adminEmail,
          hash,
          role: 'ADMIN' as unknown as import('@prisma/client').$Enums.Role,
        },
      })
      console.log(`Seeded admin user: ${adminEmail}`)
    } else {
      console.log(`Admin user already exists: ${adminEmail}`)
    }

    // Example starter data: a single contact to verify app flows
    await prisma.contact.upsert({
      where: { email: 'contact@example.com' },
      update: {},
      create: {
        name: 'Sample Contact',
        email: 'contact@example.com',
        phone: '555-0100',
      },
    })
    console.log('Seeded sample contact')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
