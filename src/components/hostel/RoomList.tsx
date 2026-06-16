'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  DoorOpen,
  Grid3X3,
  List,
  Users,
  BedDouble,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  UserMinus,
  Settings,
  Eye
} from 'lucide-react'

// Types
interface Hostel {
  id: string
  name: string
  type: string
  totalRooms: number
}

interface Room {
  id: string
  roomNumber: string
  floor: number | null
  capacity: number
  occupied: number
  type: string
  status: string
  rent: number | null
  hostelId: string
  hostel: Hostel
  allocations: Allocation[]
}

interface Allocation {
  id: string
  bedNumber: number | null
  status: string
  student: {
    id: string
    name: string
    rollNumber: string
  }
}

interface Student {
  id: string
  name: string
  rollNumber: string
  department: {
    name: string
  }
}

const roomTypeColors: Record<string, string> = {
  single: 'bg-purple-100 text-purple-800 border-purple-200',
  double: 'bg-blue-100 text-blue-800 border-blue-200',
  triple: 'bg-teal-100 text-teal-800 border-teal-200',
  dormitory: 'bg-amber-100 text-amber-800 border-amber-200'
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  full: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-amber-100 text-amber-800 border-amber-200'
}

export default function RoomList() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [hostelFilter, setHostelFilter] = useState<string>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Dialogs
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)
  const [vacateDialogOpen, setVacateDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [bedNumber, setBedNumber] = useState<string>('')
  const [searchStudentQuery, setSearchStudentQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRooms()
    fetchHostels()
  }, [hostelFilter, floorFilter, statusFilter])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (hostelFilter !== 'all') params.append('hostelId', hostelFilter)
      if (floorFilter !== 'all') params.append('floor', floorFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/hostel/rooms?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.data)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
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

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setStudents([])
      return
    }
    try {
      const response = await fetch(`/api/hostel/allocations?search=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setStudents(data.data.students || [])
      }
    } catch (error) {
      console.error('Error searching students:', error)
    }
  }

  const handleAllocate = async () => {
    if (!selectedRoom || !selectedStudent) {
      toast({
        title: 'Error',
        description: 'Please select a student',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/hostel/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          studentId: selectedStudent,
          bedNumber: bedNumber ? parseInt(bedNumber) : null
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Room allocated successfully'
        })
        setAllocateDialogOpen(false)
        setSelectedStudent('')
        setBedNumber('')
        fetchRooms()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to allocate room',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to allocate room',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVacate = async () => {
    if (!selectedRoom) return

    try {
      setSubmitting(true)
      const response = await fetch('/api/hostel/allocations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          action: 'vacate'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Room vacated successfully'
        })
        setVacateDialogOpen(false)
        fetchRooms()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to vacate room',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vacate room',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const floors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0))

  const getAvailableBeds = (room: Room) => room.capacity - room.occupied

  const renderRoomCard = (room: Room) => (
    <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
          </div>
          <Badge variant="outline" className={statusColors[room.status]}>
            {room.status}
          </Badge>
        </div>
        <CardDescription>{room.hostel.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>{room.occupied}/{room.capacity} beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{room.type}</span>
          </div>
          {room.floor && (
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <span>Floor {room.floor}</span>
            </div>
          )}
          {room.rent && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>₹{room.rent.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {/* Occupancy Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Occupancy</span>
            <span>{Math.round((room.occupied / room.capacity) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all" 
              style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setSelectedRoom(room)
              setDetailsDialogOpen(true)
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          {room.status !== 'maintenance' && getAvailableBeds(room) > 0 && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setSelectedRoom(room)
                setAllocateDialogOpen(true)
              }}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Allocate
            </Button>
          )}
          {room.occupied > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedRoom(room)
                setVacateDialogOpen(true)
              }}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderRoomRow = (room: Room) => (
    <div
      key={room.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-muted rounded-lg">
          <DoorOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">Room {room.roomNumber}</p>
          <p className="text-sm text-muted-foreground">{room.hostel.name}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-sm font-medium">{room.occupied}/{room.capacity}</p>
          <p className="text-xs text-muted-foreground">Beds</p>
        </div>
        <Badge variant="outline" className={roomTypeColors[room.type]}>
          {room.type}
        </Badge>
        <Badge variant="outline" className={statusColors[room.status]}>
          {room.status}
        </Badge>
        {room.rent && (
          <p className="text-sm font-medium">₹{room.rent.toLocaleString()}</p>
        )}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRoom(room)
              setDetailsDialogOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {room.status !== 'maintenance' && getAvailableBeds(room) > 0 && (
            <Button
              variant="default"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setSelectedRoom(room)
                setAllocateDialogOpen(true)
              }}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
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

        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map((floor) => (
              <SelectItem key={floor} value={String(floor)}>
                Floor {floor}
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Room Display */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No rooms found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map(renderRoomCard)}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRooms.map(renderRoomRow)}
        </div>
      )}

      {/* Allocate Dialog */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Room</DialogTitle>
            <DialogDescription>
              Assign a student to Room {selectedRoom?.roomNumber} in {selectedRoom?.hostel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchStudentQuery}
                  onChange={(e) => {
                    setSearchStudentQuery(e.target.value)
                    searchStudents(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>
              {students.length > 0 && (
                <ScrollArea className="h-32 border rounded-md">
                  <div className="p-2 space-y-1">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        className={`w-full text-left p-2 rounded-md hover:bg-muted transition-colors ${
                          selectedStudent === student.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.rollNumber} • {student.department.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Bed Number (Optional)</Label>
              <Input
                type="number"
                placeholder="Enter bed number"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                min={1}
                max={selectedRoom?.capacity}
              />
            </div>

            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Beds</span>
                <span className="font-medium">{selectedRoom ? getAvailableBeds(selectedRoom) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Type</span>
                <span className="font-medium capitalize">{selectedRoom?.type}</span>
              </div>
              {selectedRoom?.rent && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-medium">₹{selectedRoom.rent.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAllocate} 
              disabled={submitting || !selectedStudent}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Allocating...' : 'Allocate Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Room {selectedRoom?.roomNumber}</DialogTitle>
            <DialogDescription>{selectedRoom?.hostel?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Floor</p>
                <p className="text-lg font-medium">{selectedRoom?.floor || 'N/A'}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-lg font-medium capitalize">{selectedRoom?.type}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-lg font-medium">{selectedRoom?.capacity} beds</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-lg font-medium">{selectedRoom?.occupied} beds</p>
              </div>
              {selectedRoom?.rent && (
                <div className="bg-muted rounded-lg p-3 col-span-2">
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="text-lg font-medium">₹{selectedRoom.rent.toLocaleString()}</p>
                </div>
              )}
            </div>

            {selectedRoom?.allocations && selectedRoom.allocations.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Current Occupants</p>
                <div className="space-y-2">
                  {selectedRoom.allocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{allocation.student.name}</p>
                        <p className="text-xs text-muted-foreground">{allocation.student.rollNumber}</p>
                      </div>
                      {allocation.bedNumber && (
                        <Badge variant="secondary">Bed {allocation.bedNumber}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Vacate Confirmation Dialog */}
      <AlertDialog open={vacateDialogOpen} onOpenChange={setVacateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vacate Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to vacate Room {selectedRoom?.roomNumber}? This will remove all current occupants from this room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVacate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? 'Processing...' : 'Vacate Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
