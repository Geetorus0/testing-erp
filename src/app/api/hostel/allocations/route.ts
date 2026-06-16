import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/hostel/allocations - Get allocations list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'

    // Check if searching for students (for allocation dropdown)
    if (searchParams.get('search')) {
      const searchQuery = searchParams.get('search') || ''
      
      const students = await db.student.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { rollNumber: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          id: true,
          name: true,
          rollNumber: true,
          department: {
            select: { name: true }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: { students }
      })
    }

    // Build filter conditions
    const where: Record<string, unknown> = { tenantId }
    
    const status = searchParams.get('status')
    if (status && status !== 'all') {
      where.status = status
    }

    const hostelId = searchParams.get('hostelId')
    if (hostelId && hostelId !== 'all') {
      where.room = { hostelId }
    }

    const search = searchParams.get('search')
    if (search) {
      where.student = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { rollNumber: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    // Get total count
    const total = await db.roomAllocation.count({ where })

    // Get allocations
    const allocations = await db.roomAllocation.findMany({
      where,
      include: {
        room: {
          include: {
            hostel: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            department: {
              select: {
                name: true,
                code: true
              }
            },
            course: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    })

    return NextResponse.json({
      success: true,
      data: {
        allocations,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    console.error('Error fetching allocations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch allocations' },
      { status: 500 }
    )
  }
}

// POST /api/hostel/allocations - Create new allocation
export async function POST(request: NextRequest) {
  try {
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'
    const body = await request.json()
    const { roomId, studentId, bedNumber } = body

    if (!roomId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Room and student are required' },
        { status: 400 }
      )
    }

    // Check if room exists and has capacity
    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        allocations: {
          where: { status: 'active' }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    if (room.status === 'maintenance') {
      return NextResponse.json(
        { success: false, error: 'Room is under maintenance' },
        { status: 400 }
      )
    }

    if (room.occupied >= room.capacity) {
      return NextResponse.json(
        { success: false, error: 'Room is full' },
        { status: 400 }
      )
    }

    // Check if student already has an active allocation
    const existingAllocation = await db.roomAllocation.findFirst({
      where: {
        studentId,
        status: 'active'
      }
    })

    if (existingAllocation) {
      return NextResponse.json(
        { success: false, error: 'Student already has an active room allocation' },
        { status: 400 }
      )
    }

    // Create allocation
    const allocation = await db.roomAllocation.create({
      data: {
        tenantId,
        roomId,
        studentId,
        bedNumber,
        allocationDate: new Date(),
        status: 'active'
      }
    })

    // Update room occupancy
    const newOccupied = room.occupied + 1
    await db.room.update({
      where: { id: roomId },
      data: {
        occupied: newOccupied,
        status: newOccupied >= room.capacity ? 'full' : 'available'
      }
    })

    return NextResponse.json({
      success: true,
      data: allocation
    })
  } catch (error) {
    console.error('Error creating allocation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create allocation' },
      { status: 500 }
    )
  }
}

// PUT /api/hostel/allocations - Update allocation (vacate)
export async function PUT(request: NextRequest) {
  try {
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'
    const body = await request.json()
    const { roomId, allocationId, action } = body

    if (action === 'vacate') {
      // Vacate by room ID (vacate all occupants)
      if (roomId) {
        const room = await db.room.findUnique({
          where: { id: roomId },
          include: {
            allocations: {
              where: { status: 'active' }
            }
          }
        })

        if (!room) {
          return NextResponse.json(
            { success: false, error: 'Room not found' },
            { status: 404 }
          )
        }

        // Update all active allocations to vacated
        await db.roomAllocation.updateMany({
          where: {
            roomId,
            status: 'active'
          },
          data: {
            status: 'vacated',
            vacateDate: new Date()
          }
        })

        // Update room occupancy
        await db.room.update({
          where: { id: roomId },
          data: {
            occupied: 0,
            status: 'available'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Room vacated successfully'
        })
      }

      // Vacate by allocation ID (single student)
      if (allocationId) {
        const allocation = await db.roomAllocation.findUnique({
          where: { id: allocationId },
          include: { room: true }
        })

        if (!allocation) {
          return NextResponse.json(
            { success: false, error: 'Allocation not found' },
            { status: 404 }
          )
        }

        // Update allocation
        await db.roomAllocation.update({
          where: { id: allocationId },
          data: {
            status: 'vacated',
            vacateDate: new Date()
          }
        })

        // Update room occupancy
        const newOccupied = allocation.room.occupied - 1
        await db.room.update({
          where: { id: allocation.roomId },
          data: {
            occupied: Math.max(0, newOccupied),
            status: newOccupied <= 0 ? 'available' : allocation.room.status === 'full' ? 'available' : allocation.room.status
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Student vacated successfully'
        })
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating allocation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update allocation' },
      { status: 500 }
    )
  }
}
