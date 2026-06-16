import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper function to get tenant ID
async function getTenantId() {
  const tenant = await db.tenant.findFirst({
    select: { id: true }
  })
  return tenant?.id || ''
}

export async function GET() {
  try {
    const tenantId = await getTenantId()
    
    // Get total books
    const totalBooks = await db.book.count({
      where: { tenantId }
    })

    // Get total copies and available copies
    const books = await db.book.findMany({
      where: { tenantId },
      select: { totalCopies: true, availableCopies: true }
    })

    const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0)
    const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0)

    // Get currently issued books count
    const issuedBooks = await db.bookIssue.count({
      where: {
        tenantId,
        status: 'issued'
      }
    })

    // Get overdue books
    const overdueBooks = await db.bookIssue.count({
      where: {
        tenantId,
        status: 'issued',
        dueDate: { lt: new Date() }
      }
    })

    // Get total fine collected (from returned books)
    const fineResult = await db.bookIssue.aggregate({
      where: {
        tenantId,
        status: 'returned'
      },
      _sum: { fine: true }
    })

    const totalFineCollected = fineResult._sum.fine || 0

    // Get category-wise distribution
    const categoryDistribution = await db.book.groupBy({
      by: ['category'],
      where: { tenantId },
      _count: { id: true }
    })

    // Get recent issues with book and student info
    const recentIssues = await db.bookIssue.findMany({
      where: { tenantId },
      include: {
        book: {
          select: { title: true, author: true }
        },
        student: {
          select: { name: true, rollNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        issuedBooks,
        overdueBooks,
        totalFineCollected
      },
      categoryDistribution: categoryDistribution.map(c => ({
        category: c.category || 'Uncategorized',
        count: c._count.id
      })),
      recentIssues: recentIssues.map(issue => ({
        id: issue.id,
        book: issue.book,
        student: issue.student,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        returnDate: issue.returnDate,
        status: issue.status,
        fine: issue.fine
      }))
    })
  } catch (error) {
    console.error('Error fetching library dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
