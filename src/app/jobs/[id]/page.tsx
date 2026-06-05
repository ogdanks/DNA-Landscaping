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
}

interface Job {
  id: string
  title: string
  description?: string
  status: string
  scheduledDate?: string
  completedDate?: string
  price?: number
  notes?: string
  customerId: string
  customer?: Customer
  createdAt: string
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      params.then(p => {
        setId(p.id)
        fetchJob(p.id)
      })
    }
  }, [status, router, params])

  async function fetchJob(jobId: string) {
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`)
      const data = await res.json()
      setJob(data)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <Link href="/jobs" className="text-green-600 hover:text-green-700">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold text-green-600">Landscaping App</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link href="/customers" className="text-gray-700 hover:text-gray-900">Customers</Link>
              <Link href="/jobs" className="text-green-600 font-medium">Jobs</Link>
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
          <Link href="/jobs" className="text-green-600 hover:text-green-700">
            ← Back to Jobs
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              {job.price && (
                <div className="text-2xl font-bold text-green-600">
                  ${job.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
              {job.customer ? (
                <div>
                  <Link href={`/customers/${job.customerId}`} className="text-lg font-medium text-green-600 hover:text-green-700">
                    {job.customer.name}
                  </Link>
                  {job.customer.email && (
                    <div className="text-gray-600">{job.customer.email}</div>
                  )}
                  {job.customer.phone && (
                    <div className="text-gray-600">{job.customer.phone}</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No customer assigned</div>
              )}
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Schedule</h3>
              <div className="space-y-1">
                {job.scheduledDate ? (
                  <div>
                    <span className="text-gray-600">Scheduled: </span>
                    <span className="text-gray-900">{new Date(job.scheduledDate).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div className="text-gray-500">No scheduled date</div>
                )}
                <div>
                  <span className="text-gray-600">Created: </span>
                  <span className="text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900">{job.description}</p>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-900">{job.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
            <Link
              href={`/jobs?edit=${job.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Edit Job
            </Link>
            <Link
              href="/jobs"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
