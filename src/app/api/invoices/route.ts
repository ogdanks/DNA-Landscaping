import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { customer: true, job: true }
      })
      return NextResponse.json(invoice || {})
    }

    const invoices = await prisma.invoice.findMany({
      include: { customer: true, job: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: errorMessage(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const invoiceNumber = body.invoiceNumber || `INV-${Date.now()}`
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: parseFloat(body.amount),
        status: body.status || 'pending',
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
        notes: body.notes || null,
        customerId: body.customerId,
        jobId: body.jobId || null
      },
      include: { customer: true, job: true }
    })
    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice', details: errorMessage(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    const body = await request.json()
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: body.invoiceNumber,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        status: body.status || 'pending',
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
        notes: body.notes || null,
        customerId: body.customerId,
        jobId: body.jobId || null
      },
      include: { customer: true, job: true }
    })
    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice', details: errorMessage(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    await prisma.invoice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
