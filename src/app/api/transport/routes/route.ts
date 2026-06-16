import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all routes
export async function GET() {
  try {
    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    const routes = await db.busRoute.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        bus: {
          select: {
            id: true,
            busNumber: true,
            capacity: true,
            status: true
          }
        },
        _count: {
          select: { allocations: { where: { status: 'active' } } }
        }
      },
      orderBy: { routeNumber: 'asc' }
    })

    return NextResponse.json({ routes })
  } catch (error) {
    console.error('Error fetching routes:', error)

    // Return demo data on error
    return NextResponse.json({
      routes: [
        {
          id: 'route-1',
          routeNumber: 'R-001',
          routeName: 'City Center Route',
          startPoint: 'College Gate',
          endPoint: 'City Bus Stand',
          stops: JSON.stringify(['College Gate', 'Market', 'Railway Station', 'City Bus Stand']),
          distance: 12.5,
          fare: 1500,
          busId: 'bus-1',
          bus: {
            id: 'bus-1',
            busNumber: 'TN-01-1234',
            capacity: 45,
            status: 'active'
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'route-2',
          routeNumber: 'R-002',
          routeName: 'Railway Station Route',
          startPoint: 'College Gate',
          endPoint: 'Railway Station',
          stops: JSON.stringify(['College Gate', 'IT Park', 'Hospital', 'Railway Station']),
          distance: 8.0,
          fare: 1200,
          busId: 'bus-2',
          bus: {
            id: 'bus-2',
            busNumber: 'TN-01-5678',
            capacity: 40,
            status: 'active'
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'route-3',
          routeNumber: 'R-003',
          routeName: 'Airport Route',
          startPoint: 'College Gate',
          endPoint: 'Airport',
          stops: JSON.stringify(['College Gate', 'Highway Junction', 'Airport']),
          distance: 18.0,
          fare: 2000,
          busId: 'bus-4',
          bus: {
            id: 'bus-4',
            busNumber: 'TN-01-3456',
            capacity: 50,
            status: 'active'
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'route-4',
          routeNumber: 'R-004',
          routeName: 'IT Park Route',
          startPoint: 'College Gate',
          endPoint: 'IT Park',
          stops: JSON.stringify(['College Gate', 'Tech Hub', 'IT Park']),
          distance: 6.5,
          fare: 1000,
          busId: 'bus-5',
          bus: {
            id: 'bus-5',
            busNumber: 'TN-01-7890',
            capacity: 42,
            status: 'active'
          },
          createdAt: new Date().toISOString()
        }
      ]
    })
  }
}

// POST - Create or update route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, routeNumber, routeName, startPoint, endPoint, stops, distance, fare, busId } = body

    // Get tenant ID (using demo tenant for now)
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    if (!routeNumber || !routeNumber.trim()) {
      return NextResponse.json({ error: 'Route number is required' }, { status: 400 })
    }

    if (!routeName || !routeName.trim()) {
      return NextResponse.json({ error: 'Route name is required' }, { status: 400 })
    }

    if (!busId) {
      return NextResponse.json({ error: 'Bus assignment is required' }, { status: 400 })
    }

    // Parse stops into JSON array
    let stopsJson = null
    if (stops && stops.trim()) {
      const stopsArray = stops.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      if (stopsArray.length > 0) {
        stopsJson = JSON.stringify(stopsArray)
      }
    }

    if (id) {
      // Update existing route
      const updatedRoute = await db.busRoute.update({
        where: { id },
        data: {
          routeNumber: routeNumber.trim(),
          routeName: routeName.trim(),
          startPoint: startPoint?.trim() || '',
          endPoint: endPoint?.trim() || '',
          stops: stopsJson,
          distance: parseFloat(distance) || null,
          fare: parseFloat(fare) || null,
          busId
        },
        include: {
          bus: {
            select: {
              id: true,
              busNumber: true,
              capacity: true,
              status: true
            }
          }
        }
      })
      return NextResponse.json({ route: updatedRoute })
    } else {
      // Check for duplicate route number
      const existingRoute = await db.busRoute.findFirst({
        where: {
          tenantId,
          routeNumber: routeNumber.trim()
        }
      })

      if (existingRoute) {
        return NextResponse.json({ error: 'Route number already exists' }, { status: 400 })
      }

      // Create new route
      const newRoute = await db.busRoute.create({
        data: {
          tenantId,
          routeNumber: routeNumber.trim(),
          routeName: routeName.trim(),
          startPoint: startPoint?.trim() || '',
          endPoint: endPoint?.trim() || '',
          stops: stopsJson,
          distance: parseFloat(distance) || null,
          fare: parseFloat(fare) || null,
          busId
        },
        include: {
          bus: {
            select: {
              id: true,
              busNumber: true,
              capacity: true,
              status: true
            }
          }
        }
      })
      return NextResponse.json({ route: newRoute })
    }
  } catch (error) {
    console.error('Error saving route:', error)
    return NextResponse.json({ error: 'Failed to save route' }, { status: 500 })
  }
}

// DELETE - Delete route
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Route ID is required' }, { status: 400 })
    }

    // Check if route has allocations
    const allocations = await db.busAllocation.findFirst({
      where: { routeId: id }
    })

    if (allocations) {
      return NextResponse.json({ error: 'Cannot delete route with student allocations' }, { status: 400 })
    }

    await db.busRoute.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}
