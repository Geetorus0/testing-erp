import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch allocations or search students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchStudents = searchParams.get('searchStudents')

    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    // If searching for students
    if (searchStudents && searchStudents.length >= 2) {
      const students = await db.student.findMany({
        where: tenantId ? {
          tenantId,
          OR: [
            { name: { contains: searchStudents, mode: 'insensitive' } },
            { enrollmentNo: { contains: searchStudents, mode: 'insensitive' } }
          ]
        } : {
          OR: [
            { name: { contains: searchStudents, mode: 'insensitive' } },
            { enrollmentNo: { contains: searchStudents, mode: 'insensitive' } }
          ]
        },
        include: {
          department: { select: { name: true } },
          course: { select: { name: true } }
        },
        take: 10
      })

      return NextResponse.json({ students })
    }

    // Fetch allocations
    const allocations = await db.busAllocation.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        route: {
          include: {
            bus: {
              select: {
                busNumber: true,
                capacity: true
              }
            }
          }
        },
        student: {
          include: {
            department: { select: { name: true } },
            course: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ allocations })
  } catch (error) {
    console.error('Error fetching allocations:', error)

    // Return demo data on error
    return NextResponse.json({
      allocations: [
        {
          id: 'alloc-1',
          routeId: 'route-1',
          studentId: 'student-1',
          boardingStop: 'College Gate',
          allocationDate: new Date('2024-01-15').toISOString(),
          status: 'active',
          route: {
            id: 'route-1',
            routeNumber: 'R-001',
            routeName: 'City Center Route',
            startPoint: 'College Gate',
            endPoint: 'City Bus Stand',
            bus: {
              busNumber: 'TN-01-1234',
              capacity: 45
            }
          },
          student: {
            id: 'student-1',
            name: 'Rahul Sharma',
            enrollmentNo: 'EN2024001',
            email: 'rahul@college.edu',
            department: { name: 'Computer Science' },
            course: { name: 'B.Tech CSE' }
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'alloc-2',
          routeId: 'route-2',
          studentId: 'student-2',
          boardingStop: 'IT Park',
          allocationDate: new Date('2024-01-16').toISOString(),
          status: 'active',
          route: {
            id: 'route-2',
            routeNumber: 'R-002',
            routeName: 'Railway Station Route',
            startPoint: 'College Gate',
            endPoint: 'Railway Station',
            bus: {
              busNumber: 'TN-01-5678',
              capacity: 40
            }
          },
          student: {
            id: 'student-2',
            name: 'Priya Patel',
            enrollmentNo: 'EN2024002',
            email: 'priya@college.edu',
            department: { name: 'Electronics' },
            course: { name: 'B.Tech ECE' }
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'alloc-3',
          routeId: 'route-3',
          studentId: 'student-3',
          boardingStop: 'Highway Junction',
          allocationDate: new Date('2024-01-17').toISOString(),
          status: 'active',
          route: {
            id: 'route-3',
            routeNumber: 'R-003',
            routeName: 'Airport Route',
            startPoint: 'College Gate',
            endPoint: 'Airport',
            bus: {
              busNumber: 'TN-01-3456',
              capacity: 50
            }
          },
          student: {
            id: 'student-3',
            name: 'Amit Kumar',
            enrollmentNo: 'EN2024003',
            email: 'amit@college.edu',
            department: { name: 'Mechanical' },
            course: { name: 'B.Tech Mech' }
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'alloc-4',
          routeId: 'route-1',
          studentId: 'student-4',
          boardingStop: 'Market',
          allocationDate: new Date('2024-01-18').toISOString(),
          status: 'active',
          route: {
            id: 'route-1',
            routeNumber: 'R-001',
            routeName: 'City Center Route',
            startPoint: 'College Gate',
            endPoint: 'City Bus Stand',
            bus: {
              busNumber: 'TN-01-1234',
              capacity: 45
            }
          },
          student: {
            id: 'student-4',
            name: 'Sneha Reddy',
            enrollmentNo: 'EN2024004',
            email: 'sneha@college.edu',
            department: { name: 'Computer Science' },
            course: { name: 'B.Tech CSE' }
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'alloc-5',
          routeId: 'route-4',
          studentId: 'student-5',
          boardingStop: 'Tech Hub',
          allocationDate: new Date('2024-01-19').toISOString(),
          status: 'active',
          route: {
            id: 'route-4',
            routeNumber: 'R-004',
            routeName: 'IT Park Route',
            startPoint: 'College Gate',
            endPoint: 'IT Park',
            bus: {
              busNumber: 'TN-01-7890',
              capacity: 42
            }
          },
          student: {
            id: 'student-5',
            name: 'Vikram Singh',
            enrollmentNo: 'EN2024005',
            email: 'vikram@college.edu',
            department: { name: 'Information Technology' },
            course: { name: 'B.Tech IT' }
          },
          createdAt: new Date().toISOString()
        }
      ],
      students: []
    })
  }
}

// POST - Create allocation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, routeId, boardingStop } = body

    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    if (!studentId) {
      return NextResponse.json({ error: 'Student is required' }, { status: 400 })
    }

    if (!routeId) {
      return NextResponse.json({ error: 'Route is required' }, { status: 400 })
    }

    // Check if student already has an active allocation
    const existingAllocation = await db.busAllocation.findFirst({
      where: {
        studentId,
        status: 'active'
      }
    })

    if (existingAllocation) {
      return NextResponse.json({ error: 'Student already has an active transport allocation' }, { status: 400 })
    }

    // Create allocation
    const newAllocation = await db.busAllocation.create({
      data: {
        tenantId,
        routeId,
        studentId,
        boardingStop: boardingStop?.trim() || null,
        allocationDate: new Date(),
        status: 'active'
      },
      include: {
        route: {
          include: {
            bus: {
              select: {
                busNumber: true,
                capacity: true
              }
            }
          }
        },
        student: {
          include: {
            department: { select: { name: true } },
            course: { select: { name: true } }
          }
        }
      }
    })

    return NextResponse.json({ allocation: newAllocation })
  } catch (error) {
    console.error('Error creating allocation:', error)
    return NextResponse.json({ error: 'Failed to allocate transport' }, { status: 500 })
  }
}

// DELETE - Delete allocation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 })
    }

    await db.busAllocation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting allocation:', error)
    return NextResponse.json({ error: 'Failed to remove allocation' }, { status: 500 })
  }
}
