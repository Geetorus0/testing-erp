import { NextResponse } from 'next/server'

// Mock data for finance dashboard
const mockDashboardData = {
  stats: {
    totalFeesCollected: 45678900,
    pendingPayments: 8923400,
    totalStudents: 3250,
    paidStudents: 2890,
    overdueAmount: 1456700,
    collectionRate: 84
  },
  feeTypeBreakdown: [
    { type: 'Tuition Fee', amount: 25000000, percentage: 55, color: '#10b981' },
    { type: 'Hostel Fee', amount: 8500000, percentage: 19, color: '#3b82f6' },
    { type: 'Lab Fee', amount: 4500000, percentage: 10, color: '#f59e0b' },
    { type: 'Transport Fee', amount: 3200000, percentage: 7, color: '#8b5cf6' },
    { type: 'Library Fee', amount: 2500000, percentage: 5, color: '#ec4899' },
    { type: 'Other', amount: 1978900, percentage: 4, color: '#6b7280' }
  ],
  monthlyTrend: [
    { month: 'Jan', collected: 5200000, pending: 890000 },
    { month: 'Feb', collected: 5800000, pending: 750000 },
    { month: 'Mar', collected: 6500000, pending: 920000 },
    { month: 'Apr', collected: 7200000, pending: 680000 },
    { month: 'May', collected: 8100000, pending: 820000 },
    { month: 'Jun', collected: 12878900, pending: 569000 }
  ],
  recentTransactions: [
    {
      id: 'txn_001',
      studentName: 'Rahul Kumar',
      amount: 45000,
      type: 'Tuition Fee',
      status: 'COMPLETED',
      date: new Date().toISOString(),
      receiptNo: 'REC-2024-001234'
    },
    {
      id: 'txn_002',
      studentName: 'Priya Sharma',
      amount: 32000,
      type: 'Hostel Fee',
      status: 'PENDING',
      date: new Date(Date.now() - 3600000).toISOString(),
      receiptNo: 'REC-2024-001235'
    },
    {
      id: 'txn_003',
      studentName: 'Amit Verma',
      amount: 15000,
      type: 'Lab Fee',
      status: 'COMPLETED',
      date: new Date(Date.now() - 7200000).toISOString(),
      receiptNo: 'REC-2024-001236'
    },
    {
      id: 'txn_004',
      studentName: 'Sneha Patel',
      amount: 52000,
      type: 'Tuition Fee',
      status: 'FAILED',
      date: new Date(Date.now() - 10800000).toISOString(),
      receiptNo: 'REC-2024-001237'
    },
    {
      id: 'txn_005',
      studentName: 'Vikram Singh',
      amount: 8000,
      type: 'Transport Fee',
      status: 'COMPLETED',
      date: new Date(Date.now() - 14400000).toISOString(),
      receiptNo: 'REC-2024-001238'
    },
    {
      id: 'txn_006',
      studentName: 'Anita Reddy',
      amount: 25000,
      type: 'Library Fee',
      status: 'COMPLETED',
      date: new Date(Date.now() - 18000000).toISOString(),
      receiptNo: 'REC-2024-001239'
    }
  ]
}

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return NextResponse.json(mockDashboardData)
}
