import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TENANT_ID = 'tenant_001'

export async function GET() {
  try {
    // Get total companies
    const totalCompanies = await db.company.count({
      where: { tenantId: TENANT_ID, isActive: true }
    })

    // Get active drives count
    const activeDrives = await db.drive.count({
      where: {
        tenantId: TENANT_ID,
        status: { in: ['upcoming', 'ongoing'] }
      }
    })

    // Get total offers
    const totalOffers = await db.offer.count({
      where: { tenantId: TENANT_ID }
    })

    // Get accepted offers count
    const acceptedOffers = await db.offer.count({
      where: {
        tenantId: TENANT_ID,
        status: { in: ['accepted', 'joined'] }
      }
    })

    // Get highest and average package
    const offers = await db.offer.findMany({
      where: { tenantId: TENANT_ID },
      select: { package: true }
    })

    const highestPackage = offers.length > 0
      ? Math.max(...offers.map(o => o.package))
      : 0

    const averagePackage = offers.length > 0
      ? offers.reduce((sum, o) => sum + o.package, 0) / offers.length
      : 0

    // Get upcoming drives with company info
    const upcomingDrives = await db.drive.findMany({
      where: {
        tenantId: TENANT_ID,
        status: 'upcoming',
        driveDate: { gte: new Date() }
      },
      include: {
        company: {
          select: { name: true, logo: true, industry: true }
        }
      },
      orderBy: { driveDate: 'asc' },
      take: 5
    })

    // Get total students count for placement percentage
    const totalStudents = await db.student.count({
      where: { tenantId: TENANT_ID, status: 'active' }
    })

    // Get unique students with accepted offers
    const placedStudents = await db.offer.findMany({
      where: {
        tenantId: TENANT_ID,
        status: { in: ['accepted', 'joined'] }
      },
      select: { studentId: true }
    })
    const uniquePlacedStudents = new Set(placedStudents.map(o => o.studentId)).size

    const placementPercentage = totalStudents > 0
      ? Math.round((uniquePlacedStudents / totalStudents) * 100)
      : 0

    // Get drive status breakdown
    const driveStatusBreakdown = await db.drive.groupBy({
      by: ['status'],
      where: { tenantId: TENANT_ID },
      _count: { id: true }
    })

    // Get offers by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const recentOffers = await db.offer.findMany({
      where: {
        tenantId: TENANT_ID,
        offerDate: { gte: sixMonthsAgo }
      },
      select: {
        offerDate: true,
        status: true
      }
    })

    // Package distribution
    const packageDistribution = {
      '0-5 LPA': offers.filter(o => o.package < 500000).length,
      '5-10 LPA': offers.filter(o => o.package >= 500000 && o.package < 1000000).length,
      '10-15 LPA': offers.filter(o => o.package >= 1000000 && o.package < 1500000).length,
      '15+ LPA': offers.filter(o => o.package >= 1500000).length
    }

    return NextResponse.json({
      stats: {
        totalCompanies,
        activeDrives,
        totalOffers,
        acceptedOffers,
        placementPercentage,
        highestPackage: highestPackage / 100000, // Convert to LPA
        averagePackage: Math.round(averagePackage / 100000 * 10) / 10 // Convert to LPA with 1 decimal
      },
      upcomingDrives: upcomingDrives.map(drive => ({
        id: drive.id,
        title: drive.title,
        company: drive.company,
        driveDate: drive.driveDate,
        packageMin: drive.packageMin ? drive.packageMin / 100000 : null,
        packageMax: drive.packageMax ? drive.packageMax / 100000 : null,
        lastDate: drive.lastDate
      })),
      driveStatusBreakdown: driveStatusBreakdown.map(d => ({
        status: d.status,
        count: d._count.id
      })),
      packageDistribution,
      recentOffers: recentOffers.map(o => ({
        date: o.offerDate,
        status: o.status
      }))
    })
  } catch (error) {
    console.error('Error fetching placement dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
