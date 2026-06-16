import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/hostel/rooms - Get rooms list with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'
    
    // Check if we're just fetching hostels list
    if (searchParams.get('hostels') === 'true') {
      const hostels = await db.hostel.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          type: true,
          totalRooms: true
        }
      })
      
      return NextResponse.json({
        success: true,
        data: { hostels }
      })
    }

    // Build filter conditions
    const where: Record<string, unknown> = { tenantId }
    
    const hostelId = searchParams.get('hostelId')
    if (hostelId && hostelId !== 'all') {
      where.hostelId = hostelId
    }

    const floor = searchParams.get('floor')
    if (floor && floor !== 'all') {
      where.floor = parseInt(floor)
    }

    const status = searchParams.get('status')
    if (status && status !== 'all') {
      where.status = status
    }

    // Get rooms with allocations
    const rooms = await db.room.findMany({
      where,
      include: {
        hostel: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        allocations: {
          where: { status: 'active' },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                rollNumber: true
              }
            }
          }
        }
      },
      orderBy: [
        { hostel: { name: 'asc' } },
        { roomNumber: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: rooms
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
