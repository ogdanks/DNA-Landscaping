'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: string
}

interface Job {
  id: string
  title: string
  status: string
  price?: number
  scheduledDate?: string
  description?: string
  customerId: string
  createdAt: string
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchCustomer(customerId: string) {
    try {
      const res = await fetch(`/api/customers?id=${customerId}`)
      const data = await res.json()
      setCustomer(data)
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  }

  async function fetchJobs(customerId: string) {
    try {
      const res = await fetch('/api/jobs')
      const allJobs: Job[] = await res.json()
      const customerJobs = allJobs.filter(j => j.customerId === customerId)
      setJobs(customerJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      params.then(p => {
        fetchCustomer(p.id)
        fetchJobs(p.id)
      })
    }
  }, [status, router, params])

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer not found</h1>
          <Link href="/customers" className="text-green-600 hover:text-green-700">
            ← Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  const totalRevenue = jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + (j.price || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold text-green-600">Landscaping App</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link href="/customers" className="text-green-600 font-medium">Customers</Link>
              <Link href="/jobs" className="text-gray-700 hover:text-gray-900">Jobs</Link>
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
        <div className="mb-6">
          <Link href="/customers" className="text-green-600 hover:text-green-700">
            ← Back to Customers
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{customer.name}</h2>
              
              <div className="space-y-3">
                {customer.email && (
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900">{customer.email}</div>
                  </div>
                )}
                {customer.phone && (
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-gray-900">{customer.phone}</div>
                  </div>
                )}
                {(customer.address || customer.city || customer.state || customer.zipCode) && (
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="text-gray-900">
                      {[customer.address, customer.city, customer.state, customer.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">Customer Since</div>
                <div className="text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">Total Jobs</div>
                <div className="text-gray-900">{jobs.length}</div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-gray-900 font-bold">${totalRevenue.toLocaleString()}</div>
              </div>

              <Link
                href={`/customers?edit=${customer.id}`}
                className="mt-6 block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Edit Customer
              </Link>
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Jobs</h3>
                <Link
                  href="/jobs"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  View all jobs →
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No jobs yet for this customer</p>
                  <Link
                    href="/jobs"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Add Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/jobs/${job.id}`} className="font-medium text-gray-900 hover:text-green-600">
                            {job.title}
                          </Link>
                          {job.description && (
                            <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {job.scheduledDate && (
                              <span>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</span>
                            )}
                            {job.price && (
                              <span>Price: ${job.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
