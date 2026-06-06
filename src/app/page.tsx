import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">🌿 Landscaping App</h1>
        
        {!session ? (
          /* Not logged in → Sign In */
          <Link
            href="/login"
            className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition"
          >
            Sign In
          </Link>
        ) : (
          /* Logged in → Show options based on role */
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition inline-block"
            >
              Go to Dashboard
            </Link>
            
            {session.user.role === "admin" && (
              <Link
                href="/admin/users"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition inline-block"
              >
                Manage Users
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
