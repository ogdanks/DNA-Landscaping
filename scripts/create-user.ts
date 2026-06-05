import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

async function createUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'admin@landscaping.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('User created:', user.email)

  await prisma.$disconnect()
  await pool.end()
}

createUser().catch((error) => {
  console.error('Failed to create user:', error)
  process.exit(1)
})
