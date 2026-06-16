'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Search,
  Filter,
  Download,
  User,
  Building2,
  DoorOpen,
  Calendar,
  CalendarCheck,
  BedDouble,
  MoreHorizontal,
  Eye,
  UserMinus
} from 'lucide-react'

// Types
interface Hostel {
  id: string
  name: string
  type: string
}

interface Room {
  id: string
  roomNumber: string
  floor: number | null
  type: string
  hostel: Hostel
}

interface Student {
  id: string
  name: string
  rollNumber: string
  department: {
    name: string
    code: string
  }
  course: {
    name: string
  }
}

interface Allocation {
  id: string
  bedNumber: number | null
  allocationDate: string
  vacateDate: string | null
  status: string
  room: Room
  student: Student
}

export default function AllocationList() {
  const { toast } = useToast()
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAllocations, setTotalAllocations] = useState(0)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [hostelFilter, setHostelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  
  // Dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null)

  useEffect(() => {
    fetchAllocations()
    fetchHostels()
  }, [page, hostelFilter, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        fetchAllocations()
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const fetchAllocations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))
      if (searchQuery) params.append('search', searchQuery)
      if (hostelFilter !== 'all') params.append('hostelId', hostelFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/hostel/allocations?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setAllocations(data.data.allocations)
        setTotalAllocations(data.data.total)
      }
    } catch (error) {
      console.error('Error fetching allocations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load allocations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostel/rooms?hostels=true')
      const data = await response.json()
      if (data.success) {
        setHostels(data.data.hostels || [])
      }
    } catch (error) {
      console.error('Error fetching hostels:', error)
    }
  }

  const handleVacate = async (allocationId: string) => {
    try {
      const response = await fetch('/api/hostel/allocations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationId,
          action: 'vacate'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Student vacated successfully'
        })
        fetchAllocations()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to vacate student',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vacate student',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'vacated':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const totalPages = Math.ceil(totalAllocations / pageSize)

  if (loading && allocations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Allocations</p>
                <p className="text-2xl font-bold">
                  {allocations.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hostels</p>
                <p className="text-2xl font-bold">{hostels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <DoorOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{totalAllocations}</p>
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
            placeholder="Search by student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={hostelFilter} onValueChange={setHostelFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select hostel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostels.map((hostel) => (
              <SelectItem key={hostel.id} value={hostel.id}>
                {hostel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="vacated">Vacated</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Allocations Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Room Allocations</CardTitle>
          <CardDescription>
            Showing {allocations.length} of {totalAllocations} allocations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {allocations.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No allocations found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Room Details</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Allocation Date</TableHead>
                    <TableHead>Vacate Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation) => (
                    <TableRow key={allocation.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                              {getInitials(allocation.student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{allocation.student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {allocation.student.rollNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            Room {allocation.room.roomNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {allocation.room.hostel.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocation.bedNumber ? (
                          <Badge variant="outline">Bed {allocation.bedNumber}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(allocation.allocationDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocation.vacateDate ? (
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(allocation.vacateDate)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(allocation.status)}>
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAllocation(allocation)
                              setDetailsDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {allocation.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleVacate(allocation.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Allocation Details</DialogTitle>
            <DialogDescription>
              Complete information about this room allocation
            </DialogDescription>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Student Information
                </h4>
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {getInitials(selectedAllocation.student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedAllocation.student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAllocation.student.rollNumber}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium">{selectedAllocation.student.department.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Course</p>
                    <p className="font-medium">{selectedAllocation.student.course.name}</p>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Room Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Hostel</p>
                    <p className="font-medium">{selectedAllocation.room.hostel.name}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Room Number</p>
                    <p className="font-medium">{selectedAllocation.room.roomNumber}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Room Type</p>
                    <p className="font-medium capitalize">{selectedAllocation.room.type}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Bed Number</p>
                    <p className="font-medium">
                      {selectedAllocation.bedNumber || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Allocation Timeline
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Allocation Date</p>
                    <p className="font-medium">{formatDate(selectedAllocation.allocationDate)}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Vacate Date</p>
                    <p className="font-medium">
                      {selectedAllocation.vacateDate 
                        ? formatDate(selectedAllocation.vacateDate) 
                        : 'Currently Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
