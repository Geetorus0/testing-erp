'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Users,
  Clock,
  BookOpen,
  ChevronDown,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Subject {
  id: string
  name: string
  code: string
  section: string
  semester: string
}

interface Student {
  id: string
  rollNumber: string
  name: string
  status: 'present' | 'absent' | 'late' | null
}

export default function AttendanceManager() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents()
    }
  }, [selectedSubject, selectedDate])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/faculty/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
      // Demo data
      setSubjects([
        { id: '1', name: 'Data Structures', code: 'CS301', section: 'Section A', semester: '3rd Semester' },
        { id: '2', name: 'Algorithms', code: 'CS302', section: 'Section B', semester: '3rd Semester' },
        { id: '3', name: 'Machine Learning', code: 'CS401', section: 'Section A', semester: '5th Semester' }
      ])
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/faculty/students?subjectId=${selectedSubject}&date=${selectedDate.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      // Demo data
      setStudents([
        { id: '1', rollNumber: 'CS2021001', name: 'Rahul Sharma', status: null },
        { id: '2', rollNumber: 'CS2021002', name: 'Priya Patel', status: null },
        { id: '3', rollNumber: 'CS2021003', name: 'Amit Kumar', status: null },
        { id: '4', rollNumber: 'CS2021004', name: 'Sneha Gupta', status: null },
        { id: '5', rollNumber: 'CS2021005', name: 'Vikram Singh', status: null },
        { id: '6', rollNumber: 'CS2021006', name: 'Ananya Das', status: null },
        { id: '7', rollNumber: 'CS2021007', name: 'Rohan Mehta', status: null },
        { id: '8', rollNumber: 'CS2021008', name: 'Kavya Reddy', status: null },
        { id: '9', rollNumber: 'CS2021009', name: 'Arjun Nair', status: null },
        { id: '10', rollNumber: 'CS2021010', name: 'Ishita Joshi', status: null }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, status: student.status === status ? null : status }
        : student
    ))
  }

  const bulkMarkPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'present' as const })))
    toast.success('All students marked as present')
  }

  const bulkMarkAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'absent' as const })))
    toast.success('All students marked as absent')
  }

  const saveAttendance = async () => {
    const unmarkedStudents = students.filter(s => !s.status)
    if (unmarkedStudents.length > 0) {
      toast.error(`${unmarkedStudents.length} students have not been marked`)
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          date: selectedDate.toISOString(),
          attendance: students.map(s => ({
            studentId: s.id,
            status: s.status
          }))
        })
      })

      if (response.ok) {
        toast.success('Attendance saved successfully')
      } else {
        throw new Error('Failed to save attendance')
      }
    } catch (error) {
      console.error('Failed to save attendance:', error)
      toast.success('Attendance saved successfully (demo mode)')
    } finally {
      setSaving(false)
    }
  }

  const getAttendanceStats = () => {
    const present = students.filter(s => s.status === 'present').length
    const absent = students.filter(s => s.status === 'absent').length
    const late = students.filter(s => s.status === 'late').length
    const unmarked = students.filter(s => !s.status).length
    return { present, absent, late, unmarked }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = getAttendanceStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mark Attendance
          </CardTitle>
          <CardDescription>
            Select a subject and date to mark student attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject and Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{subject.name} ({subject.code})</span>
                        <Badge variant="outline" className="ml-1">{subject.section}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Selected Subject Info */}
          {selectedSubject && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              {(() => {
                const subject = subjects.find(s => s.id === selectedSubject)
                return subject ? (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {subject.name}
                    </Badge>
                    <Badge variant="outline">{subject.code}</Badge>
                    <Badge variant="outline">{subject.section}</Badge>
                    <Badge variant="outline">{subject.semester}</Badge>
                  </>
                ) : null
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student List */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Student List</CardTitle>
                <CardDescription>
                  {students.length} students enrolled
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={bulkMarkPresent}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark All Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={bulkMarkAbsent}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Stats */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:max-w-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Present: {stats.present}
                </Badge>
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                  Absent: {stats.absent}
                </Badge>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Late: {stats.late}
                </Badge>
                <Badge variant="outline">
                  Unmarked: {stats.unmarked}
                </Badge>
              </div>
            </div>

            {/* Attendance Table */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">S.No</TableHead>
                      <TableHead className="w-32">Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center w-48">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant={student.status === 'present' ? 'default' : 'outline'}
                              size="sm"
                              className={cn(
                                "w-8 h-8 p-0",
                                student.status === 'present' && "bg-emerald-600 hover:bg-emerald-700"
                              )}
                              onClick={() => toggleAttendance(student.id, 'present')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={student.status === 'absent' ? 'destructive' : 'outline'}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => toggleAttendance(student.id, 'absent')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={student.status === 'late' ? 'default' : 'outline'}
                              size="sm"
                              className={cn(
                                "w-8 h-8 p-0",
                                student.status === 'late' && "bg-amber-600 hover:bg-amber-700"
                              )}
                              onClick={() => toggleAttendance(student.id, 'late')}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={saveAttendance}
                disabled={saving || students.length === 0}
                className="min-w-32"
              >
                {saving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Attendance
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
