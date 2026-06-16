'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Trash2, UserPlus, User, MapPin, Route } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Student {
  id: string
  name: string
  enrollmentNo: string
  email: string | null
  department: { name: string } | null
  course: { name: string } | null
}

interface RouteData {
  id: string
  routeNumber: string
  routeName: string
  startPoint: string
  endPoint: string
  stops: string | null
  bus?: {
    busNumber: string
    capacity: number
  }
}

interface Allocation {
  id: string
  routeId: string
  studentId: string
  boardingStop: string | null
  allocationDate: string
  status: string
  route?: RouteData
  student?: Student
  createdAt: string
}

interface AllocationFormData {
  studentId: string
  routeId: string
  boardingStop: string
}

const initialFormData: AllocationFormData = {
  studentId: '',
  routeId: '',
  boardingStop: ''
}

export default function AllocationList() {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<AllocationFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')

  useEffect(() => {
    fetchAllocations()
    fetchRoutes()
  }, [])

  const fetchAllocations = async () => {
    try {
      const response = await fetch('/api/transport/allocations')
      if (response.ok) {
        const result = await response.json()
        setAllocations(result.allocations || [])
      }
    } catch (error) {
      console.error('Error fetching allocations:', error)
      toast.error('Failed to load allocations')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/transport/routes')
      if (response.ok) {
        const result = await response.json()
        setRoutes(result.routes || [])
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
    }
  }

  const searchStudents = async (query: string) => {
    if (!query || query.length < 2) {
      setStudents([])
      return
    }
    try {
      const response = await fetch(`/api/transport/allocations?searchStudents=${encodeURIComponent(query)}`)
      if (response.ok) {
        const result = await response.json()
        setStudents(result.students || [])
      }
    } catch (error) {
      console.error('Error searching students:', error)
    }
  }

  const handleStudentSearch = (value: string) => {
    setStudentSearch(value)
    searchStudents(value)
  }

  const handleOpenDialog = () => {
    setFormData(initialFormData)
    setStudentSearch('')
    setStudents([])
    setDialogOpen(true)
  }

  const handleSaveAllocation = async () => {
    if (!formData.studentId) {
      toast.error('Please select a student')
      return
    }
    if (!formData.routeId) {
      toast.error('Please select a route')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/transport/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Transport allocated successfully')
        setDialogOpen(false)
        fetchAllocations()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to allocate transport')
      }
    } catch {
      toast.error('Failed to allocate transport')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllocation = async (allocationId: string) => {
    if (!confirm('Are you sure you want to remove this allocation?')) return

    try {
      const response = await fetch(`/api/transport/allocations?id=${allocationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Allocation removed successfully')
        fetchAllocations()
      } else {
        toast.error('Failed to remove allocation')
      }
    } catch {
      toast.error('Failed to remove allocation')
    }
  }

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch =
      allocation.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      allocation.student?.enrollmentNo?.toLowerCase().includes(search.toLowerCase()) ||
      allocation.route?.routeName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const parseStops = (stopsJson: string | null): string[] => {
    if (!stopsJson) return []
    try {
      const parsed = JSON.parse(stopsJson)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const selectedRoute = routes.find(r => r.id === formData.routeId)
  const availableStops = selectedRoute ? parseStops(selectedRoute.stops) : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Student Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Student Allocations
          </CardTitle>
          <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Allocate Transport
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or enrollment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Boarding Stop</TableHead>
                <TableHead>Allocation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No allocations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAllocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{allocation.student?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {allocation.student?.department?.name || 'No department'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {allocation.student?.enrollmentNo || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {allocation.route ? (
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{allocation.route.routeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {allocation.route.routeNumber} • {allocation.route.bus?.busNumber || 'No bus'}
                            </p>
                          </div>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {allocation.boardingStop ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-emerald-500" />
                          <span className="text-sm">{allocation.boardingStop}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {allocation.allocationDate
                        ? format(new Date(allocation.allocationDate), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteAllocation(allocation.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredAllocations.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredAllocations.length} of {allocations.length} allocations</span>
            <span>
              Active: {allocations.filter(a => a.status === 'active').length}
            </span>
          </div>
        )}
      </CardContent>

      {/* Allocate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allocate Transport</DialogTitle>
            <DialogDescription>
              Assign a student to a bus route
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Search Student *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or enrollment number..."
                  value={studentSearch}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {students.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 hover:bg-muted cursor-pointer flex items-center justify-between ${
                        formData.studentId === student.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        setFormData({ ...formData, studentId: student.id })
                        setStudentSearch(student.name)
                        setStudents([])
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.enrollmentNo} • {student.department?.name || 'No department'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Route *</Label>
              <Select
                value={formData.routeId}
                onValueChange={(value) => setFormData({ ...formData, routeId: value, boardingStop: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      <div className="flex items-center gap-2">
                        <span>{route.routeName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({route.routeNumber})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availableStops.length > 0 && (
              <div className="space-y-2">
                <Label>Boarding Stop</Label>
                <Select
                  value={formData.boardingStop}
                  onValueChange={(value) => setFormData({ ...formData, boardingStop: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select boarding stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStops.map((stop, index) => (
                      <SelectItem key={index} value={stop}>
                        {stop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedRoute && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Route Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span> {selectedRoute.startPoint}
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span> {selectedRoute.endPoint}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bus:</span> {selectedRoute.bus?.busNumber || 'Not assigned'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span> {selectedRoute.bus?.capacity || 0} seats
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAllocation} disabled={saving}>
              {saving ? 'Allocating...' : 'Allocate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
