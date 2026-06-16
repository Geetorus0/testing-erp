'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Users,
  BookOpen,
  Target,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

export type EventCategory = 'attendance' | 'academic' | 'certification' | 'internship' | 'project' | 'placement'

export interface TimelineEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  date: string
  importance: 'low' | 'medium' | 'high'
  notes?: string[]
  metadata?: Record<string, string | number>
}

interface StudentTimelineProps {
  events: TimelineEvent[]
  onAddNote?: (eventId: string, note: string) => void
}

const categoryConfig: Record<EventCategory, { label: string; color: string; bgColor: string; icon: typeof CalendarIcon }> = {
  attendance: { 
    label: 'Attendance', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-500',
    icon: CheckCircle2 
  },
  academic: { 
    label: 'Academic', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-500',
    icon: GraduationCap 
  },
  certification: { 
    label: 'Certification', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-500',
    icon: Award 
  },
  internship: { 
    label: 'Internship', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-500',
    icon: Briefcase 
  },
  project: { 
    label: 'Project', 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-500',
    icon: FileText 
  },
  placement: { 
    label: 'Placement', 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-500',
    icon: Target 
  },
}

const importanceConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  high: { label: 'High', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

export default function StudentTimeline({ events, onAddNote }: StudentTimelineProps) {
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [newNote, setNewNote] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) {
        return false
      }
      // Date range filter
      if (dateRange?.from) {
        const eventDate = parseISO(event.date)
        const from = startOfDay(dateRange.from)
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
        if (!isWithinInterval(eventDate, { start: from, end: to })) {
          return false
        }
      }
      return true
    })
  }, [events, selectedCategories, dateRange])

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const toggleCategory = (category: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setDateRange(undefined)
  }

  const handleAddNote = () => {
    if (selectedEvent && newNote.trim() && onAddNote) {
      onAddNote(selectedEvent.id, newNote.trim())
      setNewNote('')
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Academic Timeline
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} events • Click event for details
            </CardDescription>
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(selectedCategories.length > 0 || dateRange) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {(selectedCategories.length > 0 ? 1 : 0) + (dateRange ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Event Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Object.keys(categoryConfig) as EventCategory[]).map((category) => {
                      const config = categoryConfig[category]
                      const isSelected = selectedCategories.includes(category)
                      return (
                        <Button
                          key={category}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'gap-1.5',
                            isSelected && config.bgColor
                          )}
                          onClick={() => toggleCategory(category)}
                        >
                          <config.icon className="h-3.5 w-3.5" />
                          {config.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateRange && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                              </>
                            ) : (
                              format(dateRange.from, 'MMM d, yyyy')
                            )
                          ) : (
                            'Select date range'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {(selectedCategories.length > 0 || dateRange) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6 pb-6">
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              
              {sortedEvents.map((event, index) => {
                const config = categoryConfig[event.category]
                const Icon = config.icon
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'relative pl-8 pb-8 cursor-pointer group',
                      index === sortedEvents.length - 1 && 'pb-0'
                    )}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      'absolute left-0 w-6 h-6 rounded-full flex items-center justify-center',
                      config.bgColor,
                      'ring-4 ring-background group-hover:ring-muted transition-all'
                    )}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    
                    {/* Event card */}
                    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(event.date), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn('text-xs', config.color)}>
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', importanceConfig[event.importance].color)}>
                            {importanceConfig[event.importance].label}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      {event.notes && event.notes.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {event.notes.length} note{event.notes.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = categoryConfig[selectedEvent.category]
                    const Icon = config.icon
                    return (
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    )
                  })()}
                  <div>
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                    <DialogDescription>
                      {format(parseISO(selectedEvent.date), 'MMMM d, yyyy • h:mm a')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.description}
                  </p>
                </div>
                {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Details</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  {selectedEvent.notes && selectedEvent.notes.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedEvent.notes.map((note, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm">{note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No notes yet</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Add Note</Label>
                  <Textarea
                    placeholder="Enter your note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!newNote.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
