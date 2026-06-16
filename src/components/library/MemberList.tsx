'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Member {
  id: string
  name: string
  rollNumber: string
  email: string
  department: string
  course: string
  currentSemester: number
  booksIssued: number
  maxBooksAllowed: number
  overdueCount: number
  totalFine: number
  canIssue: boolean
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const response = await fetch(`/api/library/members?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setMembers(result.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Library Members
            </CardTitle>
            <CardDescription>Student members with their library status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll number, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Members Table */}
        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden md:table-cell">Course</TableHead>
                  <TableHead className="text-center">Books Issued</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Overdue</TableHead>
                  <TableHead className="text-center">Fine Due</TableHead>
                  <TableHead className="text-center">Eligibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.rollNumber}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{member.department}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <p className="text-sm">{member.course}</p>
                        <p className="text-xs text-muted-foreground">Sem {member.currentSemester}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{member.booksIssued}/{member.maxBooksAllowed}</span>
                        <Progress 
                          value={(member.booksIssued / member.maxBooksAllowed) * 100} 
                          className="h-1.5 w-16 mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      {member.overdueCount > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {member.overdueCount}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {member.totalFine > 0 ? (
                        <span className="text-red-600 font-medium">₹{member.totalFine}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {member.canIssue ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 gap-1">
                          <XCircle className="h-3 w-3" />
                          Max Books
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No members found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
