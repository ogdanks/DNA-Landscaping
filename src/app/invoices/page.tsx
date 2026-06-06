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
  price?: number
  customerId: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  dueDate: string
  paidDate?: string
  notes?: string
  customerId: string
  customer?: Customer
  jobId?: string
  job?: Job
  createdAt: string
}

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectingInvoice, setSelectingInvoice] = useState<Invoice | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [postalCode, setPostalCode] = useState('')
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    amount: '',
    status: 'pending',
    dueDate: '',
    notes: '',
    customerId: '',
    jobId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchInvoices()
      fetchCustomers()
      fetchJobs()
    }
  }, [status, router])

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setInvoices(data)
      } else {
        console.error('Expected array but got:', data)
        setInvoices([])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  async function fetchJobs() {
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const url = editingInvoice 
        ? `/api/invoices?id=${editingInvoice.id}`
        : '/api/invoices'
      
      const res = await fetch(url, {
        method: editingInvoice ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        })
      })

      if (res.ok) {
        fetchInvoices()
        setShowModal(false)
        setEditingInvoice(null)
        setFormData({ invoiceNumber: '', amount: '', status: 'pending', dueDate: '', notes: '', customerId: '', jobId: '' })
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
    }
  }

  async function handlePayment() {
    if (!selectingInvoice) return

    if (!cardNumber || !expiry || !cvv || !postalCode) {
      alert('Please fill in all payment details')
      return
    }

    setPaymentProcessing(true)

    try {
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber,
          expiry,
          cvv,
          postalCode,
          amount: selectingInvoice.amount,
          invoiceId: selectingInvoice.id,
          sandbox: true
        })
      })

      const paymentData = await paymentRes.json()

      if (paymentRes.ok && paymentData.success) {
        await fetch(`/api/invoices?id=${selectingInvoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...selectingInvoice,
            status: 'paid',
            paidDate: new Date().toISOString()
          })
        })

        fetchInvoices()
        setShowPaymentModal(false)
        setSelectingInvoice(null)
        setPaymentProcessing(false)
        setCardNumber('')
        setExpiry('')
        setCvv('')
        setPostalCode('')
        alert('Payment successful! Invoice marked as paid.')
      } else {
        throw new Error(paymentData.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Payment failed: ' + (error as Error).message)
      setPaymentProcessing(false)
    }
  }

  function handlePay(invoice: Invoice) {
    setSelectingInvoice(invoice)
    setShowPaymentModal(true)
  }

  function handleEdit(invoice: Invoice) {
    setEditingInvoice(invoice)
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount.toString(),
      status: invoice.status,
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      notes: invoice.notes || '',
      customerId: invoice.customerId,
      jobId: invoice.jobId || ''
    })
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  function getStatusColor(status: string) {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
  }

  const safeInvoices = Array.isArray(invoices) ? invoices : []
  const totalRevenue = safeInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const pendingAmount = safeInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
              <Link href="/jobs" className="text-gray-700 hover:text-gray-900">Jobs</Link>
              <Link href="/estimates" className="text-gray-700 hover:text-gray-900">Estimates</Link>
              <Link href="/invoices" className="text-green-600 font-medium">Invoices</Link>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            disabled={customers.length === 0}
          >
            New Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">Total Revenue (Paid)</div>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">Pending Amount</div>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
          </div>
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">Total Invoices</div>
            <div className="text-2xl font-bold">{safeInvoices.length}</div>
          </div>
        </div>

        {customers.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">
              You need to add customers first.{' '}
              <Link href="/customers" className="text-green-600 underline font-medium">
                Add Customer
              </Link>
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No invoices yet. {customers.length > 0 ? 'Create your first invoice!' : 'Add customers first.'}
                  </td>
                </tr>
              ) : (
                safeInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900"><Link href={"/invoices/" + invoice.id} className="text-blue-600 hover:text-blue-800">{invoice.invoiceNumber}</Link></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{invoice.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{invoice.job?.title || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {statusOptions.find(s => s.value === invoice.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <button
                          onClick={() => handlePay(invoice)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Pay with Square"
                        >
                          💳 Pay
                        </button>
                      )}
                      <button onClick={() => handleEdit(invoice)} className="text-green-600 hover:text-green-900 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create/Edit Invoice Modal */}
      {showModal && customers.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={`INV-${Date.now()}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job (optional)</label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No job</option>
                  {jobs.filter(j => j.customerId === formData.customerId).map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Invoice notes..."
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingInvoice(null); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingInvoice ? 'Update' : 'Create'} Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Pay Invoice</h3>
            <p className="text-sm text-gray-600 mb-4">Sandbox Mode - No real payment</p>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Invoice:</strong> {selectingInvoice.invoiceNumber}
              </p>
              <p className="text-gray-700">
                <strong>Amount:</strong> <span className="text-green-600 text-lg font-bold">
                  ${selectingInvoice.amount.toFixed(2)}
                </span>
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="4111111111111111"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength={16}
                />
                <p className="text-xs text-gray-500 mt-1">Test: 4111111111111111</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength={5}
                />
              </div>
              
              <button
                onClick={handlePayment}
                disabled={paymentProcessing}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {paymentProcessing ? 'Processing...' : `Pay $${selectingInvoice.amount.toFixed(2)}`}
              </button>
              
              <div className="text-xs text-gray-500 text-center">
                <strong>Sandbox test card:</strong> 4111 1111 1111 1111<br />
                <strong>Expiry:</strong> Any future date (e.g., 12/25)<br />
                <strong>CVV:</strong> Any 3 digits (e.g., 123)<br />
                <strong>Postal:</strong> Any 5 digits (e.g., 12345)
              </div>
            </div>
            
            <button
              onClick={() => { setShowPaymentModal(false); setSelectingInvoice(null); setCardNumber(''); setExpiry(''); setCvv(''); setPostalCode(''); }}
              className="mt-4 w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
