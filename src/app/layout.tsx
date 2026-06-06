import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Landscaping App - Manage Your Business",
  description: "The all-in-one solution for landscaping businesses",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <span className="text-lg font-semibold">Landscaping App</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-sm">Home</Link>
              {session ? (
                <>
                  <span className="text-sm">Hi, {session.user?.name || session.user?.email}</span>
                  {session.user?.role === 'admin' && (
                    <Link href="/admin/users" className="text-sm bg-indigo-600 px-2 py-1 rounded">Manage Users</Link>
                  )}
                  <Link href="/api/auth/signout" className="text-sm">Logout</Link>
                </>
              ) : (
                <Link href="/login" className="text-sm">Login</Link>
              )}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
