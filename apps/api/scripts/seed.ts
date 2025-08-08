import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.user.create({ data: { email: 'demo@example.com', hash: 'x' } })
  } catch (_) {}
  const count = await prisma.user.count()
  console.log(`COUNT ${count}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
