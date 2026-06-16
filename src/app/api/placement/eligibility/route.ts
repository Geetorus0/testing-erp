import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TENANT_ID = 'tenant_001'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const driveId = searchParams.get('driveId') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const minCgpa = searchParams.get('minCgpa') ? parseFloat(searchParams.get('minCgpa')!) : null
    const maxBacklogs = searchParams.get('maxBacklogs') ? parseInt(searchParams.get('maxBacklogs')!) : null
    const passingYear = searchParams.get('passingYear') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // If driveId is provided, check eligibility based on drive criteria
    if (driveId) {
      const drive = await db.drive.findFirst({
        where: { id: driveId, tenantId: TENANT_ID },
        include: {
          company: { select: { name: true } },
          offers: {
            select: { studentId: true, status: true }
          }
        }
      })

      if (!drive) {
        return NextResponse.json(
          { error: 'Drive not found' },
          { status: 404 }
        )
      }

      // Build student query based on drive criteria
      const studentWhere: any = {
        tenantId: TENANT_ID,
        status: 'active'
      }

      if (drive.eligibleDepartments) {
        studentWhere.departmentId = drive.eligibleDepartments
      }

      if (drive.eligibleCourses) {
        const courses = JSON.parse(drive.eligibleCourses)
        if (courses.length > 0) {
          studentWhere.courseId = { in: courses }
        }
      }

      if (drive.minCgpa) {
        studentWhere.cgpa = { gte: drive.minCgpa }
      }

      if (drive.maxBacklogs !== null && drive.maxBacklogs !== undefined) {
        studentWhere.backlogs = { lte: drive.maxBacklogs }
      }

      if (drive.eligibleYears) {
        const years = JSON.parse(drive.eligibleYears)
        if (years.length > 0) {
          studentWhere.passingYear = { in: years.map(Number) }
        }
      }

      const [eligibleStudents, totalEligible] = await Promise.all([
        db.student.findMany({
          where: studentWhere,
          include: {
            department: { select: { name: true } },
            course: { select: { name: true } }
          },
          skip,
          take: limit
        }),
        db.student.count({ where: studentWhere })
      ])

      // Check which students already have offers for this drive
      const offeredStudentIds = new Set(drive.offers.map(o => o.studentId))

      return NextResponse.json({
        drive: {
          id: drive.id,
          title: drive.title,
          company: drive.company,
          minCgpa: drive.minCgpa,
          maxBacklogs: drive.maxBacklogs,
          eligibleDepartments: drive.eligibleDepartments,
          eligibleCourses: drive.eligibleCourses ? JSON.parse(drive.eligibleCourses) : [],
          eligibleYears: drive.eligibleYears ? JSON.parse(drive.eligibleYears) : []
        },
        eligibleStudents: eligibleStudents.map(s => ({
          id: s.id,
          name: s.name,
          enrollmentNo: s.enrollmentNo,
          email: s.email,
          cgpa: s.cgpa,
          backlogs: s.backlogs,
          passingYear: s.passingYear,
          department: s.department,
          course: s.course,
          hasOffer: offeredStudentIds.has(s.id)
        })),
        pagination: {
          page,
          limit,
          total: totalEligible,
          totalPages: Math.ceil(totalEligible / limit)
        }
      })
    }

    // General eligibility check based on filters
    const studentWhere: any = {
      tenantId: TENANT_ID,
      status: 'active'
    }

    if (departmentId) {
      studentWhere.departmentId = departmentId
    }

    if (minCgpa !== null) {
      studentWhere.cgpa = { gte: minCgpa }
    }

    if (maxBacklogs !== null) {
      studentWhere.backlogs = { lte: maxBacklogs }
    }

    if (passingYear) {
      studentWhere.passingYear = parseInt(passingYear)
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where: studentWhere,
        include: {
          department: { select: { id: true, name: true } },
          course: { select: { id: true, name: true } }
        },
        orderBy: { cgpa: 'desc' },
        skip,
        take: limit
      }),
      db.student.count({ where: studentWhere })
    ])

    // Get departments for filter
    const departments = await db.department.findMany({
      where: { tenantId: TENANT_ID },
      select: { id: true, name: true }
    })

    // Get unique passing years
    const studentsWithYears = await db.student.findMany({
      where: { tenantId: TENANT_ID, status: 'active' },
      select: { passingYear: true },
      distinct: ['passingYear']
    })

    return NextResponse.json({
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        enrollmentNo: s.enrollmentNo,
        email: s.email,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
        passingYear: s.passingYear,
        department: s.department,
        course: s.course
      })),
      departments,
      passingYears: studentsWithYears.map(s => s.passingYear).filter(Boolean).sort((a, b) => b - a),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driveId, studentIds, action } = body

    if (!driveId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: 'Drive ID and student IDs are required' },
        { status: 400 }
      )
    }

    if (action === 'notify') {
      // In a real application, this would send notifications
      // For now, we'll just return success
      return NextResponse.json({
        message: `Notifications sent to ${studentIds.length} students`,
        notifiedCount: studentIds.length
      })
    }

    if (action === 'create_offers') {
      const { package: offerPackage, designation, location } = body

      if (!offerPackage) {
        return NextResponse.json(
          { error: 'Package amount is required for creating offers' },
          { status: 400 }
        )
      }

      // Create offers for multiple students
      const offers = await db.offer.createMany({
        data: studentIds.map(studentId => ({
          tenantId: TENANT_ID,
          driveId,
          studentId,
          package: offerPackage * 100000, // Convert from LPA
          designation: designation || null,
          location: location || null,
          offerDate: new Date(),
          status: 'pending'
        })),
        skipDuplicates: true
      })

      return NextResponse.json({
        message: `Created ${offers.count} offers successfully`,
        createdCount: offers.count
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in eligibility action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
