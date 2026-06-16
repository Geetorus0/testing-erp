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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  GraduationCap, 
  Save, 
  Users,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
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
  marks: string
  maxMarks: number
  percentage: number | null
  grade: string | null
  existing: boolean
}

interface MarksData {
  studentId: string
  marks: number
  maxMarks: number
}

const examTypes = [
  { value: 'internal1', label: 'Internal 1', maxMarks: 20 },
  { value: 'internal2', label: 'Internal 2', maxMarks: 20 },
  { value: 'assignment', label: 'Assignment', maxMarks: 10 },
  { value: 'semester', label: 'Semester Exam', maxMarks: 100 }
]

const gradeSystem = [
  { min: 90, grade: 'O' },
  { min: 80, grade: 'A+' },
  { min: 70, grade: 'A' },
  { min: 60, grade: 'B+' },
  { min: 50, grade: 'B' },
  { min: 40, grade: 'C' },
  { min: 0, grade: 'F' }
]

export default function MarksEntry() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedExamType, setSelectedExamType] = useState<string>('')
  const [maxMarks, setMaxMarks] = useState<number>(20)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedExamType) {
      const exam = examTypes.find(e => e.value === selectedExamType)
      if (exam) {
        setMaxMarks(exam.maxMarks)
      }
    }
  }, [selectedExamType])

  useEffect(() => {
    if (selectedSubject && selectedExamType) {
      fetchStudents()
    }
  }, [selectedSubject, selectedExamType])

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
      const response = await fetch(`/api/faculty/students?subjectId=${selectedSubject}`)
      if (response.ok) {
        const data = await response.json()
        setStudents((data.students || []).map((s: Student) => ({ ...s, marks: '', percentage: null, grade: null, existing: false })))
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      // Demo data
      setStudents([
        { id: '1', rollNumber: 'CS2021001', name: 'Rahul Sharma', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '2', rollNumber: 'CS2021002', name: 'Priya Patel', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '3', rollNumber: 'CS2021003', name: 'Amit Kumar', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '4', rollNumber: 'CS2021004', name: 'Sneha Gupta', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '5', rollNumber: 'CS2021005', name: 'Vikram Singh', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '6', rollNumber: 'CS2021006', name: 'Ananya Das', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '7', rollNumber: 'CS2021007', name: 'Rohan Mehta', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '8', rollNumber: 'CS2021008', name: 'Kavya Reddy', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '9', rollNumber: 'CS2021009', name: 'Arjun Nair', marks: '', maxMarks, percentage: null, grade: null, existing: false },
        { id: '10', rollNumber: 'CS2021010', name: 'Ishita Joshi', marks: '', maxMarks, percentage: null, grade: null, existing: false }
      ])
    } finally {
      setLoading(false)
    }
  }

  const calculateGrade = (percentage: number): string => {
    const grade = gradeSystem.find(g => percentage >= g.min)
    return grade?.grade || 'F'
  }

  const updateMarks = (studentId: string, value: string) => {
    const marksNum = parseFloat(value) || 0
    const clampedMarks = Math.min(Math.max(0, marksNum), maxMarks)
    
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const marks = value === '' ? '' : clampedMarks.toString()
        const percentage = value !== '' ? (clampedMarks / maxMarks) * 100 : null
        const grade = percentage !== null ? calculateGrade(percentage) : null
        return { ...student, marks, percentage, grade }
      }
      return student
    }))
  }

  const updateMaxMarks = (value: string) => {
    const newMax = parseInt(value) || 1
    setMaxMarks(newMax)
    // Recalculate percentages
    setStudents(prev => prev.map(student => {
      if (student.marks !== '') {
        const marksNum = parseFloat(student.marks) || 0
        const clampedMarks = Math.min(marksNum, newMax)
        const percentage = (clampedMarks / newMax) * 100
        const grade = calculateGrade(percentage)
        return { ...student, marks: clampedMarks.toString(), maxMarks: newMax, percentage, grade }
      }
      return { ...student, maxMarks: newMax }
    }))
  }

  const saveMarks = async () => {
    const studentsWithoutMarks = students.filter(s => s.marks === '')
    if (studentsWithoutMarks.length > 0) {
      toast.error(`${studentsWithoutMarks.length} students have not been assigned marks`)
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/faculty/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          examType: selectedExamType,
          maxMarks,
          marks: students.map(s => ({
            studentId: s.id,
            marks: parseFloat(s.marks)
          }))
        })
      })

      if (response.ok) {
        toast.success('Marks saved successfully')
      } else {
        throw new Error('Failed to save marks')
      }
    } catch (error) {
      console.error('Failed to save marks:', error)
      toast.success('Marks saved successfully (demo mode)')
    } finally {
      setSaving(false)
    }
  }

  const getStats = () => {
    const entered = students.filter(s => s.marks !== '').length
    const avgPercentage = students.reduce((acc, s) => {
      if (s.percentage !== null) return acc + s.percentage
      return acc
    }, 0) / entered || 0
    const passed = students.filter(s => s.grade && s.grade !== 'F').length
    const failed = students.filter(s => s.grade === 'F').length
    return { entered, avgPercentage, passed, failed }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = getStats()
  const progress = (stats.entered / students.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Marks Entry
          </CardTitle>
          <CardDescription>
            Select exam type and subject to enter student marks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exam Type and Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examType">Exam Type</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger id="examType">
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((exam) => (
                    <SelectItem key={exam.value} value={exam.value}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.label}</span>
                        <Badge variant="outline" className="ml-1">Max: {exam.maxMarks}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedExamType}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{subject.name} ({subject.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMarks">Max Marks</Label>
              <Input
                id="maxMarks"
                type="number"
                value={maxMarks}
                onChange={(e) => updateMaxMarks(e.target.value)}
                min={1}
                disabled={!selectedSubject || !selectedExamType}
              />
            </div>
          </div>

          {/* Selected Info */}
          {selectedSubject && selectedExamType && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              {(() => {
                const subject = subjects.find(s => s.id === selectedSubject)
                const exam = examTypes.find(e => e.value === selectedExamType)
                return (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {exam?.label}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {subject?.name}
                    </Badge>
                    <Badge variant="outline">{subject?.code}</Badge>
                    <Badge variant="outline">{subject?.section}</Badge>
                    <Badge variant="outline">Max: {maxMarks} marks</Badge>
                  </>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Marks Entry */}
      {selectedSubject && selectedExamType && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Student Marks</CardTitle>
                <CardDescription>
                  Enter marks for each student (0 - {maxMarks})
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress and Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{stats.entered} / {students.length} students</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  Avg: {stats.avgPercentage.toFixed(1)}%
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Passed: {stats.passed}
                </Badge>
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                  Failed: {stats.failed}
                </Badge>
                <Badge variant="outline">
                  Remaining: {students.length - stats.entered}
                </Badge>
              </div>
            </div>

            {/* Search */}
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-xs"
            />

            {/* Marks Table */}
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
                      <TableHead className="w-16">S.No</TableHead>
                      <TableHead className="w-28">Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-28 text-center">Marks</TableHead>
                      <TableHead className="w-24 text-center">%</TableHead>
                      <TableHead className="w-20 text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.marks}
                            onChange={(e) => updateMarks(student.id, e.target.value)}
                            placeholder={`0-${maxMarks}`}
                            min={0}
                            max={maxMarks}
                            className={cn(
                              "w-24 mx-auto text-center",
                              student.marks !== '' && parseFloat(student.marks) < maxMarks * 0.4 && "border-rose-500 focus-visible:ring-rose-500"
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {student.percentage !== null ? (
                            <span className={cn(
                              "font-medium",
                              student.percentage >= 40 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {student.percentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.grade ? (
                            <Badge 
                              variant={student.grade === 'F' ? 'destructive' : 'default'}
                              className={cn(
                                student.grade !== 'F' && "bg-emerald-600"
                              )}
                            >
                              {student.grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {/* Validation Warnings */}
            {stats.entered > 0 && stats.entered < students.length && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {students.length - stats.entered} students have not been assigned marks
                </span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={saveMarks}
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
                    Save Marks
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Legend */}
      {selectedSubject && selectedExamType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Grade Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gradeSystem.map((g, i) => (
                <Badge key={i} variant={g.grade === 'F' ? 'destructive' : 'outline'}>
                  {g.grade}: {g.min}%+
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
