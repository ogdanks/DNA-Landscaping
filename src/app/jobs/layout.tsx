'use client'

import { SessionProvider } from 'next-auth/react'

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
