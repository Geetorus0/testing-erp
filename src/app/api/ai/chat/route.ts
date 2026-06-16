import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

// Initialize ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// Build context-aware system prompt
async function buildSystemPrompt(userId: string, tenantId: string): Promise<string> {
  const user = await getCurrentUser()

  // Fetch user's context based on role
  let userContext = ''
  let academicContext = ''

  if (user) {
    // Base user info
    userContext = `
Current User Information:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role}
- Tenant: ${user.tenant?.name || 'Geetorus Campus'}
`

    // Role-specific context
    if (user.role === 'STUDENT') {
      const student = await db.student.findFirst({
        where: { userId },
        include: {
          course: true,
          section: true,
          semester: true,
          department: true
        }
      })

      if (student) {
        userContext += `
Student Details:
- Roll Number: ${student.rollNumber}
- Course: ${student.course?.name || 'N/A'}
- Section: ${student.section?.name || 'N/A'}
- Semester: ${student.semester?.name || 'N/A'}
- Department: ${student.department?.name || 'N/A'}
`

        // Get attendance summary
        const attendanceRecords = await db.attendance.findMany({
          where: { studentId: student.id }
        })

        const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length
        const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length
        const totalClasses = attendanceRecords.length
        const attendancePercentage = totalClasses > 0
          ? ((presentCount / totalClasses) * 100).toFixed(1)
          : 'N/A'

        academicContext += `
Attendance Summary:
- Total Classes: ${totalClasses}
- Present: ${presentCount}
- Absent: ${absentCount}
- Attendance Percentage: ${attendancePercentage}%
`

        // Get fee info
        const feeRecords = await db.fee.findMany({
          where: { studentId: student.id }
        })

        const totalFees = feeRecords.reduce((sum, f) => sum + Number(f.amount), 0)
        const paidFees = feeRecords.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0)
        const pendingFees = totalFees - paidFees

        academicContext += `
Fee Summary:
- Total Fees: ₹${totalFees.toLocaleString()}
- Paid: ₹${paidFees.toLocaleString()}
- Pending: ₹${pendingFees.toLocaleString()}
`
      }
    } else if (user.role === 'FACULTY' || user.role === 'HOD') {
      const faculty = await db.faculty.findFirst({
        where: { userId },
        include: {
          department: true
        }
      })

      if (faculty) {
        userContext += `
Faculty Details:
- Employee ID: ${faculty.employeeId}
- Designation: ${faculty.designation}
- Department: ${faculty.department?.name || 'N/A'}
- Specialization: ${faculty.specialization || 'N/A'}
`

        // Get assigned subjects
        const subjects = await db.subject.findMany({
          where: { facultyId: faculty.id },
          include: { course: true }
        })

        if (subjects.length > 0) {
          academicContext += `
Assigned Subjects:
${subjects.map(s => `- ${s.name} (${s.code}) - ${s.course?.name || 'N/A'}`).join('\n')}
`
        }
      }
    }

    // Get departments for context
    const departments = await db.department.findMany({
      where: { tenantId },
      take: 5
    })

    if (departments.length > 0) {
      academicContext += `
Departments in College:
${departments.map(d => `- ${d.name} (${d.code})`).join('\n')}
`
    }

    // Get courses for context
    const courses = await db.course.findMany({
      where: { tenantId },
      take: 5
    })

    if (courses.length > 0) {
      academicContext += `
Courses Offered:
${courses.map(c => `- ${c.name} (${c.code}) - Duration: ${c.duration} years`).join('\n')}
`
    }
  }

  const systemPrompt = `You are the CampusOS AI Assistant, a helpful and knowledgeable AI chatbot for Geetorus CampusOS - an Enterprise College ERP SaaS platform. Your role is to assist students, faculty, and staff with various academic and administrative queries.

${userContext}

${academicContext}

## Your Capabilities

You can help users with:

1. **Academic Queries**
   - Course information and curriculum details
   - Subject details and faculty assignments
   - Semester and examination schedules
   - Academic calendar information

2. **Attendance Management**
   - Check attendance summaries and percentages
   - Attendance warnings and requirements
   - Leave application guidance

3. **Fee & Finance**
   - Fee structure and payment status
   - Scholarship information and eligibility
   - Payment reminders and due dates

4. **Placement & Career**
   - Upcoming placement drives
   - Company information and eligibility criteria
   - Placement statistics and preparation tips

5. **General Campus Information**
   - Department and faculty details
   - Library resources and book availability
   - Hostel and transport information
   - Events and announcements

## Response Guidelines

1. Be helpful, friendly, and professional
2. Provide accurate information based on the context provided
3. If you don't have specific information, acknowledge it and suggest where to find it
4. Format responses clearly with bullet points when appropriate
5. Be concise but thorough
6. If asked about sensitive personal data, remind users to check the official portal

## Available Modules in CampusOS

- Student Management
- Faculty Management
- Department Management
- Course & Subject Management
- Attendance Tracking
- Marks & Grading
- Fee Management
- Scholarship Management
- Placement Cell
- Library Management
- Hostel Management
- Transport Management
- Announcement System
- Timetable Management

Remember to personalize responses based on the user's role and context. For students, provide student-specific information. For faculty, provide faculty-specific guidance.

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

  return systemPrompt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get current user for context
    const user = await getCurrentUser()

    // Build context-aware system prompt
    let systemPrompt = `You are the CampusOS AI Assistant, a helpful AI chatbot for Geetorus CampusOS - an Enterprise College ERP SaaS platform.

You help students, faculty, and staff with:
- Academic queries (courses, subjects, faculty)
- Attendance summaries and status
- Fee-related queries
- Placement information
- General campus information

Be helpful, friendly, and professional. Provide accurate information and format responses clearly.

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

    // If user is logged in, get personalized context
    if (user?.id && user?.tenantId) {
      try {
        systemPrompt = await buildSystemPrompt(user.id, user.tenantId)
      } catch (error) {
        console.error('Error building context:', error)
        // Continue with default prompt
      }
    }

    // Initialize ZAI
    const zai = await getZAI()

    // Prepare messages for the API
    const chatMessages = [
      { role: 'assistant', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ]

    // Get completion from ZAI
    const completion = await zai.chat.completions.create({
      messages: chatMessages,
      thinking: { type: 'disabled' }
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      response: response
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
