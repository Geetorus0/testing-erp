import { db } from './src/lib/db';
import { hashPassword } from './src/lib/auth';

async function main() {
  console.log('🌱 Seeding Geetorus CampusOS...');

  // Create plans
  const plans = await Promise.all([
    db.plan.create({
      data: {
        name: 'Starter',
        slug: 'starter',
        price: 29999,
        billingCycle: 'monthly',
        maxStudents: 500,
        maxFaculty: 50,
        maxStorage: 500000000, // 500MB
        features: JSON.stringify(['attendance', 'marks', 'timetable', 'basic_reports'])
      }
    }),
    db.plan.create({
      data: {
        name: 'Professional',
        slug: 'professional',
        price: 79999,
        billingCycle: 'monthly',
        maxStudents: 2000,
        maxFaculty: 200,
        maxStorage: 1000000000, // 1GB
        features: JSON.stringify(['attendance', 'marks', 'timetable', 'reports', 'placement', 'finance', 'library'])
      }
    }),
    db.plan.create({
      data: {
        name: 'Enterprise',
        slug: 'enterprise',
        price: 199999,
        billingCycle: 'monthly',
        maxStudents: 10000,
        maxFaculty: 500,
        maxStorage: 2000000000, // 2GB
        features: JSON.stringify(['all_features', 'ai_modules', 'digital_twin', 'custom_branding', 'api_access'])
      }
    })
  ]);

  // Create demo tenant
  const tenant = await db.tenant.create({
    data: {
      name: 'Geetorus Engineering College',
      slug: 'geetorus-engineering',
      domain: 'geetorus.edu',
      logo: '/logo.svg',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      planId: plans[2].id,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxStudents: 5000,
      maxFaculty: 200
    }
  });

  // Create departments
  const departments = await Promise.all([
    db.department.create({
      data: { tenantId: tenant.id, name: 'Computer Science & Engineering', code: 'CSE' }
    }),
    db.department.create({
      data: { tenantId: tenant.id, name: 'Electronics & Communication', code: 'ECE' }
    }),
    db.department.create({
      data: { tenantId: tenant.id, name: 'Electrical & Electronics', code: 'EEE' }
    }),
    db.department.create({
      data: { tenantId: tenant.id, name: 'Mechanical Engineering', code: 'MECH' }
    }),
    db.department.create({
      data: { tenantId: tenant.id, name: 'Civil Engineering', code: 'CIVIL' }
    }),
    db.department.create({
      data: { tenantId: tenant.id, name: 'Business Administration', code: 'MBA' }
    })
  ]);

  // Create courses
  const courses = await Promise.all([
    db.course.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'B.Tech Computer Science', code: 'BTech-CSE', duration: 4, type: 'UG' }
    }),
    db.course.create({
      data: { tenantId: tenant.id, departmentId: departments[1].id, name: 'B.Tech Electronics', code: 'BTech-ECE', duration: 4, type: 'UG' }
    }),
    db.course.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'M.Tech Computer Science', code: 'MTech-CSE', duration: 2, type: 'PG' }
    }),
    db.course.create({
      data: { tenantId: tenant.id, departmentId: departments[5].id, name: 'MBA', code: 'MBA', duration: 2, type: 'PG' }
    })
  ]);

  // Create semesters for each course
  const semesters: Awaited<ReturnType<typeof db.semester.create>>[] = [];
  for (const course of courses) {
    for (let i = 1; i <= course.duration * 2; i++) {
      semesters.push(await db.semester.create({
        data: {
          tenantId: tenant.id,
          courseId: course.id,
          name: `Semester ${i}`,
          number: i,
          startDate: new Date(2024, i <= 2 ? 7 : (i <= 4 ? 0 : (i <= 6 ? 7 : 0)), 1),
          endDate: new Date(2024, i <= 2 ? 11 : (i <= 4 ? 4 : (i <= 6 ? 11 : 4)), 30)
        }
      }));
    }
  }

  // Create sections
  const sections: Awaited<ReturnType<typeof db.section.create>>[] = [];
  for (const semester of semesters.slice(0, 8)) {
    for (const sectionName of ['A', 'B']) {
      sections.push(await db.section.create({
        data: {
          tenantId: tenant.id,
          semesterId: semester.id,
          name: `Section ${sectionName}`,
          capacity: 60
        }
      }));
    }
  }

  // Create subjects
  const subjects = await Promise.all([
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Data Structures & Algorithms', code: 'CS201', credits: 4, type: 'theory' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Database Management Systems', code: 'CS202', credits: 4, type: 'theory' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Operating Systems', code: 'CS203', credits: 3, type: 'theory' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Computer Networks', code: 'CS204', credits: 3, type: 'theory' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Software Engineering', code: 'CS205', credits: 3, type: 'theory' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Machine Learning', code: 'CS301', credits: 4, type: 'theory' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[0].id, name: 'Web Technologies Lab', code: 'CS206L', credits: 2, type: 'lab' }
    }),
    db.subject.create({
      data: { tenantId: tenant.id, departmentId: departments[1].id, name: 'Digital Electronics', code: 'EC201', credits: 4, type: 'theory' }
    })
  ]);

  // Hash password for all users
  const hashedPassword = await hashPassword('password123');

  // Create super admin
  const superAdmin = await db.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@geetorus.edu',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      name: 'System Administrator',
      phone: '+91-9876543210',
      isActive: true,
      isEmailVerified: true
    }
  });

  // Create principal
  const principal = await db.user.create({
    data: {
      tenantId: tenant.id,
      email: 'principal@geetorus.edu',
      password: hashedPassword,
      role: 'PRINCIPAL',
      name: 'Dr. Rajesh Kumar',
      phone: '+91-9876543211',
      isActive: true,
      isEmailVerified: true
    }
  });

  // Create dean
  const deanUser = await db.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dean@geetorus.edu',
      password: hashedPassword,
      role: 'DEAN',
      name: 'Dr. Priya Sharma',
      phone: '+91-9876543212',
      isActive: true,
      isEmailVerified: true
    }
  });

  // Create HODs and Faculty
  const hodUsers: Awaited<ReturnType<typeof db.user.create>>[] = [];
  const facultyUsers: Awaited<ReturnType<typeof db.user.create>>[] = [];
  
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    
    // Create HOD
    const hodUser = await db.user.create({
      data: {
        tenantId: tenant.id,
        email: `hod.${dept.code.toLowerCase()}@geetorus.edu`,
        password: hashedPassword,
        role: 'HOD',
        name: `Dr. HOD ${dept.name.split(' ')[0]}`,
        phone: `+91-98765432${20 + i}`,
        isActive: true,
        isEmailVerified: true
      }
    });
    hodUsers.push(hodUser);

    // Create HOD as faculty
    await db.faculty.create({
      data: {
        tenantId: tenant.id,
        userId: hodUser.id,
        departmentId: dept.id,
        employeeId: `FAC${String(1001 + i).padStart(4, '0')}`,
        name: hodUser.name,
        email: hodUser.email,
        designation: 'Professor & HOD',
        qualification: 'Ph.D',
        specialization: dept.name,
        experience: 15 + i,
        joiningDate: new Date(2010, 5, 1),
        isMentor: true,
        mentorCapacity: 10
      }
    });

    // Create additional faculty for each department
    for (let j = 0; j < 5; j++) {
      const facultyUser = await db.user.create({
        data: {
          tenantId: tenant.id,
          email: `faculty.${dept.code.toLowerCase()}${j + 1}@geetorus.edu`,
          password: hashedPassword,
          role: j % 3 === 0 ? 'MENTOR' : 'FACULTY',
          name: `Prof. Faculty${j + 1} ${dept.code}`,
          phone: `+91-987654${String(30 + i * 10 + j).padStart(4, '0')}`,
          isActive: true,
          isEmailVerified: true
        }
      });
      facultyUsers.push(facultyUser);

      await db.faculty.create({
        data: {
          tenantId: tenant.id,
          userId: facultyUser.id,
          departmentId: dept.id,
          employeeId: `FAC${String(2001 + i * 10 + j).padStart(4, '0')}`,
          name: facultyUser.name,
          email: facultyUser.email,
          designation: j % 2 === 0 ? 'Associate Professor' : 'Assistant Professor',
          qualification: j % 3 === 0 ? 'Ph.D' : 'M.Tech',
          specialization: subjects[j % subjects.length]?.name || 'General',
          experience: 5 + j * 2,
          joiningDate: new Date(2015 + j, 5, 1),
          isMentor: facultyUser.role === 'MENTOR',
          mentorCapacity: 20
        }
      });
    }
  }

  // Update department HODs
  for (let i = 0; i < departments.length; i++) {
    const hodFaculty = await db.faculty.findFirst({
      where: { tenantId: tenant.id, departmentId: departments[i].id }
    });
    if (hodFaculty) {
      await db.department.update({
        where: { id: departments[i].id },
        data: { hodId: hodFaculty.id }
      });
    }
  }

  // Create students
  const studentUsers: Awaited<ReturnType<typeof db.user.create>>[] = [];
  const firstSemester = semesters[0];
  const firstSection = sections[0];
  const secondSection = sections[1];
  
  for (let i = 0; i < 50; i++) {
    const studentUser = await db.user.create({
      data: {
        tenantId: tenant.id,
        email: `student${String(i + 1).padStart(3, '0')}@geetorus.edu`,
        password: hashedPassword,
        role: 'STUDENT',
        name: `Student ${String(i + 1).padStart(3, '0')}`,
        phone: `+91-98765${String(50000 + i).padStart(5, '0')}`,
        isActive: true,
        isEmailVerified: true
      }
    });
    studentUsers.push(studentUser);

    const section = i % 2 === 0 ? firstSection : secondSection;
    
    await db.student.create({
      data: {
        tenantId: tenant.id,
        userId: studentUser.id,
        departmentId: departments[0].id,
        courseId: courses[0].id,
        sectionId: section.id,
        rollNumber: `21CS${String(i + 1).padStart(3, '0')}`,
        admissionNumber: `GEC${String(2021001 + i).padStart(7, '0')}`,
        admissionDate: new Date(2021, 7, 1),
        name: studentUser.name,
        email: studentUser.email,
        phone: studentUser.phone,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        dateOfBirth: new Date(2003, i % 12, (i % 28) + 1),
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'][i % 7],
        address: `${i + 1}, Main Street, City ${i % 10}`,
        city: 'Tech City',
        state: 'Karnataka',
        pincode: '560001',
        fatherName: `Father of Student ${i + 1}`,
        fatherPhone: `+91-98765${String(60000 + i).padStart(5, '0')}`,
        motherName: `Mother of Student ${i + 1}`,
        motherPhone: `+91-98765${String(70000 + i).padStart(5, '0')}`,
        currentSemester: 1,
        cgpa: 7 + (i % 30) / 10,
        status: 'active',
        riskScore: i % 10 === 0 ? 0.7 : (i % 5 === 0 ? 0.4 : 0.1)
      }
    });
  }

  // Create attendance records
  const today = new Date();
  for (let i = 0; i < 50; i++) {
    const student = await db.student.findFirst({
      where: { tenantId: tenant.id, rollNumber: `21CS${String(i + 1).padStart(3, '0')}` }
    });
    
    if (student) {
      for (let d = 0; d < 30; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        
        for (const subject of subjects.slice(0, 5)) {
          const faculty = await db.faculty.findFirst({
            where: { tenantId: tenant.id, departmentId: departments[0].id }
          });
          
          if (faculty) {
            await db.attendance.create({
              data: {
                tenantId: tenant.id,
                studentId: student.id,
                subjectId: subject.id,
                semesterId: firstSemester.id,
                date,
                status: Math.random() > 0.15 ? 'present' : 'absent',
                markedBy: faculty.id
              }
            });
          }
        }
      }
    }
  }

  // Create marks
  for (let i = 0; i < 50; i++) {
    const student = await db.student.findFirst({
      where: { tenantId: tenant.id, rollNumber: `21CS${String(i + 1).padStart(3, '0')}` }
    });
    
    if (student) {
      for (const subject of subjects.slice(0, 5)) {
        const faculty = await db.faculty.findFirst({
          where: { tenantId: tenant.id, departmentId: departments[0].id }
        });
        
        if (faculty) {
          // Internal 1
          await db.marks.create({
            data: {
              tenantId: tenant.id,
              studentId: student.id,
              subjectId: subject.id,
              semesterId: firstSemester.id,
              examType: 'internal1',
              maxMarks: 20,
              obtainedMarks: 12 + Math.floor(Math.random() * 8),
              percentage: 0,
              enteredBy: faculty.id
            }
          });
          
          // Internal 2
          await db.marks.create({
            data: {
              tenantId: tenant.id,
              studentId: student.id,
              subjectId: subject.id,
              semesterId: firstSemester.id,
              examType: 'internal2',
              maxMarks: 20,
              obtainedMarks: 12 + Math.floor(Math.random() * 8),
              percentage: 0,
              enteredBy: faculty.id
            }
          });
        }
      }
    }
  }

  // Create assignments
  for (const subject of subjects.slice(0, 5)) {
    const faculty = await db.faculty.findFirst({
      where: { tenantId: tenant.id, departmentId: departments[0].id }
    });
    
    if (faculty) {
      await db.assignment.create({
        data: {
          tenantId: tenant.id,
          subjectId: subject.id,
          facultyId: faculty.id,
          title: `Assignment 1 - ${subject.name}`,
          description: `Complete the assignment for ${subject.name}. Submit before the due date.`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxMarks: 100,
          status: 'active'
        }
      });
    }
  }

  // Create companies
  const companies = await Promise.all([
    db.company.create({
      data: {
        tenantId: tenant.id,
        name: 'Google',
        industry: 'Technology',
        website: 'https://careers.google.com',
        description: 'Google LLC is an American multinational technology company.',
        contactPerson: 'HR Team',
        contactEmail: 'careers@google.com'
      }
    }),
    db.company.create({
      data: {
        tenantId: tenant.id,
        name: 'Microsoft',
        industry: 'Technology',
        website: 'https://careers.microsoft.com',
        description: 'Microsoft Corporation is an American multinational technology corporation.',
        contactPerson: 'HR Team',
        contactEmail: 'careers@microsoft.com'
      }
    }),
    db.company.create({
      data: {
        tenantId: tenant.id,
        name: 'Amazon',
        industry: 'E-commerce & Technology',
        website: 'https://amazon.jobs',
        description: 'Amazon.com, Inc. is an American multinational technology company.',
        contactPerson: 'HR Team',
        contactEmail: 'careers@amazon.com'
      }
    }),
    db.company.create({
      data: {
        tenantId: tenant.id,
        name: 'TCS',
        industry: 'IT Services',
        website: 'https://careers.tcs.com',
        description: 'Tata Consultancy Services is an Indian multinational IT services company.',
        contactPerson: 'HR Team',
        contactEmail: 'careers@tcs.com'
      }
    }),
    db.company.create({
      data: {
        tenantId: tenant.id,
        name: 'Infosys',
        industry: 'IT Services',
        website: 'https://careers.infosys.com',
        description: 'Infosys Limited is an Indian multinational corporation.',
        contactPerson: 'HR Team',
        contactEmail: 'careers@infosys.com'
      }
    })
  ]);

  // Create placement drives
  await db.drive.create({
    data: {
      tenantId: tenant.id,
      companyId: companies[0].id,
      title: 'Google Software Engineer 2024',
      description: 'Software Engineer role at Google',
      eligibleCourses: JSON.stringify([courses[0].id]),
      minCgpa: 7.5,
      maxBacklogs: 0,
      packageMin: 2500000,
      packageMax: 3500000,
      locations: 'Bangalore, Hyderabad, Mumbai',
      positions: 'Software Engineer, SDE',
      lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'upcoming'
    }
  });

  await db.drive.create({
    data: {
      tenantId: tenant.id,
      companyId: companies[3].id,
      title: 'TCS Ninja 2024',
      description: 'TCS Ninja hiring for 2024 batch',
      eligibleCourses: JSON.stringify(courses.map(c => c.id)),
      minCgpa: 6.0,
      maxBacklogs: 2,
      packageMin: 700000,
      packageMax: 900000,
      locations: 'Pan India',
      positions: 'System Engineer',
      lastDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'upcoming'
    }
  });

  // Create fees
  await db.fee.create({
    data: {
      tenantId: tenant.id,
      name: 'Tuition Fee - Semester 1',
      type: 'tuition',
      amount: 75000,
      courseId: courses[0].id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      academicYear: '2024-25',
      isActive: true
    }
  });

  await db.fee.create({
    data: {
      tenantId: tenant.id,
      name: 'Library Fee',
      type: 'library',
      amount: 5000,
      academicYear: '2024-25',
      isActive: true
    }
  });

  // Create books
  const books = await Promise.all([
    db.book.create({
      data: {
        tenantId: tenant.id,
        isbn: '978-0131103627',
        title: 'The C Programming Language',
        author: 'Brian W. Kernighan, Dennis M. Ritchie',
        publisher: 'Prentice Hall',
        publicationYear: 1988,
        category: 'Programming',
        totalCopies: 10,
        availableCopies: 8
      }
    }),
    db.book.create({
      data: {
        tenantId: tenant.id,
        isbn: '978-0073523324',
        title: 'Data Structures and Algorithm Analysis in C',
        author: 'Mark Allen Weiss',
        publisher: 'Pearson',
        publicationYear: 2013,
        category: 'Data Structures',
        totalCopies: 15,
        availableCopies: 12
      }
    }),
    db.book.create({
      data: {
        tenantId: tenant.id,
        isbn: '978-0321486813',
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm',
        publisher: 'Addison-Wesley',
        publicationYear: 2003,
        category: 'Software Engineering',
        totalCopies: 8,
        availableCopies: 6
      }
    }),
    db.book.create({
      data: {
        tenantId: tenant.id,
        isbn: '978-0262033848',
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        publisher: 'MIT Press',
        publicationYear: 2009,
        category: 'Algorithms',
        totalCopies: 20,
        availableCopies: 15
      }
    })
  ]);

  // Create hostel
  const hostel = await db.hostel.create({
    data: {
      tenantId: tenant.id,
      name: 'Boys Hostel - Block A',
      type: 'boys',
      totalRooms: 50
    }
  });

  // Create rooms
  for (let i = 1; i <= 20; i++) {
    await db.room.create({
      data: {
        tenantId: tenant.id,
        hostelId: hostel.id,
        roomNumber: `A${String(i).padStart(3, '0')}`,
        floor: Math.ceil(i / 5),
        capacity: 2,
        occupied: i <= 15 ? 2 : (i <= 18 ? 1 : 0),
        type: 'double',
        status: i <= 15 ? 'full' : (i <= 18 ? 'available' : 'available'),
        rent: 50000
      }
    });
  }

  // Create buses
  const bus = await db.bus.create({
    data: {
      tenantId: tenant.id,
      busNumber: 'KA-01-AB-1234',
      registrationNumber: 'KA01AB1234',
      capacity: 50,
      driverName: 'Raju Kumar',
      driverPhone: '+91-9876543299'
    }
  });

  // Create bus routes
  await db.busRoute.create({
    data: {
      tenantId: tenant.id,
      busId: bus.id,
      routeNumber: 'R1',
      routeName: 'City Center Route',
      startPoint: 'City Bus Stand',
      endPoint: 'College Campus',
      stops: JSON.stringify(['City Bus Stand', 'Railway Station', 'Market', 'Hospital', 'College Campus']),
      distance: 15,
      fare: 5000
    }
  });

  // Create notifications
  await db.notification.create({
    data: {
      tenantId: tenant.id,
      title: 'Welcome to Geetorus CampusOS',
      message: 'Your complete campus management platform is now live!',
      type: 'system'
    }
  });

  // Create announcements
  await db.announcement.create({
    data: {
      tenantId: tenant.id,
      title: 'Mid-Semester Examinations Schedule',
      content: 'Mid-semester examinations will be conducted from the 15th of this month. Please check your timetable for subject-wise schedules.',
      category: 'academic',
      priority: 'high',
      publishedAt: new Date()
    }
  });

  await db.announcement.create({
    data: {
      tenantId: tenant.id,
      title: 'Campus Recruitment Drive',
      content: 'Major IT companies will be visiting our campus for placements. All final year students are requested to update their profiles.',
      category: 'placement',
      priority: 'normal',
      publishedAt: new Date()
    }
  });

  // =====================================================
  // HOSTEL MODULE SEED DATA
  // =====================================================
  console.log('🏠 Creating hostel data...');

  // Create hostels
  const hostels = await Promise.all([
    db.hostel.create({
      data: {
        tenantId: tenant.id,
        name: 'Ganga Hostel',
        type: 'boys',
        totalRooms: 50,
        address: 'North Campus, Block A',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Gym', 'Study Room'])
      }
    }),
    db.hostel.create({
      data: {
        tenantId: tenant.id,
        name: 'Yamuna Hostel',
        type: 'boys',
        totalRooms: 40,
        address: 'North Campus, Block B',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Sports Room'])
      }
    }),
    db.hostel.create({
      data: {
        tenantId: tenant.id,
        name: 'Saraswati Hostel',
        type: 'girls',
        totalRooms: 45,
        address: 'South Campus, Block A',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Common Room', 'Study Room'])
      }
    }),
    db.hostel.create({
      data: {
        tenantId: tenant.id,
        name: 'Kaveri Hostel',
        type: 'girls',
        totalRooms: 35,
        address: 'South Campus, Block B',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Garden'])
      }
    })
  ]);

  // Create rooms for each hostel
  const roomTypes = ['single', 'double', 'triple', 'dormitory'];
  
  for (const hostel of hostels) {
    let roomNumber = 100;
    for (let floor = 1; floor <= 4; floor++) {
      for (let room = 1; room <= 12; room++) {
        const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const capacity = type === 'single' ? 1 : type === 'double' ? 2 : type === 'triple' ? 3 : 6;
        const occupied = Math.floor(Math.random() * (capacity + 1));
        
        await db.room.create({
          data: {
            tenantId: tenant.id,
            hostelId: hostel.id,
            roomNumber: `${floor}${String(room).padStart(2, '0')}`,
            floor,
            capacity,
            occupied,
            type,
            status: occupied === capacity ? 'full' : occupied === 0 ? 'available' : 'available',
            rent: type === 'single' ? 8000 : type === 'double' ? 6000 : type === 'triple' ? 4500 : 3000
          }
        });
        roomNumber++;
      }
    }
  }

  // Create room allocations for students
  const allRooms = await db.room.findMany({
    where: { tenantId: tenant.id }
  });

  const availableRooms = allRooms.filter(r => r.occupied < r.capacity);
  
  for (let i = 0; i < Math.min(30, studentUsers.length); i++) {
    const student = await db.student.findFirst({
      where: { tenantId: tenant.id, rollNumber: `21CS${String(i + 1).padStart(3, '0')}` }
    });
    
    if (student && availableRooms.length > 0) {
      const roomIndex = i % availableRooms.length;
      const room = availableRooms[roomIndex];
      
      const existingAllocation = await db.roomAllocation.findFirst({
        where: { studentId: student.id, status: 'active' }
      });
      
      if (!existingAllocation) {
        await db.roomAllocation.create({
          data: {
            tenantId: tenant.id,
            roomId: room.id,
            studentId: student.id,
            bedNumber: (room.occupied % room.capacity) + 1,
            allocationDate: new Date(2024, 6, 1),
            status: 'active'
          }
        });
      }
    }
  }

  // Create hostel complaints
  const complaintCategories = ['electrical', 'plumbing', 'furniture', 'cleaning', 'other'];
  const complaintDescriptions = {
    electrical: ['Power outlet not working', 'Light flickering in room', 'AC not cooling properly', 'Ceiling fan making noise'],
    plumbing: ['Water leakage in bathroom', 'Tap not working', 'Drainage blocked', 'Geyser not working'],
    furniture: ['Bed frame broken', 'Study table drawer stuck', 'Chair leg loose', 'Wardrobe door broken'],
    cleaning: ['Room not cleaned', 'Common bathroom dirty', 'Cobwebs in corner', 'Dust accumulation'],
    other: ['No WiFi in room', 'Noise from nearby room', 'Security concern', 'Maintenance request']
  };

  for (let i = 0; i < 20; i++) {
    const category = complaintCategories[i % complaintCategories.length];
    const descriptions = complaintDescriptions[category];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
    const student = await db.student.findFirst({
      where: { tenantId: tenant.id, rollNumber: `21CS${String(Math.floor(Math.random() * 30) + 1).padStart(3, '0')}` }
    });

    await db.hostelComplaint.create({
      data: {
        tenantId: tenant.id,
        studentId: student?.id || null,
        hostelId: randomRoom.hostelId,
        roomNumber: randomRoom.roomNumber,
        category,
        description,
        status: ['pending', 'in_progress', 'resolved'][i % 3] as string,
        remarks: i % 3 === 2 ? 'Issue resolved by maintenance team' : null,
        resolvedAt: i % 3 === 2 ? new Date() : null,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      }
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('Super Admin: admin@geetorus.edu / password123');
  console.log('Principal: principal@geetorus.edu / password123');
  console.log('Dean: dean@geetorus.edu / password123');
  console.log('HOD: hod.cse@geetorus.edu / password123');
  console.log('Faculty: faculty.cse1@geetorus.edu / password123');
  console.log('Student: student001@geetorus.edu / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
