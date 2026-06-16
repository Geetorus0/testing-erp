import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Settings,
  Building2,
  Bus,
  Home,
  DollarSign,
  Briefcase,
  Library,
  Bell,
  UserCog,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  CalendarClock,
  Award,
  UsersRound,
  School,
  BookMarked,
  BusIcon,
  BedDouble,
  Wallet,
  LucideIcon,
  BadgeCheck,
  FileBadge,
  FolderOpen,
  Clock,
  Mail,
  Send,
  type IconNode,
} from 'lucide-react';
import { UserRole } from '@prisma/client';

// Navigation Item Type
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
  module?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

// Module definitions for permissions
export const MODULES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  ACADEMICS: 'academics',
  ATTENDANCE: 'attendance',
  MARKS: 'marks',
  TIMETABLE: 'timetable',
  LIBRARY: 'library',
  HOSTEL: 'hostel',
  TRANSPORT: 'transport',
  FINANCE: 'finance',
  PLACEMENT: 'placement',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  PORTFOLIO: 'portfolio',
  MENTORING: 'mentoring',
  LEAVE: 'leave',
  REQUESTS: 'requests',
  COMMUNICATION: 'communication',
  REPORTS: 'reports',
  AUDIT: 'audit',
} as const;

// Common Navigation Items
const dashboardItem: NavigationItem = {
  id: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  href: '/dashboard',
  module: MODULES.DASHBOARD,
};

const profileItem: NavigationItem = {
  id: 'profile',
  label: 'My Profile',
  icon: Users,
  href: '/profile',
  module: MODULES.USERS,
};

const settingsItem: NavigationItem = {
  id: 'settings',
  label: 'Settings',
  icon: Settings,
  href: '/settings',
  module: MODULES.SETTINGS,
};

const notificationsItem: NavigationItem = {
  id: 'notifications',
  label: 'Notifications',
  icon: Bell,
  href: '/notifications',
  module: MODULES.NOTIFICATIONS,
};

// Student Navigation
const studentNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'portfolio',
        label: 'My Portfolio',
        icon: FolderOpen,
        href: '/portfolio',
        module: MODULES.PORTFOLIO,
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    items: [
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Marks',
        icon: FileText,
        href: '/marks',
        module: MODULES.MARKS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        href: '/timetable',
        module: MODULES.TIMETABLE,
      },
      {
        id: 'assignments',
        label: 'Assignments',
        icon: BookMarked,
        href: '/assignments',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      {
        id: 'library',
        label: 'Library',
        icon: Library,
        href: '/library',
        module: MODULES.LIBRARY,
      },
      {
        id: 'hostel',
        label: 'Hostel',
        icon: BedDouble,
        href: '/hostel',
        module: MODULES.HOSTEL,
      },
      {
        id: 'transport',
        label: 'Transport',
        icon: BusIcon,
        href: '/transport',
        module: MODULES.TRANSPORT,
      },
      {
        id: 'fees',
        label: 'Fee Payment',
        icon: Wallet,
        href: '/fees',
        module: MODULES.FINANCE,
      },
    ],
  },
  {
    id: 'career',
    label: 'Career',
    items: [
      {
        id: 'placement',
        label: 'Placements',
        icon: Briefcase,
        href: '/placement',
        module: MODULES.PLACEMENT,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Parent Navigation
const parentNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'child-progress',
        label: 'Child Progress',
        icon: BarChart3,
        href: '/child/progress',
        module: MODULES.STUDENTS,
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    items: [
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/child/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Marks',
        icon: FileText,
        href: '/child/marks',
        module: MODULES.MARKS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        href: '/child/timetable',
        module: MODULES.TIMETABLE,
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      {
        id: 'fees',
        label: 'Fee Payment',
        icon: Wallet,
        href: '/fees',
        module: MODULES.FINANCE,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Faculty Navigation
const facultyNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'my-classes',
        label: 'My Classes',
        icon: School,
        href: '/classes',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    items: [
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        href: '/students',
        module: MODULES.STUDENTS,
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Marks Entry',
        icon: FileText,
        href: '/marks',
        module: MODULES.MARKS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        href: '/timetable',
        module: MODULES.TIMETABLE,
      },
      {
        id: 'assignments',
        label: 'Assignments',
        icon: BookMarked,
        href: '/assignments',
        module: MODULES.ACADEMICS,
      },
      {
        id: 'materials',
        label: 'Study Materials',
        icon: BookOpen,
        href: '/materials',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      {
        id: 'leave',
        label: 'Leave Management',
        icon: CalendarClock,
        href: '/leave',
        module: MODULES.LEAVE,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Mentor Navigation
const mentorNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'mentees',
        label: 'My Mentees',
        icon: UsersRound,
        href: '/mentees',
        module: MODULES.MENTORING,
      },
    ],
  },
  {
    id: 'mentoring',
    label: 'Mentoring',
    items: [
      {
        id: 'counseling',
        label: 'Counseling Notes',
        icon: MessageSquare,
        href: '/counseling',
        module: MODULES.MENTORING,
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/mentees/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Academic Progress',
        icon: BarChart3,
        href: '/mentees/progress',
        module: MODULES.MARKS,
      },
      {
        id: 'portfolio',
        label: 'Portfolio Review',
        icon: FolderOpen,
        href: '/mentees/portfolio',
        module: MODULES.PORTFOLIO,
      },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    items: [
      {
        id: 'parent-contact',
        label: 'Parent Contact',
        icon: Mail,
        href: '/parents',
        module: MODULES.COMMUNICATION,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// HOD Navigation
const hodNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'department',
        label: 'Department',
        icon: Building2,
        href: '/department',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        id: 'faculty',
        label: 'Faculty',
        icon: Users,
        href: '/faculty',
        module: MODULES.FACULTY,
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        href: '/students',
        module: MODULES.STUDENTS,
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    items: [
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Marks & Results',
        icon: FileText,
        href: '/marks',
        module: MODULES.MARKS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        href: '/timetable',
        module: MODULES.TIMETABLE,
      },
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        href: '/subjects',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Dean Navigation
const deanNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'departments',
        label: 'Departments',
        icon: Building2,
        href: '/departments',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        id: 'faculty',
        label: 'Faculty',
        icon: Users,
        href: '/faculty',
        module: MODULES.FACULTY,
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        href: '/students',
        module: MODULES.STUDENTS,
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    items: [
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Marks & Results',
        icon: FileText,
        href: '/marks',
        module: MODULES.MARKS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        href: '/timetable',
        module: MODULES.TIMETABLE,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Principal Navigation
const principalNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'departments',
        label: 'Departments',
        icon: Building2,
        href: '/departments',
        module: MODULES.ACADEMICS,
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        id: 'users',
        label: 'User Management',
        icon: UserCog,
        href: '/users',
        module: MODULES.USERS,
      },
      {
        id: 'faculty',
        label: 'Faculty',
        icon: Users,
        href: '/faculty',
        module: MODULES.FACULTY,
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        href: '/students',
        module: MODULES.STUDENTS,
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    items: [
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardList,
        href: '/attendance',
        module: MODULES.ATTENDANCE,
      },
      {
        id: 'marks',
        label: 'Marks & Results',
        icon: FileText,
        href: '/marks',
        module: MODULES.MARKS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Calendar,
        href: '/timetable',
        module: MODULES.TIMETABLE,
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      {
        id: 'hostel',
        label: 'Hostel',
        icon: BedDouble,
        href: '/hostel',
        module: MODULES.HOSTEL,
      },
      {
        id: 'transport',
        label: 'Transport',
        icon: Bus,
        href: '/transport',
        module: MODULES.TRANSPORT,
      },
      {
        id: 'library',
        label: 'Library',
        icon: Library,
        href: '/library',
        module: MODULES.LIBRARY,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
      {
        id: 'audit',
        label: 'Audit Logs',
        icon: FileBadge,
        href: '/audit',
        module: MODULES.AUDIT,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Super Admin Navigation
const superAdminNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'tenants',
        label: 'Tenants',
        icon: Building2,
        href: '/tenants',
        module: MODULES.SETTINGS,
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'users',
        label: 'User Management',
        icon: UserCog,
        href: '/users',
        module: MODULES.USERS,
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        icon: ShieldCheck,
        href: '/roles',
        module: MODULES.SETTINGS,
      },
      {
        id: 'audit',
        label: 'Audit Logs',
        icon: FileBadge,
        href: '/audit',
        module: MODULES.AUDIT,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      {
        id: 'system-settings',
        label: 'System Settings',
        icon: Settings,
        href: '/system/settings',
        module: MODULES.SETTINGS,
      },
      {
        id: 'plans',
        label: 'Subscription Plans',
        icon: Award,
        href: '/plans',
        module: MODULES.SETTINGS,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Placement Officer Navigation
const placementOfficerNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
      {
        id: 'companies',
        label: 'Companies',
        icon: Building2,
        href: '/companies',
        module: MODULES.PLACEMENT,
      },
    ],
  },
  {
    id: 'placement',
    label: 'Placement',
    items: [
      {
        id: 'drives',
        label: 'Placement Drives',
        icon: Briefcase,
        href: '/drives',
        module: MODULES.PLACEMENT,
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        href: '/students',
        module: MODULES.STUDENTS,
      },
      {
        id: 'interviews',
        label: 'Interviews',
        icon: MessageSquare,
        href: '/interviews',
        module: MODULES.PLACEMENT,
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: BadgeCheck,
        href: '/offers',
        module: MODULES.PLACEMENT,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'analytics',
        label: 'Placement Stats',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Finance Officer Navigation
const financeOfficerNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      {
        id: 'fees',
        label: 'Fee Structure',
        icon: DollarSign,
        href: '/fees',
        module: MODULES.FINANCE,
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: Wallet,
        href: '/payments',
        module: MODULES.FINANCE,
      },
      {
        id: 'scholarships',
        label: 'Scholarships',
        icon: Award,
        href: '/scholarships',
        module: MODULES.FINANCE,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'analytics',
        label: 'Financial Reports',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Librarian Navigation
const librarianNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
    ],
  },
  {
    id: 'library',
    label: 'Library',
    items: [
      {
        id: 'books',
        label: 'Books',
        icon: BookOpen,
        href: '/books',
        module: MODULES.LIBRARY,
      },
      {
        id: 'issues',
        label: 'Issues & Returns',
        icon: BookMarked,
        href: '/issues',
        module: MODULES.LIBRARY,
      },
      {
        id: 'students',
        label: 'Members',
        icon: GraduationCap,
        href: '/members',
        module: MODULES.STUDENTS,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'analytics',
        label: 'Library Stats',
        icon: BarChart3,
        href: '/analytics',
        module: MODULES.REPORTS,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Hostel Warden Navigation
const hostelWardenNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
    ],
  },
  {
    id: 'hostel',
    label: 'Hostel',
    items: [
      {
        id: 'hostels',
        label: 'Hostels',
        icon: Home,
        href: '/hostels',
        module: MODULES.HOSTEL,
      },
      {
        id: 'rooms',
        label: 'Rooms',
        icon: BedDouble,
        href: '/rooms',
        module: MODULES.HOSTEL,
      },
      {
        id: 'allocations',
        label: 'Allocations',
        icon: Users,
        href: '/allocations',
        module: MODULES.HOSTEL,
      },
      {
        id: 'complaints',
        label: 'Complaints',
        icon: MessageSquare,
        href: '/complaints',
        module: MODULES.HOSTEL,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Transport Manager Navigation
const transportManagerNavigation: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      dashboardItem,
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    items: [
      {
        id: 'buses',
        label: 'Buses',
        icon: Bus,
        href: '/buses',
        module: MODULES.TRANSPORT,
      },
      {
        id: 'routes',
        label: 'Routes',
        icon: Clock,
        href: '/routes',
        module: MODULES.TRANSPORT,
      },
      {
        id: 'allocations',
        label: 'Allocations',
        icon: Users,
        href: '/allocations',
        module: MODULES.TRANSPORT,
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      profileItem,
      notificationsItem,
      settingsItem,
    ],
  },
];

// Navigation mapping by role
export const navigationByRole: Record<UserRole, NavigationGroup[]> = {
  [UserRole.SUPER_ADMIN]: superAdminNavigation,
  [UserRole.PRINCIPAL]: principalNavigation,
  [UserRole.DEAN]: deanNavigation,
  [UserRole.HOD]: hodNavigation,
  [UserRole.FACULTY]: facultyNavigation,
  [UserRole.MENTOR]: mentorNavigation,
  [UserRole.STUDENT]: studentNavigation,
  [UserRole.PARENT]: parentNavigation,
  [UserRole.PLACEMENT_OFFICER]: placementOfficerNavigation,
  [UserRole.FINANCE_OFFICER]: financeOfficerNavigation,
  [UserRole.LIBRARIAN]: librarianNavigation,
  [UserRole.HOSTEL_WARDEN]: hostelWardenNavigation,
  [UserRole.TRANSPORT_MANAGER]: transportManagerNavigation,
};

// Get navigation for a specific role
export function getNavigationForRole(role: UserRole): NavigationGroup[] {
  return navigationByRole[role] || studentNavigation;
}

// Get all unique modules for a role
export function getModulesForRole(role: UserRole): string[] {
  const navigation = navigationByRole[role];
  const modules = new Set<string>();
  
  navigation.forEach(group => {
    group.items.forEach(item => {
      if (item.module) {
        modules.add(item.module);
      }
    });
  });
  
  return Array.from(modules);
}

// Check if user has access to a module
export function hasModuleAccess(userRole: UserRole, module: string): boolean {
  const modules = getModulesForRole(userRole);
  return modules.includes(module);
}

// Get navigation item by id for a role
export function getNavigationItemById(role: UserRole, itemId: string): NavigationItem | undefined {
  const navigation = navigationByRole[role];
  
  for (const group of navigation) {
    const item = group.items.find(item => item.id === itemId);
    if (item) return item;
  }
  
  return undefined;
}

export default navigationByRole;
