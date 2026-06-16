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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Bus, Phone, User } from 'lucide-react'
import { toast } from 'sonner'

interface Bus {
  id: string
  busNumber: string
  registrationNumber: string | null
  capacity: number
  driverName: string | null
  driverPhone: string | null
  status: string
  createdAt: string
}

interface BusFormData {
  busNumber: string
  registrationNumber: string
  capacity: number
  driverName: string
  driverPhone: string
  status: string
}

const initialFormData: BusFormData = {
  busNumber: '',
  registrationNumber: '',
  capacity: 40,
  driverName: '',
  driverPhone: '',
  status: 'active'
}

export default function BusList() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [formData, setFormData] = useState<BusFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const response = await fetch('/api/transport/buses')
      if (response.ok) {
        const result = await response.json()
        setBuses(result.buses || [])
      }
    } catch (error) {
      console.error('Error fetching buses:', error)
      toast.error('Failed to load buses')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (bus?: Bus) => {
    if (bus) {
      setEditingBus(bus)
      setFormData({
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber || '',
        capacity: bus.capacity,
        driverName: bus.driverName || '',
        driverPhone: bus.driverPhone || '',
        status: bus.status
      })
    } else {
      setEditingBus(null)
      setFormData(initialFormData)
    }
    setDialogOpen(true)
  }

  const handleSaveBus = async () => {
    if (!formData.busNumber.trim()) {
      toast.error('Bus number is required')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/transport/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingBus?.id
        })
      })

      if (response.ok) {
        toast.success(editingBus ? 'Bus updated successfully' : 'Bus added successfully')
        setDialogOpen(false)
        fetchBuses()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save bus')
      }
    } catch {
      toast.error('Failed to save bus')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBus = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return

    try {
      const response = await fetch(`/api/transport/buses?id=${busId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Bus deleted successfully')
        fetchBuses()
      } else {
        toast.error('Failed to delete bus')
      }
    } catch {
      toast.error('Failed to delete bus')
    }
  }

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.busNumber.toLowerCase().includes(search.toLowerCase()) ||
      (bus.registrationNumber?.toLowerCase().includes(search.toLowerCase())) ||
      (bus.driverName?.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Maintenance</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Bus Management
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
            <Bus className="h-5 w-5" />
            Bus Management
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Bus
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bus number, registration, or driver..."
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
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Number</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Bus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No buses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBuses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.busNumber}</TableCell>
                    <TableCell>{bus.registrationNumber || '-'}</TableCell>
                    <TableCell>{bus.capacity} seats</TableCell>
                    <TableCell>
                      {bus.driverName ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {bus.driverName}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {bus.driverPhone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {bus.driverPhone}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(bus.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(bus)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBus(bus.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
        {filteredBuses.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredBuses.length} of {buses.length} buses</span>
            <span>
              Active: {buses.filter(b => b.status === 'active').length} | 
              Maintenance: {buses.filter(b => b.status === 'maintenance').length}
            </span>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
            <DialogDescription>
              {editingBus ? 'Update bus information' : 'Enter details for the new bus'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busNumber">Bus Number *</Label>
                <Input
                  id="busNumber"
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  placeholder="e.g., TN-01-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g., TN01AB1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Seats)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Enter driver name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Driver Phone</Label>
              <Input
                id="driverPhone"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="Enter driver phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBus} disabled={saving}>
              {saving ? 'Saving...' : (editingBus ? 'Update' : 'Add Bus')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
