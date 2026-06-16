'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  Bus,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
  BarChart3,
  Briefcase,
  Library,
  BedDouble,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserRole } from '@prisma/client';

// Navigation items with role-based visibility
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT', 'PARENT', 'PLACEMENT_OFFICER', 'FINANCE_OFFICER', 'LIBRARIAN', 'HOSTEL_WARDEN', 'TRANSPORT_MANAGER'],
  },
  {
    title: 'Students',
    href: '/students',
    icon: GraduationCap,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD', 'FACULTY', 'MENTOR', 'PLACEMENT_OFFICER'],
  },
  {
    title: 'Faculty',
    href: '/faculty',
    icon: Users,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD'],
  },
  {
    title: 'Academics',
    href: '/academics',
    icon: BookOpen,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD', 'FACULTY', 'STUDENT'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT', 'PARENT'],
  },
  {
    title: 'Exams & Marks',
    href: '/exams',
    icon: FileText,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD', 'FACULTY', 'STUDENT', 'PARENT'],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: DollarSign,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'FINANCE_OFFICER'],
  },
  {
    title: 'Placement',
    href: '/placement',
    icon: Briefcase,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PLACEMENT_OFFICER', 'STUDENT'],
  },
  {
    title: 'Library',
    href: '/library',
    icon: Library,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'LIBRARIAN', 'STUDENT', 'FACULTY'],
  },
  {
    title: 'Hostel',
    href: '/hostel',
    icon: BedDouble,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN', 'STUDENT'],
  },
  {
    title: 'Transport',
    href: '/transport',
    icon: Bus,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'STUDENT', 'PARENT'],
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: Bell,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD', 'FACULTY', 'STUDENT', 'PARENT'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEAN', 'HOD'],
  },
  {
    title: 'User Management',
    href: '/users',
    icon: UserCog,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'PRINCIPAL'],
  },
];

// NavLink component - defined outside to avoid creating during render
function NavLink({ 
  item, 
  isCollapsed, 
  onClick 
}: { 
  item: NavItem; 
  isCollapsed: boolean; 
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  );
}

// NavContent component props
interface NavContentProps {
  filteredNavItems: NavItem[];
  isCollapsed: boolean;
  tenant?: {
    name: string;
    logo?: string | null;
  };
  user: {
    name: string;
    role: UserRole;
    avatar?: string | null;
  };
  onItemClick?: () => void;
  onLogout?: () => void;
}

// NavContent component - defined outside to avoid creating during render
function NavContent({ 
  filteredNavItems, 
  isCollapsed, 
  tenant, 
  user, 
  onItemClick,
  onLogout 
}: NavContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div
        className={cn(
          'flex items-center gap-3 border-b px-4 py-4',
          isCollapsed ? 'justify-center' : ''
        )}
      >
        {tenant?.logo ? (
          <img
            src={tenant.logo}
            alt={tenant.name}
            className="h-8 w-8 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            {tenant?.name?.charAt(0) || 'G'}
          </div>
        )}
        {!isCollapsed && tenant?.name && (
          <span className="font-semibold text-lg truncate">{tenant.name}</span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.href} 
            item={item} 
            isCollapsed={isCollapsed} 
            onClick={onItemClick} 
          />
        ))}
      </nav>

      <Separator />

      {/* User Profile Section */}
      <div
        className={cn(
          'border-t p-4',
          isCollapsed ? 'flex flex-col items-center' : ''
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3',
            isCollapsed ? 'flex-col' : ''
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-2 text-muted-foreground hover:text-foreground"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string | null;
  };
  tenant?: {
    name: string;
    logo?: string | null;
  };
  onLogout?: () => void;
}

export function Sidebar({ user, tenant, onLogout }: SidebarProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Mobile Sidebar using Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <NavContent 
            filteredNavItems={filteredNavItems}
            isCollapsed={false}
            tenant={tenant}
            user={user}
            onItemClick={() => setIsOpen(false)}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Sidebar
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-background transition-all duration-300 relative',
        isCollapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      <NavContent 
        filteredNavItems={filteredNavItems}
        isCollapsed={isCollapsed}
        tenant={tenant}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-[-12px] top-1/2 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}
