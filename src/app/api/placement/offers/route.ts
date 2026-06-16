import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TENANT_ID = 'tenant_001'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const driveId = searchParams.get('driveId') || ''
    const studentId = searchParams.get('studentId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      tenantId: TENANT_ID
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (driveId) {
      where.driveId = driveId
    }

    if (studentId) {
      where.studentId = studentId
    }

    const [offers, total] = await Promise.all([
      db.offer.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              enrollmentNo: true,
              email: true,
              department: {
                select: { name: true }
              },
              course: {
                select: { name: true }
              }
            }
          },
          drive: {
            select: {
              id: true,
              title: true,
              company: {
                select: { id: true, name: true, logo: true }
              }
            }
          }
        },
        orderBy: { offerDate: 'desc' },
        skip,
        take: limit
      }),
      db.offer.count({ where })
    ])

    // Get status counts
    const statusCounts = await db.offer.groupBy({
      by: ['status'],
      where: { tenantId: TENANT_ID },
      _count: { id: true }
    })

    // Get package statistics
    const packageStats = await db.offer.aggregate({
      where: { tenantId: TENANT_ID },
      _min: { package: true },
      _max: { package: true },
      _avg: { package: true }
    })

    return NextResponse.json({
      offers: offers.map(o => ({
        id: o.id,
        package: o.package / 100000, // Convert to LPA
        designation: o.designation,
        location: o.location,
        offerDate: o.offerDate,
        joiningDate: o.joiningDate,
        status: o.status,
        offerLetter: o.offerLetter,
        student: o.student,
        drive: o.drive,
        company: o.drive.company,
        createdAt: o.createdAt
      })),
      statusCounts: statusCounts.reduce((acc, s) => {
        acc[s.status] = s._count.id
        return acc
      }, {} as Record<string, number>),
      packageStats: {
        min: packageStats._min.package ? packageStats._min.package / 100000 : 0,
        max: packageStats._max.package ? packageStats._max.package / 100000 : 0,
        avg: packageStats._avg.package ? Math.round(packageStats._avg.package / 100000 * 10) / 10 : 0
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}
