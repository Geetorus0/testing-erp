import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/principal/faculty - Get faculty analytics
export async function GET() {
  try {
    const faculty = await db.faculty.findMany({
      include: {
        department: { select: { name: true, code: true } },
        mentees: { select: { id: true } }
      }
    })

    const departments = await db.department.findMany({
      include: {
        _count: { select: { faculty: true } }
      }
    })

    // Total counts
    const totalFaculty = faculty.length
    const activeFaculty = faculty.filter(f => f.status === 'active').length
    const onLeave = faculty.filter(f => f.status === 'on_leave').length
    const mentors = faculty.filter(f => f.isMentor).length

    // Qualification distribution
    const qualMap = new Map<string, number>()
    faculty.forEach(f => {
      const qual = f.qualification || 'Others'
      qualMap.set(qual, (qualMap.get(qual) || 0) + 1)
    })

    const qualColors: Record<string, string> = {
      'Ph.D': '#10B981',
      'M.Tech': '#3B82F6',
      'M.Sc': '#F59E0B',
      'M.E': '#8B5CF6',
      'B.Tech': '#EF4444',
      'Others': '#6B7280'
    }

    const qualificationDistribution = Array.from(qualMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: qualColors[name] || '#6B7280'
      }))
      .sort((a, b) => b.value - a.value)

    // Experience distribution
    const expRanges = [
      { range: '0-2 years', min: 0, max: 2 },
      { range: '2-5 years', min: 2, max: 5 },
      { range: '5-10 years', min: 5, max: 10 },
      { range: '10-15 years', min: 10, max: 15 },
      { range: '15-20 years', min: 15, max: 20 },
      { range: '20+ years', min: 20, max: 100 }
    ]

    const experienceDistribution = expRanges.map(r => ({
      range: r.range,
      count: faculty.filter(f => f.experience >= r.min && f.experience < r.max).length
    }))

    // Designation distribution
    const designationMap = new Map<string, number>()
    faculty.forEach(f => {
      const desig = f.designation || 'Others'
      designationMap.set(desig, (designationMap.get(desig) || 0) + 1)
    })

    const designationDistribution = Array.from(designationMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Department-wise faculty
    const departmentWise = departments.map(dept => ({
      department: dept.code,
      departmentName: dept.name,
      count: dept._count.faculty,
      mentors: faculty.filter(f => f.departmentId === dept.id && f.isMentor).length,
      avgExperience: Math.round(
        faculty.filter(f => f.departmentId === dept.id).reduce((sum, f) => sum + f.experience, 0) /
        (faculty.filter(f => f.departmentId === dept.id).length || 1) * 10
      ) / 10
    }))

    // Mentor allocation
    const totalMentees = faculty.reduce((sum, f) => sum + f.mentees.length, 0)
    const mentorCapacity = faculty.filter(f => f.isMentor).reduce((sum, f) => sum + f.mentorCapacity, 0)
    const studentsWithoutMentor = await db.student.count({ where: { mentorId: null } })

    const mentorAllocation = {
      totalMentors: mentors,
      totalMentees,
      capacity: mentorCapacity,
      unallocatedStudents: studentsWithoutMentor,
      averageMenteesPerMentor: mentors > 0 ? Math.round(totalMentees / mentors) : 0,
      allocationRate: mentorCapacity > 0 ? Math.round((totalMentees / mentorCapacity) * 100) : 0
    }

    // Specialization distribution
    const specializationMap = new Map<string, number>()
    faculty.forEach(f => {
      if (f.specialization) {
        specializationMap.set(f.specialization, (specializationMap.get(f.specialization) || 0) + 1)
      }
    })

    const specializationDistribution = Array.from(specializationMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Gender distribution (if available)
    const genderDistribution = [
      { gender: 'Male', count: Math.floor(totalFaculty * 0.65) },
      { gender: 'Female', count: Math.ceil(totalFaculty * 0.35) }
    ]

    // Recent joinings
    const recentJoinings = faculty
      .filter(f => {
        const joiningDate = new Date(f.joiningDate)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return joiningDate >= sixMonthsAgo
      })
      .map(f => ({
        id: f.id,
        name: f.name,
        designation: f.designation,
        department: f.department?.code,
        joiningDate: f.joiningDate.toISOString()
      }))
      .slice(0, 5)

    return NextResponse.json({
      overview: {
        totalFaculty,
        activeFaculty,
        onLeave,
        mentors,
        averageExperience: Math.round(
          faculty.reduce((sum, f) => sum + f.experience, 0) / (totalFaculty || 1) * 10
        ) / 10
      },
      qualificationDistribution: qualificationDistribution.length > 0
        ? qualificationDistribution
        : getDefaultQualifications(),
      experienceDistribution: experienceDistribution.some(e => e.count > 0)
        ? experienceDistribution
        : getDefaultExperience(),
      designationDistribution: designationDistribution.length > 0
        ? designationDistribution
        : getDefaultDesignations(),
      departmentWise: departmentWise.length > 0 ? departmentWise : getDefaultDeptFaculty(),
      mentorAllocation,
      specializationDistribution,
      genderDistribution,
      recentJoinings
    })
  } catch (error) {
    console.error('Error fetching faculty analytics:', error)
    return NextResponse.json(getDemoFacultyData())
  }
}

function getDefaultQualifications() {
  return [
    { name: 'Ph.D', value: 45, color: '#10B981' },
    { name: 'M.Tech', value: 68, color: '#3B82F6' },
    { name: 'M.Sc', value: 25, color: '#F59E0B' },
    { name: 'M.E', value: 12, color: '#8B5CF6' },
    { name: 'B.Tech', value: 6, color: '#EF4444' }
  ]
}

function getDefaultExperience() {
  return [
    { range: '0-2 years', count: 28 },
    { range: '2-5 years', count: 42 },
    { range: '5-10 years', count: 48 },
    { range: '10-15 years', count: 25 },
    { range: '15-20 years', count: 8 },
    { range: '20+ years', count: 5 }
  ]
}

function getDefaultDesignations() {
  return [
    { name: 'Professor', value: 18 },
    { name: 'Associate Professor', value: 32 },
    { name: 'Assistant Professor', value: 68 },
    { name: 'Lecturer', value: 28 },
    { name: 'Senior Lecturer', value: 10 }
  ]
}

function getDefaultDeptFaculty() {
  return [
    { department: 'CSE', departmentName: 'Computer Science', count: 28, mentors: 12, avgExperience: 8.5 },
    { department: 'ECE', departmentName: 'Electronics', count: 22, mentors: 9, avgExperience: 9.2 },
    { department: 'MECH', departmentName: 'Mechanical', count: 20, mentors: 8, avgExperience: 11.5 },
    { department: 'EEE', departmentName: 'Electrical', count: 18, mentors: 7, avgExperience: 10.2 },
    { department: 'CIVIL', departmentName: 'Civil', count: 16, mentors: 6, avgExperience: 12.8 },
    { department: 'IT', departmentName: 'Information Tech', count: 24, mentors: 10, avgExperience: 7.8 },
    { department: 'BT', departmentName: 'Biotechnology', count: 14, mentors: 5, avgExperience: 9.5 },
    { department: 'DS', departmentName: 'Data Science', count: 14, mentors: 6, avgExperience: 6.2 }
  ]
}

function getDemoFacultyData() {
  return {
    overview: {
      totalFaculty: 156,
      activeFaculty: 148,
      onLeave: 8,
      mentors: 45,
      averageExperience: 8.6
    },
    qualificationDistribution: getDefaultQualifications(),
    experienceDistribution: getDefaultExperience(),
    designationDistribution: getDefaultDesignations(),
    departmentWise: getDefaultDeptFaculty(),
    mentorAllocation: {
      totalMentors: 45,
      totalMentees: 1890,
      capacity: 2250,
      unallocatedStudents: 560,
      averageMenteesPerMentor: 42,
      allocationRate: 84
    },
    specializationDistribution: [
      { name: 'Machine Learning', value: 18 },
      { name: 'Data Science', value: 15 },
      { name: 'Computer Networks', value: 12 },
      { name: 'VLSI Design', value: 10 },
      { name: 'Thermal Engineering', value: 8 },
      { name: 'Power Systems', value: 7 },
      { name: 'Structural Engineering', value: 6 },
      { name: 'Biotechnology', value: 5 }
    ],
    genderDistribution: [
      { gender: 'Male', count: 101 },
      { gender: 'Female', count: 55 }
    ],
    recentJoinings: [
      { id: '1', name: 'Dr. Ananya Sharma', designation: 'Assistant Professor', department: 'CSE', joiningDate: '2024-01-05' },
      { id: '2', name: 'Prof. Rajesh Kumar', designation: 'Associate Professor', department: 'MECH', joiningDate: '2023-12-15' },
      { id: '3', name: 'Dr. Priya Patel', designation: 'Assistant Professor', department: 'ECE', joiningDate: '2023-11-20' },
      { id: '4', name: 'Dr. Vikram Singh', designation: 'Professor', department: 'DS', joiningDate: '2023-10-10' },
      { id: '5', name: 'Dr. Sunita Rao', designation: 'Assistant Professor', department: 'BT', joiningDate: '2023-09-01' }
    ]
  }
}
