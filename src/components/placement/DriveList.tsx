'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon,
  Briefcase,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  IndianRupee,
  GraduationCap,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  logo: string | null
  industry: string | null
}

interface Drive {
  id: string
  title: string
  description: string | null
  company: Company
  eligibleCourses: string[]
  eligibleDepartments: string | null
  minCgpa: number | null
  maxBacklogs: number | null
  eligibleYears: string[]
  packageMin: number | null
  packageMax: number | null
  locations: string | null
  positions: string | null
  lastDate: Date
  driveDate: Date
  status: string
  totalOffers: number
  totalInterviews: number
  createdAt: Date
}

interface DrivesData {
  drives: Drive[]
  statusCounts: Record<string, number>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CompanyList {
  companies: Company[]
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

const initialFormState = {
  companyId: '',
  title: '',
  description: '',
  eligibleDepartments: '',
  minCgpa: '',
  maxBacklogs: '',
  packageMin: '',
  packageMax: '',
  locations: '',
  positions: '',
  lastDate: null as Date | null,
  driveDate: null as Date | null
}

export default function DriveList() {
  const [data, setData] = useState<DrivesData | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDrives()
    fetchCompanies()
  }, [page, statusFilter])

  const fetchDrives = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', page.toString())
      params.append('limit', '10')

      const response = await fetch(`/api/placement/drives?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching drives:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/placement/companies?limit=100')
      if (response.ok) {
        const result = await response.json()
        setCompanies(result.companies)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchDrives()
  }

  const handleSubmit = async () => {
    if (!formData.companyId) {
      toast.error('Please select a company')
      return
    }
    if (!formData.title.trim()) {
      toast.error('Drive title is required')
      return
    }
    if (!formData.driveDate) {
      toast.error('Drive date is required')
      return
    }
    if (!formData.lastDate) {
      toast.error('Last date to apply is required')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minCgpa: formData.minCgpa ? parseFloat(formData.minCgpa) : null,
          maxBacklogs: formData.maxBacklogs ? parseInt(formData.maxBacklogs) : null,
          packageMin: formData.packageMin ? parseFloat(formData.packageMin) : null,
          packageMax: formData.packageMax ? parseFloat(formData.packageMax) : null,
          lastDate: formData.lastDate?.toISOString(),
          driveDate: formData.driveDate?.toISOString()
        })
      })

      const result = await response.json()
      if (response.ok) {
        toast.success('Drive created successfully')
        setDialogOpen(false)
        setFormData(initialFormState)
        fetchDrives()
      } else {
        toast.error(result.error || 'Failed to create drive')
      }
    } catch (error) {
      toast.error('Failed to create drive')
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
              <Briefcase className="h-5 w-5 text-purple-600" />
              Placement Drives
            </CardTitle>
            <CardDescription>Manage recruitment drives</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Drive</DialogTitle>
                <DialogDescription>
                  Schedule a new placement drive
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select 
                    value={formData.companyId} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, companyId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Drive Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Campus Recruitment 2024"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Drive details and job description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minCgpa">Minimum CGPA</Label>
                  <Input
                    id="minCgpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData(prev => ({ ...prev, minCgpa: e.target.value }))}
                    placeholder="e.g., 6.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBacklogs">Max Backlogs Allowed</Label>
                  <Input
                    id="maxBacklogs"
                    type="number"
                    min="0"
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxBacklogs: e.target.value }))}
                    placeholder="e.g., 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packageMin">Package Min (LPA)</Label>
                  <Input
                    id="packageMin"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.packageMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, packageMin: e.target.value }))}
                    placeholder="e.g., 4.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packageMax">Package Max (LPA)</Label>
                  <Input
                    id="packageMax"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.packageMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, packageMax: e.target.value }))}
                    placeholder="e.g., 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Positions</Label>
                  <Input
                    id="positions"
                    value={formData.positions}
                    onChange={(e) => setFormData(prev => ({ ...prev, positions: e.target.value }))}
                    placeholder="e.g., Software Engineer, Data Analyst"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locations">Locations</Label>
                  <Input
                    id="locations"
                    value={formData.locations}
                    onChange={(e) => setFormData(prev => ({ ...prev, locations: e.target.value }))}
                    placeholder="e.g., Bangalore, Mumbai, Pune"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Drive Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.driveDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.driveDate ? format(formData.driveDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.driveDate || undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, driveDate: date || null }))}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Last Date to Apply *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.lastDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.lastDate ? format(formData.lastDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.lastDate || undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, lastDate: date || null }))}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Drive'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search drives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drives</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} variant="secondary">
            Search
          </Button>
        </div>

        {/* Status Badges */}
        {data?.statusCounts && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStatusFilter('all')}
            >
              All ({Object.values(data.statusCounts).reduce((a, b) => a + b, 0)})
            </Badge>
            {Object.entries(data.statusCounts).map(([status, count]) => (
              <Badge 
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                className={cn("cursor-pointer", statusFilter !== status && statusColors[status])}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </Badge>
            ))}
          </div>
        )}

        {/* Drive Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.drives && data.drives.length > 0 ? (
                data.drives.map((drive) => (
                  <div
                    key={drive.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {drive.company.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{drive.title}</h3>
                            <Badge className={statusColors[drive.status]}>
                              {drive.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {drive.company.name}
                            {drive.company.industry && (
                              <Badge variant="secondary" className="ml-1">
                                {drive.company.industry}
                              </Badge>
                            )}
                          </p>
                          
                          {/* Eligibility Criteria */}
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {(drive.minCgpa || drive.maxBacklogs !== null) && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                <span>
                                  {drive.minCgpa && `CGPA ≥ ${drive.minCgpa}`}
                                  {drive.minCgpa && drive.maxBacklogs !== null && ', '}
                                  {drive.maxBacklogs !== null && `Backlogs ≤ ${drive.maxBacklogs}`}
                                </span>
                              </div>
                            )}
                            {drive.locations && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{drive.locations}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        {/* Package */}
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Package</p>
                          <p className="font-semibold text-emerald-600 flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            {drive.packageMin && drive.packageMax
                              ? `${drive.packageMin} - ${drive.packageMax} LPA`
                              : drive.packageMin
                              ? `${drive.packageMin}+ LPA`
                              : drive.packageMax
                              ? `Up to ${drive.packageMax} LPA`
                              : 'TBD'}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Offers</p>
                            <p className="font-semibold">{drive.totalOffers}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Interviews</p>
                            <p className="font-semibold">{drive.totalInterviews}</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(drive.driveDate), 'dd MMM yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Clock className="h-3 w-3" />
                            <span>Apply by {format(new Date(drive.lastDate), 'dd MMM')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No drives found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} drives
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
    </Card>
  )
}
