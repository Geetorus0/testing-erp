import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all buses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    const whereClause: Record<string, unknown> = tenantId ? { tenantId } : {}
    if (status && status !== 'all') {
      whereClause.status = status
    }

    const buses = await db.bus.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ buses })
  } catch (error) {
    console.error('Error fetching buses:', error)

    // Return demo data on error
    return NextResponse.json({
      buses: [
        {
          id: 'bus-1',
          busNumber: 'TN-01-1234',
          registrationNumber: 'TN01AB1234',
          capacity: 45,
          driverName: 'Rajesh Kumar',
          driverPhone: '9876543210',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'bus-2',
          busNumber: 'TN-01-5678',
          registrationNumber: 'TN01CD5678',
          capacity: 40,
          driverName: 'Suresh Babu',
          driverPhone: '9876543211',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'bus-3',
          busNumber: 'TN-01-9012',
          registrationNumber: 'TN01EF9012',
          capacity: 35,
          driverName: 'Mohan Das',
          driverPhone: '9876543212',
          status: 'maintenance',
          createdAt: new Date().toISOString()
        },
        {
          id: 'bus-4',
          busNumber: 'TN-01-3456',
          registrationNumber: 'TN01GH3456',
          capacity: 50,
          driverName: 'Anil Verma',
          driverPhone: '9876543213',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'bus-5',
          busNumber: 'TN-01-7890',
          registrationNumber: 'TN01IJ7890',
          capacity: 42,
          driverName: 'Deepak Singh',
          driverPhone: '9876543214',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
    })
  }
}

// POST - Create or update bus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, busNumber, registrationNumber, capacity, driverName, driverPhone, status } = body

    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    if (!busNumber || !busNumber.trim()) {
      return NextResponse.json({ error: 'Bus number is required' }, { status: 400 })
    }

    if (id) {
      // Update existing bus
      const updatedBus = await db.bus.update({
        where: { id },
        data: {
          busNumber: busNumber.trim(),
          registrationNumber: registrationNumber?.trim() || null,
          capacity: parseInt(capacity) || 40,
          driverName: driverName?.trim() || null,
          driverPhone: driverPhone?.trim() || null,
          status: status || 'active'
        }
      })
      return NextResponse.json({ bus: updatedBus })
    } else {
      // Check for duplicate bus number
      const existingBus = await db.bus.findFirst({
        where: {
          tenantId,
          busNumber: busNumber.trim()
        }
      })

      if (existingBus) {
        return NextResponse.json({ error: 'Bus number already exists' }, { status: 400 })
      }

      // Create new bus
      const newBus = await db.bus.create({
        data: {
          tenantId,
          busNumber: busNumber.trim(),
          registrationNumber: registrationNumber?.trim() || null,
          capacity: parseInt(capacity) || 40,
          driverName: driverName?.trim() || null,
          driverPhone: driverPhone?.trim() || null,
          status: status || 'active'
        }
      })
      return NextResponse.json({ bus: newBus })
    }
  } catch (error) {
    console.error('Error saving bus:', error)
    return NextResponse.json({ error: 'Failed to save bus' }, { status: 500 })
  }
}

// DELETE - Delete bus
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Bus ID is required' }, { status: 400 })
    }

    // Check if bus has routes
    const routes = await db.busRoute.findFirst({
      where: { busId: id }
    })

    if (routes) {
      return NextResponse.json({ error: 'Cannot delete bus with assigned routes' }, { status: 400 })
    }

    await db.bus.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bus:', error)
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 })
  }
}
