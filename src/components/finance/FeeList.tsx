'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  IndianRupee,
  Calendar,
  BookOpen,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Fee {
  id: string
  name: string
  type: string
  amount: number
  course: string | null
  semester: number | null
  dueDate: string
  isActive: boolean
  createdAt: string
  studentCount?: number
}

interface Course {
  id: string
  name: string
  code: string
}

const feeTypes = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'LIBRARY', label: 'Library Fee' },
  { value: 'LAB', label: 'Lab Fee' },
  { value: 'SPORTS', label: 'Sports Fee' },
  { value: 'HOSTEL', label: 'Hostel Fee' },
  { value: 'TRANSPORT', label: 'Transport Fee' },
  { value: 'EXAMINATION', label: 'Examination Fee' },
  { value: 'DEVELOPMENT', label: 'Development Fee' },
  { value: 'OTHER', label: 'Other' },
]

const semesters = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
  { value: 'ALL', label: 'All Semesters' },
]

export default function FeeList() {
  const [fees, setFees] = useState<Fee[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'TUITION',
    amount: '',
    course: 'ALL',
    semester: 'ALL',
    dueDate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFees()
    fetchCourses()
  }, [])

  const fetchFees = async () => {
    try {
      const response = await fetch('/api/finance/fees')
      if (response.ok) {
        const result = await response.json()
        setFees(result.fees || [])
      }
    } catch (error) {
      console.error('Error fetching fees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    // Mock courses data
    setCourses([
      { id: '1', name: 'Computer Science Engineering', code: 'CSE' },
      { id: '2', name: 'Electronics Engineering', code: 'ECE' },
      { id: '3', name: 'Mechanical Engineering', code: 'ME' },
      { id: '4', name: 'Civil Engineering', code: 'CE' },
      { id: '5', name: 'Electrical Engineering', code: 'EE' },
    ])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || fee.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.amount),
        course: formData.course === 'ALL' ? null : formData.course,
        semester: formData.semester === 'ALL' ? null : parseInt(formData.semester),
        dueDate: formData.dueDate,
      }

      const url = '/api/finance/fees'
      const method = editingFee ? 'PUT' : 'POST'
      
      if (editingFee) {
        Object.assign(payload, { id: editingFee.id })
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingFee ? 'Fee updated successfully' : 'Fee created successfully')
        setDialogOpen(false)
        resetForm()
        fetchFees()
      } else {
        toast.error('Failed to save fee')
      }
    } catch (error) {
      console.error('Error saving fee:', error)
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (fee: Fee) => {
    try {
      const response = await fetch('/api/finance/fees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fee.id, isActive: !fee.isActive }),
      })

      if (response.ok) {
        toast.success(`Fee ${!fee.isActive ? 'activated' : 'deactivated'}`)
        fetchFees()
      }
    } catch (error) {
      console.error('Error toggling fee:', error)
    }
  }

  const handleDelete = async (feeId: string) => {
    if (!confirm('Are you sure you want to delete this fee?')) return

    try {
      const response = await fetch(`/api/finance/fees?id=${feeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Fee deleted successfully')
        fetchFees()
      }
    } catch (error) {
      console.error('Error deleting fee:', error)
    }
  }

  const openEditDialog = (fee: Fee) => {
    setEditingFee(fee)
    setFormData({
      name: fee.name,
      type: fee.type,
      amount: fee.amount.toString(),
      course: fee.course || 'ALL',
      semester: fee.semester?.toString() || 'ALL',
      dueDate: fee.dueDate.split('T')[0],
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingFee(null)
    setFormData({
      name: '',
      type: 'TUITION',
      amount: '',
      course: 'ALL',
      semester: 'ALL',
      dueDate: '',
    })
  }

  const getTypeLabel = (type: string) => {
    return feeTypes.find(t => t.value === type)?.label || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'TUITION': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'LIBRARY': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'LAB': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'SPORTS': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'HOSTEL': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'TRANSPORT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'EXAMINATION': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'DEVELOPMENT': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'OTHER': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[type] || colors['OTHER']
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
              <IndianRupee className="h-5 w-5 text-emerald-600" />
              Fee Management
            </CardTitle>
            <CardDescription>Manage fee types and assignments</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Fee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle>
                <DialogDescription>
                  {editingFee ? 'Update fee details' : 'Create a new fee type for students'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Fee Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., First Semester Tuition Fee"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Fee Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="50000"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="course">Course</Label>
                      <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Courses</SelectItem>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.code} - {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map(sem => (
                            <SelectItem key={sem.value} value={sem.value}>
                              {sem.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : editingFee ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {feeTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Fees Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fee.name}</p>
                        {fee.studentCount && (
                          <p className="text-sm text-muted-foreground">{fee.studentCount} students</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(fee.type)}>
                        {getTypeLabel(fee.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{fee.course || 'All Courses'}</span>
                        {fee.semester && (
                          <span className="text-muted-foreground">- Sem {fee.semester}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(fee.dueDate), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={fee.isActive}
                          onCheckedChange={() => handleToggleActive(fee)}
                        />
                        <span className="text-sm">{fee.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(fee)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(fee.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <IndianRupee className="h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No fees found</p>
                      <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first fee
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
