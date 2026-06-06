import AuthLayout from '@/components/auth-layout'

export default function EstimatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
