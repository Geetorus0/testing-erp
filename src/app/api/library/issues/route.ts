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

// GET /api/library/issues - List issues with search and filter
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: Record<string, unknown> = {
      tenantId
    }

    // Status filter
    if (status === 'issued') {
      where.status = 'issued'
    } else if (status === 'returned') {
      where.status = 'returned'
    } else if (status === 'overdue') {
      where.status = 'issued'
      where.dueDate = { lt: new Date() }
    }

    const issues = await db.bookIssue.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            category: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            email: true,
            department: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate fine for overdue books
    const now = new Date()
    const issuesWithFine = issues.map(issue => {
      let calculatedFine = issue.fine
      if (issue.status === 'issued' && new Date(issue.dueDate) < now) {
        const dueDate = new Date(issue.dueDate)
        const diffTime = now.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        calculatedFine = diffDays * FINE_PER_DAY
      }
      return {
        ...issue,
        calculatedFine
      }
    })

    // Filter by search if provided
    let filteredIssues = issuesWithFine
    if (search) {
      const searchLower = search.toLowerCase()
      filteredIssues = issuesWithFine.filter(issue =>
        issue.book.title.toLowerCase().includes(searchLower) ||
        issue.book.author.toLowerCase().includes(searchLower) ||
        issue.student.name.toLowerCase().includes(searchLower) ||
        issue.student.rollNumber.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      issues: filteredIssues
    })
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

// POST /api/library/issues - Issue a book to a student
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const { bookId, studentId, issueDays = 14 } = body

    if (!bookId || !studentId) {
      return NextResponse.json(
        { error: 'Book ID and Student ID are required' },
        { status: 400 }
      )
    }

    // Check if book exists and has available copies
    const book = await db.book.findFirst({
      where: { id: bookId, tenantId }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: 'No copies available for issue' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findFirst({
      where: { id: studentId, tenantId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if student already has max books issued
    const currentIssues = await db.bookIssue.count({
      where: {
        studentId,
        tenantId,
        status: 'issued'
      }
    })

    if (currentIssues >= MAX_BOOKS_PER_STUDENT) {
      return NextResponse.json(
        { error: `Student already has maximum ${MAX_BOOKS_PER_STUDENT} books issued` },
        { status: 400 }
      )
    }

    // Calculate dates
    const issueDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + issueDays)

    // Create issue record and update book availability
    const issue = await db.$transaction(async (tx) => {
      // Create the issue
      const newIssue = await tx.bookIssue.create({
        data: {
          tenantId,
          bookId,
          studentId,
          issueDate,
          dueDate,
          status: 'issued'
        },
        include: {
          book: {
            select: { title: true, author: true }
          },
          student: {
            select: { name: true, rollNumber: true }
          }
        }
      })

      // Update book available copies
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: book.availableCopies - 1
        }
      })

      return newIssue
    })

    return NextResponse.json({
      message: 'Book issued successfully',
      issue
    })
  } catch (error) {
    console.error('Error issuing book:', error)
    return NextResponse.json(
      { error: 'Failed to issue book' },
      { status: 500 }
    )
  }
}

// PUT /api/library/issues - Return a book
export async function PUT(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const { issueId, finePaid = false } = body

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      )
    }

    // Get the issue record
    const issue = await db.bookIssue.findFirst({
      where: { id: issueId, tenantId },
      include: { book: true }
    })

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue record not found' },
        { status: 404 }
      )
    }

    if (issue.status === 'returned') {
      return NextResponse.json(
        { error: 'Book already returned' },
        { status: 400 }
      )
    }

    // Calculate fine if overdue
    const returnDate = new Date()
    let fine = 0
    if (new Date(issue.dueDate) < returnDate) {
      const diffTime = returnDate.getTime() - new Date(issue.dueDate).getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      fine = diffDays * FINE_PER_DAY
    }

    // Update issue record and book availability
    const updatedIssue = await db.$transaction(async (tx) => {
      // Update the issue
      const updated = await tx.bookIssue.update({
        where: { id: issueId },
        data: {
          returnDate,
          fine,
          status: 'returned'
        },
        include: {
          book: {
            select: { title: true, author: true }
          },
          student: {
            select: { name: true, rollNumber: true }
          }
        }
      })

      // Update book available copies
      await tx.book.update({
        where: { id: issue.bookId },
        data: {
          availableCopies: issue.book.availableCopies + 1
        }
      })

      return updated
    })

    return NextResponse.json({
      message: 'Book returned successfully',
      issue: updatedIssue,
      fineCharged: fine,
      finePaid
    })
  } catch (error) {
    console.error('Error returning book:', error)
    return NextResponse.json(
      { error: 'Failed to return book' },
      { status: 500 }
    )
  }
}
