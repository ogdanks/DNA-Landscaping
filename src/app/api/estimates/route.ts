import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default user ID if not available
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user-id'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const estimate = await prisma.estimate.findUnique({
        where: { id },
        include: { customer: true }
      })
      return NextResponse.json(estimate)
    }

    const estimates = await prisma.estimate.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(estimates)
  } catch (error) {
    console.error('Error fetching estimates:', error)
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Get the first user as the creator
    let userId = body.userId || DEFAULT_USER_ID
    try {
      const firstUser = await prisma.user.findFirst()
      if (firstUser) {
        userId = firstUser.id
      }
    } catch {
      // No user found, fall back to DEFAULT_USER_ID
    }
    
    const estimate = await prisma.estimate.create({
      data: {
        title: body.title,
        description: body.description || null,
        amount: body.price ? parseFloat(body.price) : 0,
        status: body.status || 'pending',
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        customerId: body.customerId,
        userId: userId
      },
      include: { customer: true }
    })
    return NextResponse.json(estimate)
  } catch (error) {
    console.error('Error creating estimate:', error)
    return NextResponse.json({ error: 'Failed to create estimate', details: errorMessage(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Estimate ID required' }, { status: 400 })
    }

    const body = await request.json()
    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        amount: body.price ? parseFloat(body.price) : 0,
        status: body.status || 'pending',
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        customerId: body.customerId
      },
      include: { customer: true }
    })
    return NextResponse.json(estimate)
  } catch (error) {
    console.error('Error updating estimate:', error)
    return NextResponse.json({ error: 'Failed to update estimate', details: errorMessage(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Estimate ID required' }, { status: 400 })
    }

    await prisma.estimate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting estimate:', error)
    return NextResponse.json({ error: 'Failed to delete estimate' }, { status: 500 })
  }
}
