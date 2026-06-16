'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { 
  Search, 
  IndianRupee,
  Calendar as CalendarIcon,
  Download,
  Receipt,
  CreditCard,
  Filter,
  Eye,
  FileText,
  Printer,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

interface Payment {
  id: string
  receiptNo: string
  studentId: string
  studentName: string
  studentRollNo: string
  amount: number
  feeType: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  paymentMethod: 'ONLINE' | 'CASH' | 'CHEQUE' | 'DD' | 'BANK_TRANSFER'
  transactionId?: string
  date: string
  course: string
  semester: number
  dueDate: string
}

interface PaymentHistory {
  studentId: string
  studentName: string
  totalPaid: number
  totalPending: number
  payments: Payment[]
}

const paymentMethods = [
  { value: 'all', label: 'All Methods' },
  { value: 'ONLINE', label: 'Online Payment' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'DD', label: 'Demand Draft' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
]

export default function PaymentList() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [receiptDialog, setReceiptDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [historyDialog, setHistoryDialog] = useState(false)
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<PaymentHistory | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/finance/payments')
      if (response.ok) {
        const result = await response.json()
        setPayments(result.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter
    
    let matchesDate = true
    if (dateRange?.from) {
      const paymentDate = new Date(payment.date)
      matchesDate = paymentDate >= dateRange.from
      if (dateRange?.to) {
        matchesDate = matchesDate && paymentDate <= dateRange.to
      }
    }
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate
  })

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'COMPLETED': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'FAILED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || ''
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'ONLINE': 'Online',
      'CASH': 'Cash',
      'CHEQUE': 'Cheque',
      'DD': 'Demand Draft',
      'BANK_TRANSFER': 'Bank Transfer',
    }
    return labels[method] || method
  }

  const handleGenerateReceipt = (payment: Payment) => {
    setSelectedPayment(payment)
    setReceiptDialog(true)
  }

  const handleViewHistory = (payment: Payment) => {
    // Mock student payment history
    const studentPayments = payments.filter(p => p.studentId === payment.studentId)
    const history: PaymentHistory = {
      studentId: payment.studentId,
      studentName: payment.studentName,
      totalPaid: studentPayments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0),
      totalPending: studentPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      payments: studentPayments,
    }
    setSelectedStudentHistory(history)
    setHistoryDialog(true)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleEmailReceipt = () => {
    toast.success('Receipt sent to student email')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setMethodFilter('all')
    setDateRange(undefined)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Payment Records
            </CardTitle>
            <CardDescription>View and manage all payment transactions</CardDescription>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll no, or receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd MMM')} - {format(dateRange.to, 'dd MMM yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd MMM yyyy')
                    )
                  ) : (
                    'Select Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || dateRange) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {paginatedPayments.length} of {filteredPayments.length} payments
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.receiptNo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.studentName}</p>
                        <p className="text-sm text-muted-foreground">{payment.studentRollNo}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.feeType}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getMethodLabel(payment.paymentMethod)}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.date), 'dd MMM yyyy, hh:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewHistory(payment)}
                          title="View Student History"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateReceipt(payment)}
                          title="Generate Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No payments found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onOpenChange={setReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Receipt
            </DialogTitle>
            <DialogDescription>Receipt details for payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <div className="text-center border-b pb-4">
                  <h3 className="font-bold text-lg">Geetorus CampusOS</h3>
                  <p className="text-sm text-muted-foreground">Payment Receipt</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Receipt No</p>
                    <p className="font-medium">{selectedPayment.receiptNo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(selectedPayment.date), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Student Name</p>
                    <p className="font-medium">{selectedPayment.studentName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Roll No</p>
                    <p className="font-medium">{selectedPayment.studentRollNo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fee Type</p>
                    <p className="font-medium">{selectedPayment.feeType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{getMethodLabel(selectedPayment.paymentMethod)}</p>
                  </div>
                  {selectedPayment.transactionId && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-medium">{selectedPayment.transactionId}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">Total Amount</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                
                <div className="text-center text-xs text-muted-foreground border-t pt-4">
                  <p>This is a computer generated receipt</p>
                  <p>Thank you for your payment</p>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleEmailReceipt} className="w-full sm:w-auto gap-2">
                  <Mail className="h-4 w-4" />
                  Email Receipt
                </Button>
                <Button onClick={handlePrintReceipt} className="w-full sm:w-auto gap-2">
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student History Dialog */}
      <Dialog open={historyDialog} onOpenChange={setHistoryDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Payment History
            </DialogTitle>
            <DialogDescription>Complete payment history for this student</DialogDescription>
          </DialogHeader>
          {selectedStudentHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(selectedStudentHistory.totalPaid)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(selectedStudentHistory.totalPending)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {selectedStudentHistory.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{payment.feeType}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.date), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
