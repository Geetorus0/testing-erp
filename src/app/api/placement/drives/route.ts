import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TENANT_ID = 'tenant_001'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const companyId = searchParams.get('companyId') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      tenantId: TENANT_ID
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [drives, total] = await Promise.all([
      db.drive.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true
            }
          },
          _count: {
            select: { offers: true, interviews: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.drive.count({ where })
    ])

    // Get counts by status
    const statusCounts = await db.drive.groupBy({
      by: ['status'],
      where: { tenantId: TENANT_ID },
      _count: { id: true }
    })

    return NextResponse.json({
      drives: drives.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        company: d.company,
        eligibleCourses: d.eligibleCourses ? JSON.parse(d.eligibleCourses) : [],
        eligibleDepartments: d.eligibleDepartments,
        minCgpa: d.minCgpa,
        maxBacklogs: d.maxBacklogs,
        eligibleYears: d.eligibleYears ? JSON.parse(d.eligibleYears) : [],
        packageMin: d.packageMin ? d.packageMin / 100000 : null,
        packageMax: d.packageMax ? d.packageMax / 100000 : null,
        locations: d.locations,
        positions: d.positions,
        lastDate: d.lastDate,
        driveDate: d.driveDate,
        status: d.status,
        totalOffers: d._count.offers,
        totalInterviews: d._count.interviews,
        createdAt: d.createdAt
      })),
      statusCounts: statusCounts.reduce((acc, s) => {
        acc[s.status] = s._count.id
        return acc
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching drives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drives' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      companyId,
      title,
      description,
      eligibleCourses,
      eligibleDepartments,
      minCgpa,
      maxBacklogs,
      eligibleYears,
      packageMin,
      packageMax,
      locations,
      positions,
      lastDate,
      driveDate
    } = body

    // Validate company exists
    const company = await db.company.findFirst({
      where: { id: companyId, tenantId: TENANT_ID }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const drive = await db.drive.create({
      data: {
        tenantId: TENANT_ID,
        companyId,
        title,
        description: description || null,
        eligibleCourses: eligibleCourses ? JSON.stringify(eligibleCourses) : null,
        eligibleDepartments: eligibleDepartments || null,
        minCgpa: minCgpa || null,
        maxBacklogs: maxBacklogs || null,
        eligibleYears: eligibleYears ? JSON.stringify(eligibleYears) : null,
        packageMin: packageMin ? packageMin * 100000 : null, // Convert from LPA
        packageMax: packageMax ? packageMax * 100000 : null,
        locations: locations || null,
        positions: positions || null,
        lastDate: new Date(lastDate),
        driveDate: new Date(driveDate),
        status: 'upcoming'
      },
      include: {
        company: {
          select: { name: true, logo: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Drive created successfully',
      drive
    })
  } catch (error) {
    console.error('Error creating drive:', error)
    return NextResponse.json(
      { error: 'Failed to create drive' },
      { status: 500 }
    )
  }
}
