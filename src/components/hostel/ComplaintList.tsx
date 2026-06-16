'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  Zap,
  Droplet,
  Sofa,
  Sparkles,
  MoreHorizontal,
  MessageSquare,
  Calendar,
  User,
  Building2
} from 'lucide-react'

// Types
interface Complaint {
  id: string
  category: string
  description: string
  status: string
  roomNumber: string | null
  hostelId: string | null
  remarks: string | null
  resolvedAt: string | null
  createdAt: string
  studentId: string | null
  student?: {
    id: string
    name: string
    rollNumber: string
  }
  hostel?: {
    id: string
    name: string
  }
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  electrical: { label: 'Electrical', icon: <Zap className="h-4 w-4" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  plumbing: { label: 'Plumbing', icon: <Droplet className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  furniture: { label: 'Furniture', icon: <Sofa className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  cleaning: { label: 'Cleaning', icon: <Sparkles className="h-4 w-4" />, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  other: { label: 'Other', icon: <MoreHorizontal className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'In Progress', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  resolved: { label: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
}

const categories = ['electrical', 'plumbing', 'furniture', 'cleaning', 'other'] as const
const statuses = ['pending', 'in_progress', 'resolved'] as const

export default function ComplaintList() {
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [totalComplaints, setTotalComplaints] = useState(0)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Dialogs
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [page, statusFilter, categoryFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        fetchComplaints()
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      
      const response = await fetch(`/api/hostel/complaints?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setComplaints(data.data.complaints)
        setTotalComplaints(data.data.total)
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/hostel/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          status: newStatus,
          remarks: remarks || undefined
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Complaint updated successfully'
        })
        setUpdateDialogOpen(false)
        setNewStatus('')
        setRemarks('')
        fetchComplaints()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update complaint',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update complaint',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openUpdateDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setNewStatus(complaint.status)
    setRemarks(complaint.remarks || '')
    setUpdateDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalComplaints / pageSize)

  // Calculate stats
  const stats = {
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
  }

  if (loading && complaints.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">{totalComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusConfig[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {categoryConfig[category].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Hostel Complaints</CardTitle>
          <CardDescription>
            Showing {complaints.length} of {totalComplaints} complaints
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {complaints.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No complaints found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{complaint.description}</p>
                          {complaint.remarks && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              <span className="line-clamp-1">Note: {complaint.remarks}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={categoryConfig[complaint.category]?.color || categoryConfig.other.color}>
                          <span className="flex items-center gap-1">
                            {categoryConfig[complaint.category]?.icon}
                            {categoryConfig[complaint.category]?.label || complaint.category}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {complaint.hostel ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{complaint.hostel.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          {complaint.roomNumber && (
                            <p className="text-xs text-muted-foreground">
                              Room {complaint.roomNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {complaint.student ? (
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{complaint.student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {complaint.student.rollNumber}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(complaint.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[complaint.status]?.color || statusConfig.pending.color}>
                          <span className="flex items-center gap-1">
                            {statusConfig[complaint.status]?.icon}
                            {statusConfig[complaint.status]?.label || complaint.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(complaint)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>
              Change the status and add remarks for this complaint
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4 py-4">
              {/* Complaint Summary */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={categoryConfig[selectedComplaint.category]?.color}>
                    {categoryConfig[selectedComplaint.category]?.label}
                  </Badge>
                  <Badge variant="outline" className={statusConfig[selectedComplaint.status]?.color}>
                    {statusConfig[selectedComplaint.status]?.label}
                  </Badge>
                </div>
                <p className="text-sm">{selectedComplaint.description}</p>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="flex items-center gap-2">
                          {statusConfig[status].icon}
                          {statusConfig[status].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label>Remarks (Optional)</Label>
                <Textarea
                  placeholder="Add any notes or remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Resolution Info */}
              {selectedComplaint.resolvedAt && (
                <div className="text-sm text-muted-foreground">
                  <p>Resolved on: {formatDate(selectedComplaint.resolvedAt)}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={submitting || !newStatus}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
