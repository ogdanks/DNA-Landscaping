import AuthLayout from '@/components/auth-layout'

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
