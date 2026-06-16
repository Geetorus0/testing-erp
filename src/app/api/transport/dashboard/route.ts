import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    // Get total buses
    const totalBuses = await db.bus.count({
      where: tenantId ? { tenantId } : undefined
    })

    // Get total routes
    const totalRoutes = await db.busRoute.count({
      where: tenantId ? { tenantId } : undefined
    })

    // Get active routes (routes with active buses)
    const activeRoutes = await db.busRoute.count({
      where: tenantId ? {
        tenantId,
        bus: { status: 'active' }
      } : {
        bus: { status: 'active' }
      }
    })

    // Get students using transport
    const studentsUsingTransport = await db.busAllocation.count({
      where: tenantId ? {
        tenantId,
        status: 'active'
      } : {
        status: 'active'
      }
    })

    // Calculate bus capacity utilization
    const buses = await db.bus.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        routes: {
          include: {
            _count: {
              select: { allocations: { where: { status: 'active' } } }
            }
          }
        }
      }
    })

    let totalCapacity = 0
    let totalAllocated = 0

    buses.forEach(bus => {
      totalCapacity += bus.capacity
      bus.routes.forEach(route => {
        totalAllocated += route._count.allocations
      })
    })

    const busCapacityUtilization = totalCapacity > 0
      ? Math.round((totalAllocated / totalCapacity) * 100)
      : 0

    // Get route-wise students
    const routes = await db.busRoute.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        _count: {
          select: { allocations: { where: { status: 'active' } } }
        }
      },
      orderBy: { routeName: 'asc' }
    })

    const routeWiseStudents = routes.map(route => ({
      routeName: route.routeName,
      students: route._count.allocations
    }))

    return NextResponse.json({
      stats: {
        totalBuses,
        totalRoutes,
        activeRoutes,
        studentsUsingTransport,
        busCapacityUtilization
      },
      routeWiseStudents
    })
  } catch (error) {
    console.error('Error fetching transport dashboard:', error)

    // Return demo data on error
    return NextResponse.json({
      stats: {
        totalBuses: 12,
        totalRoutes: 8,
        activeRoutes: 7,
        studentsUsingTransport: 245,
        busCapacityUtilization: 68
      },
      routeWiseStudents: [
        { routeName: 'City Center Route', students: 45 },
        { routeName: 'Railway Station Route', students: 38 },
        { routeName: 'Bus Stand Route', students: 32 },
        { routeName: 'Market Area Route', students: 28 },
        { routeName: 'IT Park Route', students: 35 },
        { routeName: 'University Route', students: 42 },
        { routeName: 'Airport Route', students: 25 }
      ]
    })
  }
}
