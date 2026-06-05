"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

interface Customer {
  name: string;
  email: string;
}

interface Job {
  title: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer | null;
  job: Job | null;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
  notes: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");

  // Company branding
  const companyName = "GreenScapes Landscaping";
  const companyAddress = "123 Garden Lane\nGreenfield, ST 12345";
  const companyPhone = "(555) 123-4567";
  const companyEmail = "info@greenscapes.com";

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!invoice || !invoice.customer?.email) {
      setError("No customer email available");
      return;
    }

    setEmailLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invoices/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          to: invoice.customer.email,
          customerName: invoice.customer.name,
          amount: invoice.amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
          setEmailLoading(false);
          setError("");
        }, 2000);
      } else {
        setError(data.error || "Failed to send email");
        setEmailLoading(false);
      }
    } catch (err) {
      setError("Failed to send email");
      setEmailLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPaymentLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber,
          expiry,
          cvv,
          postalCode,
          amount: invoice!.amount,
          invoiceId: invoice!.id,
          sandbox: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetch(`/api/invoices/${invoice!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "paid" }),
        });

        setInvoice({ ...invoice!, status: "paid" });
        setShowPaymentModal(false);
        setCardNumber("");
        setExpiry("");
        setCvv("");
        setPostalCode("");
      } else {
        setError(data.error || "Payment failed");
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Invoice not found</h1>
          <Link href="/invoices" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const customerName = invoice.customer?.name || "N/A";
  const customerEmail = invoice.customer?.email || "";
  const jobTitle = invoice.job?.title || "";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/invoices" className="text-blue-600 hover:text-blue-800 hover:underline">
            ← Back to Invoices
          </Link>
          <div className="flex gap-3">
            {invoice.status !== "paid" && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Pay Now
              </button>
            )}
            <button
              onClick={() => setShowEmailModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Email Invoice
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none print:rounded-none">
          {/* Company Header */}
          <div className="mb-8 border-b-2 border-green-600 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-green-700 mb-2">{companyName}</h1>
                <pre className="text-gray-600 text-sm whitespace-pre-line">{companyAddress}</pre>
                <p className="text-gray-600 text-sm mt-2">Phone: {companyPhone}</p>
                <p className="text-gray-600 text-sm">{companyEmail}</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-gray-600 mt-2">Invoice #{invoice.invoiceNumber}</p>
                <p className="text-gray-600">
                  Date: {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                </p>
                <p className="text-gray-600">
                  Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Bill To & Job Info */}
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">BILL TO:</h3>
              <p className="text-xl font-semibold text-gray-900">{customerName}</p>
              {customerEmail && (
                <p className="text-gray-600 mt-1">{customerEmail}</p>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">JOB:</h3>
              <p className="text-lg font-medium text-gray-900">{jobTitle || "-"}</p>
              <h3 className="text-sm font-bold text-gray-500 mb-2 mt-4 uppercase tracking-wide">STATUS:</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "sent"
                    ? "bg-blue-100 text-blue-800"
                    : invoice.status === "overdue"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Services Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-green-600">
                <th className="text-left py-3 text-sm font-bold text-gray-700 uppercase tracking-wide">DESCRIPTION</th>
                <th className="text-right py-3 text-sm font-bold text-gray-700 uppercase tracking-wide">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-900">
                  <p className="font-medium">{jobTitle || "Landscaping Services"}</p>
                  {invoice.notes && <p className="text-gray-600 text-sm mt-1">{invoice.notes}</p>}
                </td>
                <td className="py-4 text-right font-medium text-gray-900">
                  ${invoice.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t-2 border-gray-200 pt-6 text-right">
            <div className="flex justify-between text-gray-600 mb-2">
              <span className="text-lg">Subtotal:</span>
              <span className="text-lg">${invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span className="text-lg">Tax (0%):</span>
              <span className="text-lg">$0.00</span>
            </div>
            <div className="flex justify-between text-3xl font-bold text-green-700 mt-4 pt-4 border-t-2 border-green-600">
              <span>TOTAL DUE:</span>
              <span>${invoice.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Thank you for your business! Questions? Contact us at {companyEmail} or {companyPhone}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Payment is due upon receipt. Please make checks payable to {companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Pay Invoice #{invoice.invoiceNumber}</h2>
            <p className="text-gray-600 mb-6">Amount: ${invoice.amount.toFixed(2)}</p>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111111111111111"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowPaymentModal(false); setError(""); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {paymentLoading ? "Processing..." : `Pay $${invoice.amount.toFixed(2)}`}
                </button>
              </div>
            </form>
            
            <p className="text-xs text-gray-500 mt-4 text-center">🧪 Sandbox mode - Test card: 4111111111111111</p>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Email Invoice</h2>
            
            {emailSent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Email Sent!</h3>
                <p className="text-gray-600">Invoice sent to {customerEmail}</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-2">Sending to:</p>
                  <p className="font-medium text-gray-900">{customerEmail}</p>
                  <p className="text-sm text-gray-600 mt-3">Amount: ${invoice.amount.toFixed(2)}</p>
                </div>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowEmailModal(false); setError(""); }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmailInvoice}
                    disabled={emailLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {emailLoading ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:shadow-none {
            shadow: none;
          }
          .print\\:rounded-none {
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}
