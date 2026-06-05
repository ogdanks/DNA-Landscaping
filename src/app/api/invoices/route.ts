import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('Fetching invoice with id:', id)

    if (id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { customer: true, job: true }
      })
      console.log('Found invoice:', invoice)
      return NextResponse.json(invoice || {})
    }

    const invoices = await prisma.invoice.findMany({
      include: { customer: true, job: true },
      orderBy: { createdAt: 'desc' }
    })
    console.log('Found invoices:', invoices.length)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.toString() },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Creating invoice with body:', body)
    
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
    console.log('Created invoice:', invoice)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.toString() },
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
      { error: 'Failed to update invoice', details: error.toString() },
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
