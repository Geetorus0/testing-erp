import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/hostel/dashboard - Get dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from header (simulated - in real app would come from auth)
    const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz'

    // Get total hostels
    const totalHostels = await db.hostel.count({
      where: { tenantId }
    })

    // Get total rooms
    const totalRooms = await db.room.count({
      where: { tenantId }
    })

    // Get rooms with occupancy data
    const rooms = await db.room.findMany({
      where: { tenantId },
      include: {
        hostel: {
          select: { name: true }
        }
      }
    })

    const occupiedRooms = rooms.filter(r => r.occupied > 0).length
    const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0)
    const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupied, 0)
    const availableBeds = totalBeds - occupiedBeds
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    // Get pending complaints count
    const pendingComplaints = await db.hostelComplaint.count({
      where: {
        tenantId,
        status: 'pending'
      }
    })

    // Get hostel-wise occupancy
    const hostels = await db.hostel.findMany({
      where: { tenantId },
      include: {
        rooms: true
      }
    })

    const hostelOccupancy = hostels.map(hostel => {
      const totalBeds = hostel.rooms.reduce((sum, r) => sum + r.capacity, 0)
      const occupiedBeds = hostel.rooms.reduce((sum, r) => sum + r.occupied, 0)
      return {
        name: hostel.name,
        total: totalBeds,
        occupied: occupiedBeds,
        available: totalBeds - occupiedBeds,
        occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
      }
    })

    // Get recent complaints
    const recentComplaints = await db.hostelComplaint.findMany({
      where: { tenantId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            name: true
          }
        }
      }
    })

    const formattedComplaints = recentComplaints.map(c => ({
      id: c.id,
      category: c.category,
      description: c.description,
      status: c.status,
      roomNumber: c.roomNumber,
      hostelName: c.hostelId || 'N/A',
      createdAt: c.createdAt.toISOString(),
      studentName: c.student?.name
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalHostels,
          totalRooms,
          occupiedRooms,
          availableBeds,
          totalBeds,
          occupancyRate,
          pendingComplaints
        },
        hostelOccupancy,
        recentComplaints: formattedComplaints
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
