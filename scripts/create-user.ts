import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

/**
 * Creates (or resets) an admin user.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." npm run create-user
 *
 * Optional overrides (otherwise the defaults below are used):
 *   ADMIN_EMAIL="me@example.com" ADMIN_PASSWORD="my-strong-pw" ADMIN_NAME="Me" \
 *     DATABASE_URL="postgres://..." npm run create-user
 */
async function createUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@landscaping.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Admin'

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set. Pass it inline, e.g.:')
    console.error('  DATABASE_URL="postgres://..." npm run create-user')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const hashedPassword = await bcrypt.hash(password, 10)

  // upsert => safe to run repeatedly; resets the password if the user exists.
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name, role: 'admin' },
    create: { email, password: hashedPassword, name, role: 'admin' },
  })

  console.log('✅ Admin user ready:')
  console.log('   Email:   ', user.email)
  console.log('   Password:', password)
  console.log('   Log in at /login')

  await prisma.$disconnect()
  await pool.end()
}

createUser().catch((error) => {
  console.error('Failed to create user:', error)
  process.exit(1)
})
