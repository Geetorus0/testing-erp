'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Send,
  GraduationCap,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Bell,
  Plus,
  IndianRupee,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'

interface Department {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  enrollmentNo: string
  email: string
  cgpa: number
  backlogs: number
  passingYear: number
  department: { id: string; name: string }
  course: { id: string; name: string }
  hasOffer?: boolean
}

interface DriveInfo {
  id: string
  title: string
  company: { name: string }
  minCgpa: number | null
  maxBacklogs: number | null
}

interface EligibilityData {
  students: Student[]
  departments: Department[]
  passingYears: number[]
  drive?: DriveInfo
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Drive {
  id: string
  title: string
  company: { name: string }
  status: string
}

export default function StudentEligibility() {
  const [data, setData] = useState<EligibilityData | null>(null)
  const [drives, setDrives] = useState<Drive[]>([])
  const [loading, setLoading] = useState(true)
  const [driveFilter, setDriveFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [passingYearFilter, setPassingYearFilter] = useState('all')
  const [minCgpa, setMinCgpa] = useState('')
  const [maxBacklogs, setMaxBacklogs] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [offerPackage, setOfferPackage] = useState('')
  const [offerDesignation, setOfferDesignation] = useState('')
  const [offerLocation, setOfferLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEligibility()
    fetchDrives()
  }, [page, driveFilter, departmentFilter, passingYearFilter])

  const fetchDrives = async () => {
    try {
      const response = await fetch('/api/placement/drives?limit=100')
      if (response.ok) {
        const result = await response.json()
        setDrives(result.drives.filter((d: Drive) => d.status !== 'completed' && d.status !== 'cancelled'))
      }
    } catch (error) {
      console.error('Error fetching drives:', error)
    }
  }

  const fetchEligibility = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (driveFilter && driveFilter !== 'all') {
        params.append('driveId', driveFilter)
      }
      if (departmentFilter && departmentFilter !== 'all') {
        params.append('departmentId', departmentFilter)
      }
      if (passingYearFilter && passingYearFilter !== 'all') {
        params.append('passingYear', passingYearFilter)
      }
      if (minCgpa) {
        params.append('minCgpa', minCgpa)
      }
      if (maxBacklogs) {
        params.append('maxBacklogs', maxBacklogs)
      }
      params.append('page', page.toString())
      params.append('limit', '15')

      const response = await fetch(`/api/placement/eligibility?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setSelectedStudents([])
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchEligibility()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(data?.students.filter(s => !s.hasOffer).map(s => s.id) || [])
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId])
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId))
    }
  }

  const handleNotify = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }
    if (!driveFilter || driveFilter === 'all') {
      toast.error('Please select a drive first')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/placement/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveId: driveFilter,
          studentIds: selectedStudents,
          action: 'notify'
        })
      })

      const result = await response.json()
      if (response.ok) {
        toast.success(`Notifications sent to ${result.notifiedCount} students`)
        setSelectedStudents([])
      } else {
        toast.error(result.error || 'Failed to send notifications')
      }
    } catch (error) {
      toast.error('Failed to send notifications')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOffers = async () => {
    if (!offerPackage || parseFloat(offerPackage) <= 0) {
      toast.error('Please enter a valid package amount')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/placement/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveId: driveFilter,
          studentIds: selectedStudents,
          action: 'create_offers',
          package: parseFloat(offerPackage),
          designation: offerDesignation,
          location: offerLocation
        })
      })

      const result = await response.json()
      if (response.ok) {
        toast.success(`Created ${result.createdCount} offers successfully`)
        setOfferDialogOpen(false)
        setSelectedStudents([])
        setOfferPackage('')
        setOfferDesignation('')
        setOfferLocation('')
        fetchEligibility()
      } else {
        toast.error(result.error || 'Failed to create offers')
      }
    } catch (error) {
      toast.error('Failed to create offers')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-600" />
              Student Eligibility
            </CardTitle>
            <CardDescription>Check and manage eligible students for drives</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleNotify}
              disabled={selectedStudents.length === 0 || submitting}
            >
              <Bell className="h-4 w-4" />
              Notify ({selectedStudents.length})
            </Button>
            <Button
              className="gap-2"
              onClick={() => setOfferDialogOpen(true)}
              disabled={selectedStudents.length === 0}
            >
              <Plus className="h-4 w-4" />
              Create Offers ({selectedStudents.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <Select value={driveFilter} onValueChange={setDriveFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select Drive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drives</SelectItem>
              {drives.map((drive) => (
                <SelectItem key={drive.id} value={drive.id}>
                  {drive.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {data?.departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={passingYearFilter} onValueChange={setPassingYearFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Passing Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {data?.passingYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Min CGPA"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
          />
          <Input
            type="number"
            min="0"
            placeholder="Max Backlogs"
            value={maxBacklogs}
            onChange={(e) => setMaxBacklogs(e.target.value)}
          />
          <Button onClick={handleSearch} variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>

        {/* Drive Eligibility Info */}
        {data?.drive && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Drive</p>
                <p className="font-medium">{data.drive.title} - {data.drive.company.name}</p>
              </div>
              {data.drive.minCgpa && (
                <div>
                  <p className="text-sm text-muted-foreground">Min CGPA Required</p>
                  <p className="font-medium text-emerald-600">{data.drive.minCgpa}</p>
                </div>
              )}
              {data.drive.maxBacklogs !== null && data.drive.maxBacklogs !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Max Backlogs Allowed</p>
                  <p className="font-medium text-orange-600">{data.drive.maxBacklogs}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Eligible Students</p>
                <p className="font-medium text-blue-600">{data.pagination.total}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStudents.length === data?.students.filter(s => !s.hasOffer).length && data?.students.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="text-center">CGPA</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Backlogs</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">Year</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.students && data.students.length > 0 ? (
                    data.students.map((student) => (
                      <TableRow key={student.id} className={student.hasOffer ? 'bg-muted/30' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                            disabled={student.hasOffer}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.enrollmentNo} • {student.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <p className="text-sm">{student.department.name}</p>
                            <p className="text-xs text-muted-foreground">{student.course.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={student.cgpa >= 8 ? 'default' : student.cgpa >= 6 ? 'secondary' : 'outline'}>
                            {student.cgpa.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant={student.backlogs === 0 ? 'default' : student.backlogs <= 2 ? 'secondary' : 'destructive'}>
                            {student.backlogs}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          {student.passingYear}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.hasOffer ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Offered
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Eligible
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No eligible students found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, data.pagination.total)} of {data.pagination.total} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= data.pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Create Offer Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Offers</DialogTitle>
            <DialogDescription>
              Create offers for {selectedStudents.length} selected student(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="package">Package (LPA) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="package"
                  type="number"
                  step="0.5"
                  min="0"
                  className="pl-9"
                  placeholder="e.g., 6.5"
                  value={offerPackage}
                  onChange={(e) => setOfferPackage(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                placeholder="e.g., Software Engineer"
                value={offerDesignation}
                onChange={(e) => setOfferDesignation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-9"
                  placeholder="e.g., Bangalore"
                  value={offerLocation}
                  onChange={(e) => setOfferLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOffers} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Offers'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
