'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }
}

export async function getUsers() {
  await checkAdmin()
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createUser(formData: FormData) {
  await checkAdmin()
  
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  if (!email || !password) throw new Error('Email and password required')

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name,
      role,
      password: hashedPassword
    }
  })

  revalidatePath('/admin/users')
}

export async function updateUserRole(userId: string, newRole: string) {
  await checkAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })
  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  await checkAdmin()
  
  // Optional: Prevent deleting yourself
  const session = await getServerSession(authOptions)
  if (session?.user?.id === userId) {
    throw new Error('You cannot delete your own admin account')
  }

  await prisma.user.delete({
    where: { id: userId }
  })
  revalidatePath('/admin/users')
}

export async function resetPassword(userId: string, newPass: string) {
  await checkAdmin()
  const hashedPassword = await bcrypt.hash(newPass, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}
