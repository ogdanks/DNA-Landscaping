import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Server Action to create users
async function createUser(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, name, role, password: hashedPassword },
  });

  redirect("/admin/users");
}

// Server Action to delete user
async function deleteUser(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.user.delete({ where: { id } });
  redirect("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔐 User Management</h1>

        {/* Add User Form */}
        <section className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <form action={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border p-2 rounded"
              required
            />
            <input
              name="name"
              type="text"
              placeholder="Name"
              className="border p-2 rounded"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="border p-2 rounded"
              required
            />
            <select
              name="role"
              className="border p-2 rounded"
              defaultValue="user"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
            >
              Create User
            </button>
          </form>
        </section>

        {/* Users Table */}
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.name || "-"}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
