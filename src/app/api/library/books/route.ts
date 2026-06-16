import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper function to get tenant ID
async function getTenantId() {
  const tenant = await db.tenant.findFirst({
    select: { id: true }
  })
  return tenant?.id || ''
}

// GET /api/library/books - List all books with search and filter
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const availability = searchParams.get('availability') || ''

    // Build where clause
    const where: Record<string, unknown> = {
      tenantId
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Availability filter
    if (availability === 'available') {
      where.availableCopies = { gt: 0 }
    } else if (availability === 'unavailable') {
      where.availableCopies = { equals: 0 }
    }

    const books = await db.book.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Get unique categories for filter dropdown
    const categories = await db.book.findMany({
      where: { tenantId },
      select: { category: true },
      distinct: ['category']
    })

    return NextResponse.json({
      books: books.map(book => ({
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        publicationYear: book.publicationYear,
        category: book.category,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        shelf: book.shelf,
        price: book.price,
        description: book.description,
        coverImage: book.coverImage,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      })),
      categories: categories.map(c => c.category).filter(Boolean)
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST /api/library/books - Add a new book
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const {
      isbn,
      title,
      author,
      publisher,
      publicationYear,
      category,
      totalCopies,
      shelf,
      price,
      description
    } = body

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      )
    }

    const book = await db.book.create({
      data: {
        tenantId,
        isbn: isbn || null,
        title,
        author,
        publisher: publisher || null,
        publicationYear: publicationYear ? parseInt(publicationYear) : null,
        category: category || null,
        totalCopies: totalCopies ? parseInt(totalCopies) : 1,
        availableCopies: totalCopies ? parseInt(totalCopies) : 1,
        shelf: shelf || null,
        price: price ? parseFloat(price) : null,
        description: description || null
      }
    })

    return NextResponse.json({
      message: 'Book added successfully',
      book
    })
  } catch (error) {
    console.error('Error adding book:', error)
    return NextResponse.json(
      { error: 'Failed to add book' },
      { status: 500 }
    )
  }
}

// PUT /api/library/books - Update a book
export async function PUT(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const {
      id,
      isbn,
      title,
      author,
      publisher,
      publicationYear,
      category,
      totalCopies,
      shelf,
      price,
      description
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      )
    }

    // Get existing book to calculate available copies difference
    const existingBook = await db.book.findFirst({
      where: { id, tenantId }
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const newTotalCopies = totalCopies ? parseInt(totalCopies) : existingBook.totalCopies
    const copiesDiff = newTotalCopies - existingBook.totalCopies
    const newAvailableCopies = Math.max(0, existingBook.availableCopies + copiesDiff)

    const book = await db.book.update({
      where: { id },
      data: {
        isbn: isbn || null,
        title,
        author,
        publisher: publisher || null,
        publicationYear: publicationYear ? parseInt(publicationYear) : null,
        category: category || null,
        totalCopies: newTotalCopies,
        availableCopies: newAvailableCopies,
        shelf: shelf || null,
        price: price ? parseFloat(price) : null,
        description: description || null
      }
    })

    return NextResponse.json({
      message: 'Book updated successfully',
      book
    })
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}
