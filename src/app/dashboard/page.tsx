'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
}

interface Job {
  id: string
  title: string
  status: string
  price?: number
}

interface Estimate {
  id: string
  title: string
  status: string
  price?: number
}

interface Invoice {
  id: string
  title: string
  status: string
  amount?: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    totalEstimates: 0,
    pendingEstimates: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  async function fetchStats() {
    try {
      const [customersRes, jobsRes, estimatesRes, invoicesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/jobs'),
        fetch('/api/estimates'),
        fetch('/api/invoices')
      ])
      
      const customers: Customer[] = await customersRes.json()
      const jobs: Job[] = await jobsRes.json()
      const estimates: Estimate[] = await estimatesRes.json()
      const invoices: Invoice[] = await invoicesRes.json()
      
      const completedJobs = jobs.filter(j => j.status === 'completed')
      const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'scheduled')
      const totalRevenue = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0)
      const pendingEstimates = estimates.filter(e => e.status === 'pending')
      const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue')
      const paidInvoices = invoices.filter(i => i.status === 'paid')
      
      setStats({
        totalCustomers: customers.length,
        totalJobs: jobs.length,
        pendingJobs: pendingJobs.length,
        completedJobs: completedJobs.length,
        totalRevenue,
        totalEstimates: estimates.length,
        pendingEstimates: pendingEstimates.length,
        totalInvoices: invoices.length,
        pendingInvoices: pendingInvoices.length,
        paidInvoices: paidInvoices.length
      })
      
      setRecentJobs(jobs.slice(0, 5))
      setRecentInvoices(invoices.slice(0, 5))
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const statCards = [
    { label: 'Total Customers', value: stats.totalCustomers, color: 'bg-blue-500', href: '/customers' },
    { label: 'Total Jobs', value: stats.totalJobs, color: 'bg-green-500', href: '/jobs' },
    { label: 'Pending Jobs', value: stats.pendingJobs, color: 'bg-yellow-500', href: '/jobs' },
    { label: 'Completed Jobs', value: stats.completedJobs, color: 'bg-purple-500', href: '/jobs' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'bg-green-600', href: '/invoices' },
    { label: 'Total Estimates', value: stats.totalEstimates, color: 'bg-indigo-500', href: '/estimates' },
    { label: 'Pending Estimates', value: stats.pendingEstimates, color: 'bg-orange-500', href: '/estimates' },
    { label: 'Total Invoices', value: stats.totalInvoices, color: 'bg-pink-500', href: '/invoices' },
    { label: 'Paid Invoices', value: stats.paidInvoices, color: 'bg-green-400', href: '/invoices' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, color: 'bg-yellow-400', href: '/invoices' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold text-green-600">Landscaping App</Link>
              <Link href="/dashboard" className="text-green-600 font-medium">Dashboard</Link>
              <Link href="/customers" className="text-gray-700 hover:text-gray-900">Customers</Link>
              <Link href="/jobs" className="text-gray-700 hover:text-gray-900">Jobs</Link>
              <Link href="/estimates" className="text-gray-700 hover:text-gray-900">Estimates</Link>
              <Link href="/invoices" className="text-gray-700 hover:text-gray-900">Invoices</Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{session?.user?.email}</span>
              <button onClick={() => router.push('/login')} className="text-sm text-gray-700 hover:text-gray-900">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className={`${stat.color} text-white p-4 rounded-lg shadow hover:opacity-90 transition-opacity cursor-pointer`}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Jobs</h3>
              <Link href="/jobs" className="text-sm text-green-600 hover:text-green-700">
                View all →
              </Link>
            </div>
            {recentJobs.length === 0 ? (
              <p className="text-gray-500">No jobs yet. <Link href="/jobs" className="text-green-600">Add your first job</Link></p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <Link href={`/jobs/${job.id}`} className="font-medium text-gray-900 hover:text-green-600">
                        {job.title}
                      </Link>
                      <div className="text-sm text-gray-500">{job.price ? `$${job.price.toFixed(2)}` : 'No price'}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
              <Link href="/invoices" className="text-sm text-green-600 hover:text-green-700">
                View all →
              </Link>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-gray-500">No invoices yet. <Link href="/invoices" className="text-green-600">Create your first invoice</Link></p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.id}</div>
                      <div className="text-sm text-gray-500">{invoice.amount ? `$${invoice.amount.toFixed(2)}` : 'No amount'}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/customers" className="block w-full bg-blue-50 text-blue-700 p-4 rounded-lg hover:bg-blue-100 text-center">
              <div className="font-medium text-lg">Add Customer</div>
              <div className="text-sm">Add a new customer</div>
            </Link>
            <Link href="/jobs" className="block w-full bg-green-50 text-green-700 p-4 rounded-lg hover:bg-green-100 text-center">
              <div className="font-medium text-lg">Add Job</div>
              <div className="text-sm">Create a new job</div>
            </Link>
            <Link href="/estimates" className="block w-full bg-indigo-50 text-indigo-700 p-4 rounded-lg hover:bg-indigo-100 text-center">
              <div className="font-medium text-lg">New Estimate</div>
              <div className="text-sm">Create an estimate</div>
            </Link>
            <Link href="/invoices" className="block w-full bg-pink-50 text-pink-700 p-4 rounded-lg hover:bg-pink-100 text-center">
              <div className="font-medium text-lg">New Invoice</div>
              <div className="text-sm">Create an invoice</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
