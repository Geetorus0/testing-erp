import { NextRequest, NextResponse } from 'next/server'

// Mock fees data
let mockFees = [
  {
    id: 'fee_001',
    name: 'First Semester Tuition Fee',
    type: 'TUITION',
    amount: 75000,
    course: 'CSE',
    semester: 1,
    dueDate: '2024-03-31',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 120
  },
  {
    id: 'fee_002',
    name: 'Annual Library Fee',
    type: 'LIBRARY',
    amount: 5000,
    course: null,
    semester: null,
    dueDate: '2024-04-15',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 3250
  },
  {
    id: 'fee_003',
    name: 'Computer Lab Fee',
    type: 'LAB',
    amount: 15000,
    course: 'CSE',
    semester: null,
    dueDate: '2024-03-31',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 480
  },
  {
    id: 'fee_004',
    name: 'Sports Facility Fee',
    type: 'SPORTS',
    amount: 3000,
    course: null,
    semester: null,
    dueDate: '2024-04-30',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 2800
  },
  {
    id: 'fee_005',
    name: 'Hostel Fee (Double Sharing)',
    type: 'HOSTEL',
    amount: 60000,
    course: null,
    semester: null,
    dueDate: '2024-03-15',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 850
  },
  {
    id: 'fee_006',
    name: 'Transport Fee (Route A)',
    type: 'TRANSPORT',
    amount: 24000,
    course: null,
    semester: null,
    dueDate: '2024-04-01',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 320
  },
  {
    id: 'fee_007',
    name: 'End Semester Examination Fee',
    type: 'EXAMINATION',
    amount: 2000,
    course: null,
    semester: null,
    dueDate: '2024-05-01',
    isActive: false,
    createdAt: new Date().toISOString(),
    studentCount: 0
  },
  {
    id: 'fee_008',
    name: 'Infrastructure Development Fee',
    type: 'DEVELOPMENT',
    amount: 10000,
    course: null,
    semester: null,
    dueDate: '2024-04-15',
    isActive: true,
    createdAt: new Date().toISOString(),
    studentCount: 3250
  }
]

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return NextResponse.json({ fees: mockFees })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newFee = {
      id: `fee_${Date.now()}`,
      name: body.name,
      type: body.type,
      amount: body.amount,
      course: body.course,
      semester: body.semester,
      dueDate: body.dueDate,
      isActive: true,
      createdAt: new Date().toISOString(),
      studentCount: 0
    }
    
    mockFees.push(newFee)
    
    return NextResponse.json({ success: true, fee: newFee })
  } catch {
    return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const index = mockFees.findIndex(f => f.id === body.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
    }
    
    mockFees[index] = {
      ...mockFees[index],
      name: body.name,
      type: body.type,
      amount: body.amount,
      course: body.course,
      semester: body.semester,
      dueDate: body.dueDate
    }
    
    return NextResponse.json({ success: true, fee: mockFees[index] })
  } catch {
    return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const index = mockFees.findIndex(f => f.id === body.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
    }
    
    mockFees[index].isActive = body.isActive
    
    return NextResponse.json({ success: true, fee: mockFees[index] })
  } catch {
    return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Fee ID required' }, { status: 400 })
    }
    
    mockFees = mockFees.filter(f => f.id !== id)
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete fee' }, { status: 500 })
  }
}
