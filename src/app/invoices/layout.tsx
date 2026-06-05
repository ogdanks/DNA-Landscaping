import AuthLayout from '@/components/auth-layout'

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
