const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  // Ensure DATABASE_URL is set in your environment
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Set password to 'admin123' (change as needed)
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const updatedUser = await prisma.user.upsert({
      where: { email: 'admin@landscaping.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@landscaping.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    });
    console.log('Successfully set password for:', updatedUser.email);
    console.log('Password is now: admin123');
  } catch (error) {
    console.error('Error updating user password:', error.message || error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetPassword();
