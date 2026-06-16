import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MAX_BOOKS_PER_STUDENT = 5
const FINE_PER_DAY = 2 // Rs. 2 per day

// Helper function to get tenant ID
async function getTenantId() {
  const tenant = await db.tenant.findFirst({
    select: { id: true }
  })
  return tenant?.id || ''
}

// GET /api/library/members - List all student members with library stats
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: Record<string, unknown> = {
      tenantId,
      status: 'active'
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get all active students
    const students = await db.student.findMany({
      where,
      include: {
        department: {
          select: { name: true }
        },
        course: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get issue stats for each student
    const studentIds = students.map(s => s.id)
    
    // Get current issues count
    const currentIssues = await db.bookIssue.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        tenantId,
        status: 'issued'
      },
      _count: { id: true }
    })

    // Get overdue issues
    const overdueIssues = await db.bookIssue.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        tenantId,
        status: 'issued',
        dueDate: { lt: new Date() }
      },
      _count: { id: true }
    })

    // Get unpaid fines (from returned books with fine > 0)
    // For simplicity, we'll calculate pending fines from all returned books
    const fines = await db.bookIssue.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        tenantId,
        status: 'returned'
      },
      _sum: { fine: true }
    })

    // Create lookup maps
    const issuesMap = new Map(currentIssues.map(i => [i.studentId, i._count.id]))
    const overdueMap = new Map(overdueIssues.map(o => [o.studentId, o._count.id]))
    const finesMap = new Map(fines.map(f => [f.studentId, f._sum.fine || 0]))

    // Calculate pending fine for current overdue books
    const now = new Date()
    const currentOverdueBooks = await db.bookIssue.findMany({
      where: {
        studentId: { in: studentIds },
        tenantId,
        status: 'issued',
        dueDate: { lt: now }
      },
      select: {
        studentId: true,
        dueDate: true
      }
    })

    // Calculate current overdue fines
    const currentOverdueFines = new Map<string, number>()
    for (const issue of currentOverdueBooks) {
      const diffTime = now.getTime() - new Date(issue.dueDate).getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const fine = diffDays * FINE_PER_DAY
      const current = currentOverdueFines.get(issue.studentId) || 0
      currentOverdueFines.set(issue.studentId, current + fine)
    }

    // Combine all data
    const members = students.map(student => {
      const booksIssued = issuesMap.get(student.id) || 0
      const overdueCount = overdueMap.get(student.id) || 0
      const pastFines = finesMap.get(student.id) || 0
      const currentOverdueFine = currentOverdueFines.get(student.id) || 0
      const totalFine = pastFines + currentOverdueFine

      return {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.department.name,
        course: student.course.name,
        currentSemester: student.currentSemester,
        booksIssued,
        maxBooksAllowed: MAX_BOOKS_PER_STUDENT,
        overdueCount,
        totalFine,
        canIssue: booksIssued < MAX_BOOKS_PER_STUDENT
      }
    })

    return NextResponse.json({
      members
    })
  } catch (error) {
    console.error('Error fetching library members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
