'use server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized')
}

export async function getUsers() {
  await checkAdmin()
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createUser(formData: FormData) {
  await checkAdmin()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { email, name, role, password: hashedPassword } })
  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  await checkAdmin()
  const id = formData.get('userId') as string
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/users')
}
