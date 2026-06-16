import { NextRequest, NextResponse } from 'next/server'

// Mock scholarships data
let mockScholarships = [
  {
    id: 'sch_001',
    name: 'Merit Scholarship 2024',
    type: 'MERIT',
    amount: 50000,
    coverage: 100,
    eligibilityCriteria: 'Students with GPA above 9.0 in previous semester. No backlogs. Good conduct record required.',
    minGpa: 9.0,
    maxIncome: null,
    deadline: '2024-06-30',
    applicationCount: 245,
    approvedCount: 45,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_002',
    name: 'Need-Based Financial Aid',
    type: 'NEED_BASED',
    amount: 35000,
    coverage: 75,
    eligibilityCriteria: 'Family annual income below ₹3,00,000. Must maintain minimum GPA of 6.0. Documented proof of income required.',
    minGpa: 6.0,
    maxIncome: 300000,
    deadline: '2024-05-15',
    applicationCount: 180,
    approvedCount: 75,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_003',
    name: 'Sports Excellence Award',
    type: 'SPORTS',
    amount: 25000,
    coverage: 50,
    eligibilityCriteria: 'Represented university at state/national level sports. Minimum GPA 5.5. Coach recommendation required.',
    minGpa: 5.5,
    maxIncome: null,
    deadline: '2024-07-31',
    applicationCount: 65,
    approvedCount: 20,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_004',
    name: 'SC/ST Category Scholarship',
    type: 'CATEGORY',
    amount: 40000,
    coverage: 80,
    eligibilityCriteria: 'Valid SC/ST category certificate. Family income below ₹2,50,000. Minimum GPA 6.5.',
    minGpa: 6.5,
    maxIncome: 250000,
    deadline: '2024-06-15',
    applicationCount: 120,
    approvedCount: 85,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_005',
    name: 'National Scholarship Portal (NSP)',
    type: 'GOVERNMENT',
    amount: 50000,
    coverage: 100,
    eligibilityCriteria: 'Indian national. Family income below ₹1,00,000. Registered on NSP portal. Valid Aadhaar linked.',
    minGpa: 7.0,
    maxIncome: 100000,
    deadline: '2024-08-31',
    applicationCount: 320,
    approvedCount: 180,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_006',
    name: 'TCS Foundation Scholarship',
    type: 'PRIVATE',
    amount: 60000,
    coverage: 100,
    eligibilityCriteria: 'STEM students with GPA above 8.5. Must commit to TCS internship. Family income below ₹4,00,000.',
    minGpa: 8.5,
    maxIncome: 400000,
    deadline: '2024-05-31',
    applicationCount: 95,
    approvedCount: 15,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_007',
    name: 'Single Parent Scholarship',
    type: 'NEED_BASED',
    amount: 30000,
    coverage: 60,
    eligibilityCriteria: 'Single parent household. Family income below ₹3,50,000. Minimum GPA 6.0. Supporting documents required.',
    minGpa: 6.0,
    maxIncome: 350000,
    deadline: '2024-04-30',
    applicationCount: 42,
    approvedCount: 28,
    isActive: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch_008',
    name: 'Research Excellence Grant',
    type: 'PRIVATE',
    amount: 75000,
    coverage: 100,
    eligibilityCriteria: 'Published research paper in peer-reviewed journal. Faculty recommendation. GPA above 8.0.',
    minGpa: 8.0,
    maxIncome: null,
    deadline: '2024-09-15',
    applicationCount: 18,
    approvedCount: 8,
    isActive: true,
    createdAt: new Date().toISOString()
  }
]

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return NextResponse.json({ scholarships: mockScholarships })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newScholarship = {
      id: `sch_${Date.now()}`,
      name: body.name,
      type: body.type,
      amount: body.amount,
      coverage: body.coverage,
      eligibilityCriteria: body.eligibilityCriteria,
      minGpa: body.minGpa,
      maxIncome: body.maxIncome,
      deadline: body.deadline,
      applicationCount: 0,
      approvedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    
    mockScholarships.push(newScholarship)
    
    return NextResponse.json({ success: true, scholarship: newScholarship })
  } catch {
    return NextResponse.json({ error: 'Failed to create scholarship' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const index = mockScholarships.findIndex(s => s.id === body.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }
    
    mockScholarships[index] = {
      ...mockScholarships[index],
      name: body.name,
      type: body.type,
      amount: body.amount,
      coverage: body.coverage,
      eligibilityCriteria: body.eligibilityCriteria,
      minGpa: body.minGpa,
      maxIncome: body.maxIncome,
      deadline: body.deadline
    }
    
    return NextResponse.json({ success: true, scholarship: mockScholarships[index] })
  } catch {
    return NextResponse.json({ error: 'Failed to update scholarship' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const index = mockScholarships.findIndex(s => s.id === body.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }
    
    mockScholarships[index].isActive = body.isActive
    
    return NextResponse.json({ success: true, scholarship: mockScholarships[index] })
  } catch {
    return NextResponse.json({ error: 'Failed to update scholarship' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Scholarship ID required' }, { status: 400 })
    }
    
    mockScholarships = mockScholarships.filter(s => s.id !== id)
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete scholarship' }, { status: 500 })
  }
}
