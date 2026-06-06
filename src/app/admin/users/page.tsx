import { getUsers, createUser, deleteUser } from './actions'

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User Management</h1>
      
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Add User</h2>
        <form action={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="email" type="email" placeholder="Email" className="border p-2 rounded" required />
          <input name="name" type="text" placeholder="Name" className="border p-2 rounded" />
          <input name="password" type="password" placeholder="Password" className="border p-2 rounded" required />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">Create</button>
        </form>
      </section>

      <section className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id}>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <form action={deleteUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
