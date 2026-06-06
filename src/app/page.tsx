import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-green-800 mb-6">🌿 Landscaping App</h1>
        <p className="text-xl text-green-700 mb-10">Manage Your Landscaping Business With Ease</p>

        {!session ? (
          <Link
            href="/login"
            className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition inline-block"
          >
            Sign In
          </Link>
        ) : (
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition inline-block"
            >
              Go to Dashboard
            </Link>
            {session.user?.role === "admin" && (
              <Link
                href="/admin/users"
                className="ml-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition inline-block"
              >
                Manage Users
              </Link>
            )}
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
            <p className="text-gray-600">Track customers and service history.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-semibold mb-2">Job Management</h3>
            <p className="text-gray-600">Schedule and track jobs.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-semibold mb-2">Estimates & Invoices</h3>
            <p className="text-gray-600">Create estimates and track payments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
