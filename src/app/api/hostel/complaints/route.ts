import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/hostel/complaints - Get complaints list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'

    // Build filter conditions
    const where: Record<string, unknown> = { tenantId }
    
    const status = searchParams.get('status')
    if (status && status !== 'all') {
      where.status = status
    }

    const category = searchParams.get('category')
    if (category && category !== 'all') {
      where.category = category
    }

    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { roomNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    // Get total count
    const total = await db.hostelComplaint.count({ where })

    // Get complaints
    const complaints = await db.hostelComplaint.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    })

    // Format response with hostel info
    const formattedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        let hostel = null
        if (complaint.hostelId) {
          hostel = await db.hostel.findUnique({
            where: { id: complaint.hostelId },
            select: { id: true, name: true }
          })
        }

        return {
          id: complaint.id,
          category: complaint.category,
          description: complaint.description,
          status: complaint.status,
          roomNumber: complaint.roomNumber,
          hostelId: complaint.hostelId,
          hostel,
          remarks: complaint.remarks,
          resolvedAt: complaint.resolvedAt?.toISOString(),
          createdAt: complaint.createdAt.toISOString(),
          studentId: complaint.studentId,
          student: complaint.student
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        complaints: formattedComplaints,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

// PUT /api/hostel/complaints - Update complaint status
export async function PUT(request: NextRequest) {
  try {
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'
    const body = await request.json()
    const { complaintId, status, remarks } = body

    if (!complaintId) {
      return NextResponse.json(
        { success: false, error: 'Complaint ID is required' },
        { status: 400 }
      )
    }

    // Find the complaint
    const complaint = await db.hostelComplaint.findUnique({
      where: { id: complaintId }
    })

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
      if (status === 'resolved') {
        updateData.resolvedAt = new Date()
      }
    }
    
    if (remarks !== undefined) {
      updateData.remarks = remarks
    }

    // Update the complaint
    const updatedComplaint = await db.hostelComplaint.update({
      where: { id: complaintId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedComplaint
    })
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint' },
      { status: 500 }
    )
  }
}
