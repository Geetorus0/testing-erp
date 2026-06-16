import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TENANT_ID = 'tenant_001'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const industry = searchParams.get('industry') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      tenantId: TENANT_ID,
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (industry) {
      where.industry = industry
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        include: {
          _count: {
            select: { drives: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.company.count({ where })
    ])

    // Get unique industries for filter
    const industries = await db.company.findMany({
      where: { tenantId: TENANT_ID, isActive: true },
      select: { industry: true },
      distinct: ['industry']
    })

    return NextResponse.json({
      companies: companies.map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        website: c.website,
        description: c.description,
        logo: c.logo,
        address: c.address,
        contactPerson: c.contactPerson,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        totalDrives: c._count.drives,
        createdAt: c.createdAt
      })),
      industries: industries.map(i => i.industry).filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      industry,
      website,
      description,
      address,
      contactPerson,
      contactEmail,
      contactPhone
    } = body

    // Check if company already exists
    const existing = await db.company.findFirst({
      where: {
        tenantId: TENANT_ID,
        name: { equals: name, mode: 'insensitive' }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 400 }
      )
    }

    const company = await db.company.create({
      data: {
        tenantId: TENANT_ID,
        name,
        industry: industry || null,
        website: website || null,
        description: description || null,
        address: address || null,
        contactPerson: contactPerson || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null
      }
    })

    return NextResponse.json({
      message: 'Company created successfully',
      company
    })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
