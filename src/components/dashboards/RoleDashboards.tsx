'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  DollarSign, 
  Library, 
  BedDouble, 
  Bus,
  BarChart3,
  Clock,
  Calendar,
  FileText,
  ClipboardList,
  Bell,
  Settings,
  TrendingUp,
  UserCog,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '@prisma/client';

// Base Dashboard Props
interface DashboardProps {
  userName?: string;
  userRole?: UserRole;
  activeMenu?: string;
}

// Super Admin Dashboard
export function SuperAdminDashboard({ userName = 'Admin', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Total Tenants', value: 45, icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Active Users', value: 12450, icon: Users, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
    { title: 'System Uptime', value: '99.9%', icon: TrendingUp, color: 'text-sky-600', bgColor: 'bg-sky-50 dark:bg-sky-950/30' },
    { title: 'Active Modules', value: 12, icon: Settings, color: 'text-violet-600', bgColor: 'bg-violet-50 dark:bg-violet-950/30' },
  ];

  const recentActivities = [
    { action: 'New tenant registered', tenant: 'ABC Engineering College', time: '2 hours ago' },
    { action: 'Subscription upgraded', tenant: 'XYZ University', time: '5 hours ago' },
    { action: 'System backup completed', tenant: 'System', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
              <p className="text-violet-100">Super Administrator Dashboard</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Full System Access
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.tenant}</p>
                  </div>
                  <Badge variant="outline">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Add Tenant
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <UserCog className="h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <Settings className="h-4 w-4" />
                System Settings
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Principal Dashboard
export function PrincipalDashboard({ userName = 'Principal', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Total Students', value: 8500, icon: GraduationCap, color: 'text-emerald-600' },
    { title: 'Total Faculty', value: 450, icon: Users, color: 'text-amber-600' },
    { title: 'Departments', value: 12, icon: Building2, color: 'text-sky-600' },
    { title: 'Placement Rate', value: '92%', icon: Briefcase, color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
              <p className="text-emerald-100">Principal Dashboard - Institute Overview</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-100">Today</p>
              <p className="text-lg font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Computer Science', 'Electronics', 'Mechanical', 'Civil'].map((dept, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-32 truncate">{dept}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${85 - i * 5}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{85 - i * 5}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'Leave Requests', count: 5 },
                { type: 'Budget Proposals', count: 3 },
                { type: 'Event Approvals', count: 2 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>{item.type}</span>
                  <Badge>{item.count} pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dean Dashboard
export function DeanDashboard({ userName = 'Dean', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Departments', value: 6, icon: Building2 },
    { title: 'Faculty', value: 180, icon: Users },
    { title: 'Students', value: 3200, icon: GraduationCap },
    { title: 'Avg Attendance', value: '87%', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-amber-100">Dean Dashboard - Academic Overview</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// HOD Dashboard
export function HodDashboard({ userName = 'HOD', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Department Faculty', value: 25, icon: Users },
    { title: 'Department Students', value: 450, icon: GraduationCap },
    { title: 'Active Courses', value: 18, icon: FileText },
    { title: 'Avg Attendance', value: '89%', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-sky-100">Head of Department Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '09:00 AM', event: 'Faculty Meeting', location: 'Conference Room' },
              { time: '11:00 AM', event: 'Department Review', location: 'Office' },
              { time: '02:00 PM', event: 'Student Counseling', location: 'Cabin' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-sky-600 w-24">{item.time}</span>
                <div className="flex-1">
                  <p className="font-medium">{item.event}</p>
                </div>
                <Badge variant="outline">{item.location}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Parent Dashboard
export function ParentDashboard({ userName = 'Parent', activeMenu = 'dashboard' }: DashboardProps) {
  const childInfo = {
    name: 'Rahul Sharma',
    rollNumber: 'CSE2021001',
    department: 'Computer Science',
    semester: 6,
    attendance: 87,
    cgpa: 8.5,
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-pink-100">Monitor your child&apos;s academic progress</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{childInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="font-medium">{childInfo.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{childInfo.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Semester</p>
              <p className="font-medium">{childInfo.semester}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-3xl font-bold">{childInfo.attendance}%</p>
              </div>
              <Badge variant={childInfo.attendance >= 75 ? 'default' : 'destructive'}>
                {childInfo.attendance >= 75 ? 'Good' : 'Warning'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current CGPA</p>
                <p className="text-3xl font-bold">{childInfo.cgpa}</p>
              </div>
              <Badge>Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <ClipboardList className="h-4 w-4" />
              View Attendance
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <FileText className="h-4 w-4" />
              View Marks
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Calendar className="h-4 w-4" />
              Timetable
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <DollarSign className="h-4 w-4" />
              Pay Fees
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placement Dashboard
export function PlacementDashboard({ userName = 'Placement Officer', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Active Drives', value: 15, icon: Briefcase },
    { title: 'Students Placed', value: 850, icon: GraduationCap },
    { title: 'Companies Visited', value: 45, icon: Building2 },
    { title: 'Placement Rate', value: '92%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-green-100">Placement Cell Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Drives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { company: 'Google', date: 'Jan 15, 2025', role: 'Software Engineer', packages: '25 LPA' },
              { company: 'Microsoft', date: 'Jan 18, 2025', role: 'SDE', packages: '22 LPA' },
              { company: 'Amazon', date: 'Jan 20, 2025', role: 'SDE-1', packages: '20 LPA' },
            ].map((drive, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{drive.company}</p>
                  <p className="text-sm text-muted-foreground">{drive.role}</p>
                </div>
                <Badge variant="outline">{drive.date}</Badge>
                <Badge>{drive.packages}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Finance Dashboard
export function FinanceDashboard({ userName = 'Finance Officer', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Total Revenue', value: '₹12.5 Cr', icon: DollarSign },
    { title: 'Fees Collected', value: '₹10.2 Cr', icon: TrendingUp },
    { title: 'Pending Dues', value: '₹2.3 Cr', icon: Clock },
    { title: 'Scholarships', value: '₹45 L', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-yellow-100">Finance Department Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { student: 'Rahul Sharma', amount: '₹1,25,000', type: 'Tuition Fee', status: 'Paid' },
              { student: 'Priya Singh', amount: '₹45,000', type: 'Hostel Fee', status: 'Pending' },
              { student: 'Amit Kumar', amount: '₹30,000', type: 'Exam Fee', status: 'Paid' },
            ].map((txn, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{txn.student}</p>
                  <p className="text-sm text-muted-foreground">{txn.type}</p>
                </div>
                <span className="font-medium">{txn.amount}</span>
                <Badge variant={txn.status === 'Paid' ? 'default' : 'secondary'}>{txn.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Library Dashboard
export function LibraryDashboard({ userName = 'Librarian', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Total Books', value: 25000, icon: Library },
    { title: 'Books Issued', value: 1250, icon: FileText },
    { title: 'Overdue Books', value: 45, icon: Clock },
    { title: 'Active Members', value: 3200, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-indigo-100">Library Management Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Hostel Dashboard
export function HostelDashboard({ userName = 'Hostel Warden', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Total Rooms', value: 250, icon: BedDouble },
    { title: 'Occupied', value: 220, icon: Users },
    { title: 'Available', value: 30, icon: BedDouble },
    { title: 'Pending Requests', value: 15, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-teal-100">Hostel Management Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Transport Dashboard
export function TransportDashboard({ userName = 'Transport Manager', activeMenu = 'dashboard' }: DashboardProps) {
  const stats = [
    { title: 'Total Buses', value: 25, icon: Bus },
    { title: 'Active Routes', value: 18, icon: BarChart3 },
    { title: 'Students Served', value: 1200, icon: GraduationCap },
    { title: 'Drivers', value: 30, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-orange-100">Transport Management Dashboard</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { route: 'Route A - City Center', bus: 'MH-12-1234', status: 'On Time' },
              { route: 'Route B - Railway Station', bus: 'MH-12-5678', status: 'Delayed' },
              { route: 'Route C - Industrial Area', bus: 'MH-12-9012', status: 'On Time' },
            ].map((route, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{route.route}</p>
                  <p className="text-sm text-muted-foreground">{route.bus}</p>
                </div>
                <Badge variant={route.status === 'On Time' ? 'default' : 'destructive'}>{route.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
