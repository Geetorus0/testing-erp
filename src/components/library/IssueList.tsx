'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Label } from '@/components/ui/label'
import { 
  Search, 
  BookMarked,
  RotateCcw,
  AlertTriangle,
  Filter,
  Clock,
  IndianRupee
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Book {
  id: string
  title: string
  author: string
  isbn: string | null
  category: string | null
}

interface Student {
  id: string
  name: string
  rollNumber: string
  email: string
  department: { name: string }
}

interface Issue {
  id: string
  book: Book
  student: Student
  issueDate: Date
  dueDate: Date
  returnDate: Date | null
  status: string
  fine: number
  calculatedFine: number
}

interface BookOption {
  id: string
  title: string
  author: string
  availableCopies: number
}

interface StudentOption {
  id: string
  name: string
  rollNumber: string
  department: { name: string }
}

export default function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Issue dialog state
  const [books, setBooks] = useState<BookOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedBook, setSelectedBook] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [issueDays, setIssueDays] = useState('14')

  useEffect(() => {
    fetchIssues()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIssues()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/library/issues?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setIssues(result.issues)
      }
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBooksAndStudents = async () => {
    try {
      // Fetch available books
      const booksRes = await fetch('/api/library/books?availability=available')
      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(booksData.books)
      }

      // Fetch students
      const studentsRes = await fetch('/api/library/members')
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.members.filter((m: { canIssue: boolean }) => m.canIssue))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleIssueBook = async () => {
    if (!selectedBook || !selectedStudent) {
      toast.error('Please select both book and student')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/library/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBook,
          studentId: selectedStudent,
          issueDays: parseInt(issueDays)
        })
      })

      if (response.ok) {
        toast.success('Book issued successfully')
        setShowIssueDialog(false)
        setSelectedBook('')
        setSelectedStudent('')
        setIssueDays('14')
        fetchIssues()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to issue book')
      }
    } catch {
      toast.error('Failed to issue book')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturnBook = async () => {
    if (!selectedIssue) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/library/issues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: selectedIssue.id })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Book returned successfully. Fine charged: ₹${result.fineCharged}`)
        setShowReturnDialog(false)
        setSelectedIssue(null)
        fetchIssues()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to return book')
      }
    } catch {
      toast.error('Failed to return book')
    } finally {
      setSubmitting(false)
    }
  }

  const openIssueDialog = () => {
    fetchBooksAndStudents()
    setShowIssueDialog(true)
  }

  const openReturnDialog = (issue: Issue) => {
    setSelectedIssue(issue)
    setShowReturnDialog(true)
  }

  const getStatusBadge = (issue: Issue) => {
    if (issue.status === 'returned') {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Returned</Badge>
    }
    if (issue.calculatedFine > 0) {
      return <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Overdue
      </Badge>
    }
    return <Badge variant="default" className="bg-blue-600">Issued</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-emerald-600" />
                Book Issues
              </CardTitle>
              <CardDescription>Manage book issues and returns</CardDescription>
            </div>
            <Button onClick={openIssueDialog} className="w-full sm:w-auto">
              <BookMarked className="h-4 w-4 mr-2" />
              Issue Book
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by book, student, roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="issued">Currently Issued</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issues Table */}
          {issues.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Issue Date</TableHead>
                    <TableHead className="hidden md:table-cell">Due Date</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.book.title}</p>
                          <p className="text-sm text-muted-foreground">{issue.book.author}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.student.name}</p>
                          <p className="text-sm text-muted-foreground">{issue.student.rollNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(issue.issueDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={issue.calculatedFine > 0 ? 'text-red-600 font-medium' : ''}>
                          {format(new Date(issue.dueDate), 'dd MMM yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {issue.calculatedFine > 0 ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {issue.calculatedFine}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(issue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {issue.status === 'issued' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReturnDialog(issue)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return
                          </Button>
                        )}
                        {issue.status === 'returned' && (
                          <span className="text-sm text-muted-foreground">
                            {issue.returnDate && format(new Date(issue.returnDate), 'dd MMM yyyy')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No issues found</p>
              <p className="text-sm">Try adjusting your search or issue a new book</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Book Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
            <DialogDescription>Select a book and student to issue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Book</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.filter(b => b.availableCopies > 0).map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} - {book.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Issue Duration (Days)</Label>
              <Select value={issueDays} onValueChange={setIssueDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="21">21 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Cancel</Button>
            <Button onClick={handleIssueBook} disabled={submitting}>
              {submitting ? 'Issuing...' : 'Issue Book'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>Confirm book return and calculate fine</DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Book</p>
                  <p className="font-medium">{selectedIssue.book.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedIssue.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{format(new Date(selectedIssue.issueDate), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className={`font-medium ${selectedIssue.calculatedFine > 0 ? 'text-red-600' : ''}`}>
                    {format(new Date(selectedIssue.dueDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              
              {selectedIssue.calculatedFine > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Overdue Notice</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    This book is overdue. A fine of <strong>₹{selectedIssue.calculatedFine}</strong> will be charged.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancel</Button>
            <Button onClick={handleReturnBook} disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
