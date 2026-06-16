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
import { Textarea } from '@/components/ui/textarea'
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
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  IndianRupee,
  Calendar,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, isAfter, isBefore } from 'date-fns'
import { toast } from 'sonner'

interface Scholarship {
  id: string
  name: string
  type: 'MERIT' | 'NEED_BASED' | 'SPORTS' | 'CATEGORY' | 'GOVERNMENT' | 'PRIVATE'
  amount: number
  coverage: number // percentage
  eligibilityCriteria: string
  minGpa: number | null
  maxIncome: number | null
  deadline: string
  applicationCount: number
  approvedCount: number
  isActive: boolean
  createdAt: string
}

const scholarshipTypes = [
  { value: 'MERIT', label: 'Merit Based', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'NEED_BASED', label: 'Need Based', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'SPORTS', label: 'Sports', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'CATEGORY', label: 'Category Based', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'GOVERNMENT', label: 'Government', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { value: 'PRIVATE', label: 'Private', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
]

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null)
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'MERIT',
    amount: '',
    coverage: '100',
    eligibilityCriteria: '',
    minGpa: '',
    maxIncome: '',
    deadline: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    try {
      const response = await fetch('/api/finance/scholarships')
      if (response.ok) {
        const result = await response.json()
        setScholarships(result.scholarships || [])
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error)
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

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || scholarship.type === typeFilter
    return matchesSearch && matchesType
  })

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) return { status: 'expired', days: 0 }
    if (daysLeft <= 7) return { status: 'urgent', days: daysLeft }
    return { status: 'open', days: daysLeft }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.amount),
        coverage: parseInt(formData.coverage),
        eligibilityCriteria: formData.eligibilityCriteria,
        minGpa: formData.minGpa ? parseFloat(formData.minGpa) : null,
        maxIncome: formData.maxIncome ? parseFloat(formData.maxIncome) : null,
        deadline: formData.deadline,
      }

      const url = '/api/finance/scholarships'
      const method = editingScholarship ? 'PUT' : 'POST'
      
      if (editingScholarship) {
        Object.assign(payload, { id: editingScholarship.id })
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingScholarship ? 'Scholarship updated successfully' : 'Scholarship created successfully')
        setDialogOpen(false)
        resetForm()
        fetchScholarships()
      } else {
        toast.error('Failed to save scholarship')
      }
    } catch (error) {
      console.error('Error saving scholarship:', error)
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (scholarship: Scholarship) => {
    try {
      const response = await fetch('/api/finance/scholarships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: scholarship.id, isActive: !scholarship.isActive }),
      })

      if (response.ok) {
        toast.success(`Scholarship ${!scholarship.isActive ? 'activated' : 'deactivated'}`)
        fetchScholarships()
      }
    } catch (error) {
      console.error('Error toggling scholarship:', error)
    }
  }

  const handleDelete = async (scholarshipId: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return

    try {
      const response = await fetch(`/api/finance/scholarships?id=${scholarshipId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Scholarship deleted successfully')
        fetchScholarships()
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error)
    }
  }

  const openEditDialog = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship)
    setFormData({
      name: scholarship.name,
      type: scholarship.type,
      amount: scholarship.amount.toString(),
      coverage: scholarship.coverage.toString(),
      eligibilityCriteria: scholarship.eligibilityCriteria,
      minGpa: scholarship.minGpa?.toString() || '',
      maxIncome: scholarship.maxIncome?.toString() || '',
      deadline: scholarship.deadline.split('T')[0],
    })
    setDialogOpen(true)
  }

  const openDetailsDialog = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship)
    setDetailsDialog(true)
  }

  const resetForm = () => {
    setEditingScholarship(null)
    setFormData({
      name: '',
      type: 'MERIT',
      amount: '',
      coverage: '100',
      eligibilityCriteria: '',
      minGpa: '',
      maxIncome: '',
      deadline: '',
    })
  }

  const getTypeInfo = (type: string) => {
    return scholarshipTypes.find(t => t.value === type) || scholarshipTypes[0]
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
              <Award className="h-5 w-5 text-emerald-600" />
              Scholarship Management
            </CardTitle>
            <CardDescription>Manage available scholarships and applications</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Scholarship
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}</DialogTitle>
                <DialogDescription>
                  {editingScholarship ? 'Update scholarship details' : 'Create a new scholarship opportunity'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Scholarship Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Merit Scholarship 2024"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {scholarshipTypes.map(type => (
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
                      <Label htmlFor="coverage">Coverage (%)</Label>
                      <Input
                        id="coverage"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.coverage}
                        onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="minGpa">Minimum GPA (Optional)</Label>
                      <Input
                        id="minGpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.minGpa}
                        onChange={(e) => setFormData({ ...formData, minGpa: e.target.value })}
                        placeholder="7.5"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxIncome">Max Family Income (Optional)</Label>
                      <Input
                        id="maxIncome"
                        type="number"
                        value={formData.maxIncome}
                        onChange={(e) => setFormData({ ...formData, maxIncome: e.target.value })}
                        placeholder="500000"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                    <Textarea
                      id="eligibilityCriteria"
                      value={formData.eligibilityCriteria}
                      onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                      placeholder="Describe the eligibility criteria..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : editingScholarship ? 'Update' : 'Create'}
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
              placeholder="Search scholarships..."
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
              {scholarshipTypes.map(type => (
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

        {/* Scholarships Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scholarship</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScholarships.length > 0 ? (
                filteredScholarships.map((scholarship) => {
                  const deadlineInfo = getDeadlineStatus(scholarship.deadline)
                  const approvalRate = scholarship.applicationCount > 0 
                    ? Math.round((scholarship.approvedCount / scholarship.applicationCount) * 100) 
                    : 0

                  return (
                    <TableRow key={scholarship.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{scholarship.name}</p>
                          {scholarship.minGpa && (
                            <p className="text-sm text-muted-foreground">Min GPA: {scholarship.minGpa}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeInfo(scholarship.type).color}>
                          {getTypeInfo(scholarship.type).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(scholarship.amount)}</TableCell>
                      <TableCell>{scholarship.coverage}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{format(new Date(scholarship.deadline), 'dd MMM yyyy')}</p>
                            {deadlineInfo.status === 'expired' ? (
                              <p className="text-xs text-red-500">Expired</p>
                            ) : deadlineInfo.status === 'urgent' ? (
                              <p className="text-xs text-amber-500">{deadlineInfo.days} days left</p>
                            ) : (
                              <p className="text-xs text-emerald-500">{deadlineInfo.days} days left</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{scholarship.applicationCount} applied</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm">{scholarship.approvedCount} approved</span>
                          </div>
                          <Progress value={approvalRate} className="h-1.5 mt-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={scholarship.isActive}
                            onCheckedChange={() => handleToggleActive(scholarship)}
                          />
                          <span className="text-sm">{scholarship.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetailsDialog(scholarship)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(scholarship)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(scholarship.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No scholarships found</p>
                      <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first scholarship
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Scholarship Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Scholarship Details
            </DialogTitle>
            <DialogDescription>Complete information about this scholarship</DialogDescription>
          </DialogHeader>
          {selectedScholarship && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedScholarship.name}</h3>
                <Badge className={getTypeInfo(selectedScholarship.type).color}>
                  {getTypeInfo(selectedScholarship.type).label}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(selectedScholarship.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coverage</p>
                  <p className="text-xl font-bold">{selectedScholarship.coverage}%</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Eligibility Criteria</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedScholarship.eligibilityCriteria || 'No specific criteria'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedScholarship.minGpa && (
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum GPA</p>
                    <p className="font-medium">{selectedScholarship.minGpa}</p>
                  </div>
                )}
                {selectedScholarship.maxIncome && (
                  <div>
                    <p className="text-sm text-muted-foreground">Max Family Income</p>
                    <p className="font-medium">{formatCurrency(selectedScholarship.maxIncome)}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedScholarship.applicationCount}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">{selectedScholarship.approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Application Deadline</span>
                </div>
                <span className="font-medium">{format(new Date(selectedScholarship.deadline), 'dd MMMM yyyy')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
