'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Briefcase,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  User
} from 'lucide-react'

interface Offer {
  id: string
  package: number
  designation: string | null
  location: string | null
  offerDate: Date
  joiningDate: Date | null
  status: string
  student: {
    id: string
    name: string
    enrollmentNo: string
    email: string
    department: { name: string }
    course: { name: string }
  }
  drive: {
    id: string
    title: string
  }
  company: {
    id: string
    name: string
    logo: string | null
  }
  createdAt: Date
}

interface OffersData {
  offers: Offer[]
  statusCounts: Record<string, number>
  packageStats: {
    min: number
    max: number
    avg: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  accepted: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  joined: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle2 }
}

export default function OfferList() {
  const [data, setData] = useState<OffersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchOffers()
  }, [page, statusFilter])

  const fetchOffers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', page.toString())
      params.append('limit', '10')

      const response = await fetch(`/api/placement/offers?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchOffers()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Package Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lowest Package</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data?.packageStats.min.toFixed(1)} LPA
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <IndianRupee className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Package</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data?.packageStats.avg.toFixed(1)} LPA
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Package</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {data?.packageStats.max.toFixed(1)} LPA
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <IndianRupee className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Placement Offers
              </CardTitle>
              <CardDescription>Track all placement offers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by student name or enrollment..."
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
                <SelectItem value="all">All Offers</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
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
              {Object.entries(data.statusCounts).map(([status, count]) => {
                const config = statusConfig[status]
                return (
                  <Badge 
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    className={cn("cursor-pointer", statusFilter !== status && config?.color)}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </Badge>
                )
              })}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">Company / Drive</TableHead>
                      <TableHead className="text-center">Package</TableHead>
                      <TableHead className="hidden lg:table-cell">Designation</TableHead>
                      <TableHead className="hidden sm:table-cell">Offer Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.offers && data.offers.length > 0 ? (
                      data.offers.map((offer) => {
                        const config = statusConfig[offer.status] || statusConfig.pending
                        const StatusIcon = config.icon
                        return (
                          <TableRow key={offer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                    {offer.student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{offer.student.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {offer.student.enrollmentNo} • {offer.student.department.name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                  {offer.company.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{offer.company.name}</p>
                                  <p className="text-xs text-muted-foreground">{offer.drive.title}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <p className="font-semibold text-emerald-600">
                                {offer.package.toFixed(1)} LPA
                              </p>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div>
                                <p className="text-sm">{offer.designation || '-'}</p>
                                {offer.location && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {offer.location}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(offer.offerDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={config.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {offer.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No offers found</p>
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
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} offers
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
    </div>
  )
}

// Helper function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
