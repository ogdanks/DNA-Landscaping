'use server'
import {
  createUser as createUserServer,
  updateUserRole,
  deleteUser as deleteUserServer,
  resetPassword as resetPasswordServer,
  getUsers,
} from './actions'

export const createUser = async (formData: FormData) => {
  // createUser in actions.ts already expects FormData, forward directly
  return createUserServer(formData)
}

export const updateUserRoleAction = async (formData: FormData) => {
  const userId = formData.get('userId') as string
  const role = formData.get('role') as string
  if (!userId || !role) throw new Error('Missing fields')
  return updateUserRole(userId, role)
}

export const deleteUser = async (formData: FormData) => {
  const userId = formData.get('userId') as string
  if (!userId) throw new Error('Missing userId')
  return deleteUserServer(userId)
}

export const resetPassword = async (formData: FormData) => {
  const userId = formData.get('userId') as string
  const newPass = (formData.get('newPass') as string) || 'TempPass123!'
  if (!userId) throw new Error('Missing userId')
  return resetPasswordServer(userId, newPass)
}

// allow server-side code to reuse getUsers if needed elsewhere
export { getUsers as fetchUsers } from './actions'
