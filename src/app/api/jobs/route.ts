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

    if (id) {
      const job = await prisma.job.findUnique({
        where: { id },
        include: { customer: true }
      })
      return NextResponse.json(job)
    }

    const jobs = await prisma.job.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const job = await prisma.job.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'pending',
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        price: body.price ? parseFloat(body.price) : null,
        notes: body.notes || null,
        customerId: body.customerId
      },
      include: { customer: true }
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const body = await request.json()
    const job = await prisma.job.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'pending',
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        price: body.price ? parseFloat(body.price) : null,
        notes: body.notes || null,
        customerId: body.customerId
      },
      include: { customer: true }
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    await prisma.job.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
