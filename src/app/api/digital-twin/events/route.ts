import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/digital-twin/events - Get timeline events for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || '1'
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Try to fetch from database
    // For demo, we'll return mock data
    const events = getMockEvents(studentId, category, startDate, endDate)

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching timeline events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

function getMockEvents(
  studentId: string,
  category?: string | null,
  startDate?: string | null,
  endDate?: string | null
) {
  const allEvents = [
    {
      id: '1',
      title: 'Semester 6 Mid-Term Exams',
      description: 'Completed mid-term examinations for all subjects with good performance in Data Structures and Algorithms.',
      category: 'academic',
      date: '2024-03-15T10:00:00',
      importance: 'high',
      notes: ['Prepared well for DSA exam', 'Need to improve in DBMS'],
      metadata: { 'Average Score': '78%', 'Rank': '15/60' },
      studentId,
    },
    {
      id: '2',
      title: 'AWS Cloud Practitioner Certification',
      description: 'Successfully completed AWS Cloud Practitioner certification with 92% score.',
      category: 'certification',
      date: '2024-03-01T14:30:00',
      importance: 'high',
      notes: ['Completed in first attempt'],
      metadata: { 'Score': '92%', 'Validity': '3 years' },
      studentId,
    },
    {
      id: '3',
      title: 'Google Summer Internship Selection',
      description: 'Selected for Google Summer Internship program after 3 rounds of technical interviews.',
      category: 'internship',
      date: '2024-02-20T11:00:00',
      importance: 'high',
      metadata: { 'Stipend': '₹80,000/month', 'Duration': '3 months' },
      studentId,
    },
    {
      id: '4',
      title: 'Attendance Warning',
      description: 'Received warning for low attendance in Operating Systems course. Current attendance at 62%.',
      category: 'attendance',
      date: '2024-02-15T09:00:00',
      importance: 'medium',
      notes: ['Need to attend all remaining classes'],
      studentId,
    },
    {
      id: '5',
      title: 'Hackathon Participation',
      description: 'Participated in Smart India Hackathon and reached regional finals with AI-based solution.',
      category: 'project',
      date: '2024-02-10T08:00:00',
      importance: 'medium',
      metadata: { 'Team Size': '4', 'Project': 'AI Waste Segregation' },
      studentId,
    },
    {
      id: '6',
      title: 'Placement Drive - TCS',
      description: 'Cleared aptitude round in TCS placement drive. Waiting for technical interview results.',
      category: 'placement',
      date: '2024-01-25T10:00:00',
      importance: 'high',
      metadata: { 'Package': '₹7 LPA', 'Role': 'Software Engineer' },
      studentId,
    },
    {
      id: '7',
      title: 'Research Paper Published',
      description: 'Published research paper on Machine Learning applications in IEEE conference.',
      category: 'academic',
      date: '2024-01-15T00:00:00',
      importance: 'high',
      notes: ['Co-authored with Dr. Smith'],
      metadata: { 'Conference': 'IEEE ICML 2024', 'Citations': '3' },
      studentId,
    },
    {
      id: '8',
      title: 'Perfect Attendance Month',
      description: 'Achieved 100% attendance for the month of December 2023.',
      category: 'attendance',
      date: '2024-01-01T00:00:00',
      importance: 'low',
      studentId,
    },
    {
      id: '9',
      title: 'Techfest Project Winner',
      description: 'Won first prize in college techfest for innovative IoT project.',
      category: 'project',
      date: '2023-12-20T16:00:00',
      importance: 'medium',
      metadata: { 'Prize': '₹25,000', 'Team': 'CodeCrafters' },
      studentId,
    },
    {
      id: '10',
      title: 'Python Advanced Certification',
      description: 'Completed advanced Python programming certification from Coursera.',
      category: 'certification',
      date: '2023-11-30T12:00:00',
      importance: 'medium',
      metadata: { 'Platform': 'Coursera', 'Grade': '95%' },
      studentId,
    },
    {
      id: '11',
      title: 'Microsoft Internship Offer',
      description: 'Received internship offer from Microsoft for summer program.',
      category: 'internship',
      date: '2023-10-15T15:00:00',
      importance: 'high',
      metadata: { 'Role': 'SDE Intern', 'Duration': '2 months' },
      studentId,
    },
    {
      id: '12',
      title: 'Semester 5 Results',
      description: 'Semester 5 results declared with 8.2 SGPA.',
      category: 'academic',
      date: '2023-09-20T12:00:00',
      importance: 'high',
      metadata: { 'SGPA': '8.2', 'Backlogs': '0' },
      studentId,
    },
  ]

  let filteredEvents = allEvents

  // Filter by category
  if (category) {
    filteredEvents = filteredEvents.filter((e) => e.category === category)
  }

  // Filter by date range
  if (startDate) {
    const start = new Date(startDate)
    filteredEvents = filteredEvents.filter((e) => new Date(e.date) >= start)
  }
  if (endDate) {
    const end = new Date(endDate)
    filteredEvents = filteredEvents.filter((e) => new Date(e.date) <= end)
  }

  // Adjust data based on student for demo
  if (studentId === '2') {
    // High performer - more achievements
    return filteredEvents.map((e) => ({
      ...e,
      importance: e.importance === 'low' ? 'medium' : e.importance,
    }))
  } else if (studentId === '3') {
    // Needs attention - add more attendance events
    return [
      ...filteredEvents,
      {
        id: '13',
        title: 'Attendance Warning - Final',
        description: 'Final warning for attendance below 70%.',
        category: 'attendance',
        date: '2024-03-10T09:00:00',
        importance: 'high',
        notes: ['Parents notified'],
        studentId,
      },
      {
        id: '14',
        title: 'Academic Probation',
        description: 'Placed on academic probation due to low CGPA.',
        category: 'academic',
        date: '2024-02-28T10:00:00',
        importance: 'high',
        metadata: { 'Reason': 'CGPA below 7.5' },
        studentId,
      },
    ]
  }

  return filteredEvents
}
