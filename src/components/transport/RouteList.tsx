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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Route, MapPin, Bus, IndianRupee } from 'lucide-react'
import { toast } from 'sonner'

interface Bus {
  id: string
  busNumber: string
  capacity: number
  status: string
}

interface RouteData {
  id: string
  routeNumber: string
  routeName: string
  startPoint: string
  endPoint: string
  stops: string | null
  distance: number | null
  fare: number | null
  busId: string
  bus?: Bus
  createdAt: string
}

interface RouteFormData {
  routeNumber: string
  routeName: string
  startPoint: string
  endPoint: string
  stops: string
  distance: number
  fare: number
  busId: string
}

const initialFormData: RouteFormData = {
  routeNumber: '',
  routeName: '',
  startPoint: '',
  endPoint: '',
  stops: '',
  distance: 0,
  fare: 0,
  busId: ''
}

export default function RouteList() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null)
  const [formData, setFormData] = useState<RouteFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRoutes()
    fetchBuses()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/transport/routes')
      if (response.ok) {
        const result = await response.json()
        setRoutes(result.routes || [])
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast.error('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  const fetchBuses = async () => {
    try {
      const response = await fetch('/api/transport/buses')
      if (response.ok) {
        const result = await response.json()
        setBuses(result.buses || [])
      }
    } catch (error) {
      console.error('Error fetching buses:', error)
    }
  }

  const handleOpenDialog = (route?: RouteData) => {
    if (route) {
      setEditingRoute(route)
      setFormData({
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        stops: route.stops || '',
        distance: route.distance || 0,
        fare: route.fare || 0,
        busId: route.busId
      })
    } else {
      setEditingRoute(null)
      setFormData(initialFormData)
    }
    setDialogOpen(true)
  }

  const handleSaveRoute = async () => {
    if (!formData.routeNumber.trim()) {
      toast.error('Route number is required')
      return
    }
    if (!formData.routeName.trim()) {
      toast.error('Route name is required')
      return
    }
    if (!formData.busId) {
      toast.error('Please select a bus')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/transport/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingRoute?.id
        })
      })

      if (response.ok) {
        toast.success(editingRoute ? 'Route updated successfully' : 'Route added successfully')
        setDialogOpen(false)
        fetchRoutes()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save route')
      }
    } catch {
      toast.error('Failed to save route')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return

    try {
      const response = await fetch(`/api/transport/routes?id=${routeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Route deleted successfully')
        fetchRoutes()
      } else {
        toast.error('Failed to delete route')
      }
    } catch {
      toast.error('Failed to delete route')
    }
  }

  const filteredRoutes = routes.filter(route =>
    route.routeNumber.toLowerCase().includes(search.toLowerCase()) ||
    route.routeName.toLowerCase().includes(search.toLowerCase()) ||
    route.startPoint.toLowerCase().includes(search.toLowerCase()) ||
    route.endPoint.toLowerCase().includes(search.toLowerCase())
  )

  const parseStops = (stopsJson: string | null): string[] => {
    if (!stopsJson) return []
    try {
      const parsed = JSON.parse(stopsJson)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Management
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
            <Route className="h-5 w-5" />
            Route Management
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route No.</TableHead>
                <TableHead>Route Name</TableHead>
                <TableHead>Start - End</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Assigned Bus</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No routes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoutes.map((route) => {
                  const stops = parseStops(route.stops)
                  return (
                    <TableRow key={route.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {route.routeNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{route.routeName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-emerald-500" />
                          <span>{route.startPoint}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span>{route.endPoint}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {stops.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {stops.length} stops
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No stops</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {route.fare ? (
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            <span>{route.fare.toLocaleString()}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {route.bus ? (
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{route.bus.busNumber}</span>
                            {route.bus.status !== 'active' && (
                              <Badge variant="secondary" className="text-xs">
                                {route.bus.status}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(route)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteRoute(route.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredRoutes.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredRoutes.length} of {routes.length} routes
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
            <DialogDescription>
              {editingRoute ? 'Update route information' : 'Enter details for the new route'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="routeNumber">Route Number *</Label>
                <Input
                  id="routeNumber"
                  value={formData.routeNumber}
                  onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                  placeholder="e.g., R-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeName">Route Name *</Label>
                <Input
                  id="routeName"
                  value={formData.routeName}
                  onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                  placeholder="e.g., City Center Route"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPoint">Start Point *</Label>
                <Input
                  id="startPoint"
                  value={formData.startPoint}
                  onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                  placeholder="e.g., College Gate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endPoint">End Point *</Label>
                <Input
                  id="endPoint"
                  value={formData.endPoint}
                  onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                  placeholder="e.g., City Bus Stand"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stops">Stops (comma-separated)</Label>
              <Input
                id="stops"
                value={formData.stops}
                onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                placeholder="e.g., Stop 1, Stop 2, Stop 3"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fare">Fare (₹)</Label>
                <Input
                  id="fare"
                  type="number"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: parseFloat(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="busId">Assign Bus *</Label>
                <Select
                  value={formData.busId}
                  onValueChange={(value) => setFormData({ ...formData, busId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.filter(b => b.status === 'active').map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.busNumber} ({bus.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoute} disabled={saving}>
              {saving ? 'Saving...' : (editingRoute ? 'Update' : 'Add Route')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
