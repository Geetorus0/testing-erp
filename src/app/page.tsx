'use client';

import { useEffect, useState } from 'react';
import { useAuth, useIsAuthenticated, useUser } from '@/lib/store';
import { UserRole } from '@prisma/client';
import { Loader2, GraduationCap, Brain, Shield, Users, BookOpen, Briefcase, DollarSign, Bus, BedDouble, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

// Import dashboards
import { SuperAdminDashboard, PrincipalDashboard, DeanDashboard, HodDashboard, FacultyDashboard, StudentDashboard, ParentDashboard, PlacementDashboard, FinanceDashboard, LibraryDashboard, HostelDashboard, TransportDashboard } from '@/components/dashboards/RoleDashboards';
import StudentDashboardComponent from '@/components/student/StudentDashboard';
import FacultyDashboardComponent from '@/components/faculty/FacultyDashboard';
import HodDashboardComponent from '@/components/hod/HodDashboard';
import PrincipalDashboardComponent from '@/components/principal/PrincipalDashboard';
import PlacementDashboardComponent from '@/components/placement/PlacementDashboard';
import FinanceDashboardComponent from '@/components/finance/FinanceDashboard';
import LibraryDashboardComponent from '@/components/library/LibraryDashboard';
import HostelDashboardComponent from '@/components/hostel/HostelDashboard';
import TransportDashboardComponent from '@/components/transport/TransportDashboard';
import AIChatbot from '@/components/ai/AIChatbot';
import RiskPrediction from '@/components/ai/RiskPrediction';
import DigitalTwinView from '@/components/digital-twin/DigitalTwinView';

// Demo credentials
const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin@geetorus.edu', password: 'password123', icon: Shield, color: 'bg-red-500' },
  { role: 'Principal', email: 'principal@geetorus.edu', password: 'password123', icon: GraduationCap, color: 'bg-purple-500' },
  { role: 'Dean', email: 'dean@geetorus.edu', password: 'password123', icon: BookOpen, color: 'bg-indigo-500' },
  { role: 'HOD', email: 'hod.cse@geetorus.edu', password: 'password123', icon: Users, color: 'bg-blue-500' },
  { role: 'Faculty', email: 'faculty.cse1@geetorus.edu', password: 'password123', icon: BookOpen, color: 'bg-cyan-500' },
  { role: 'Student', email: 'student001@geetorus.edu', password: 'password123', icon: GraduationCap, color: 'bg-emerald-500' },
  { role: 'Placement', email: 'placement@geetorus.edu', password: 'password123', icon: Briefcase, color: 'bg-amber-500' },
  { role: 'Finance', email: 'finance@geetorus.edu', password: 'password123', icon: DollarSign, color: 'bg-green-500' },
  { role: 'Librarian', email: 'library@geetorus.edu', password: 'password123', icon: Library, color: 'bg-teal-500' },
  { role: 'Hostel', email: 'hostel@geetorus.edu', password: 'password123', icon: BedDouble, color: 'bg-orange-500' },
  { role: 'Transport', email: 'transport@geetorus.edu', password: 'password123', icon: Bus, color: 'bg-pink-500' },
];

function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    
    const result = await login(demoEmail, demoPassword);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Geetorus CampusOS
                </h1>
                <p className="text-sm text-muted-foreground">Enterprise College ERP SaaS</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              v1.0.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
          <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <div className="w-full">
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-500" />
                  Quick Demo Access
                </CardTitle>
                <CardDescription>
                  Click any role to instantly log in with demo credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <Button
                      key={account.role}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      onClick={() => handleDemoLogin(account.email, account.password)}
                      disabled={isLoading}
                    >
                      <div className={`p-1.5 rounded-lg ${account.color}`}>
                        <account.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">{account.role}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Platform Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Multi-Tenant SaaS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Role-Based Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>AI-Powered Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Digital Twin Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Risk Prediction AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Placement Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Finance & Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Library & Hostel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Transport Module</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>&copy; 2024 Geetorus CampusOS. All rights reserved.</p>
            <p>Enterprise College ERP SaaS Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPage() {
  const user = useUser();
  const { logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = user?.role as UserRole;
  const userName = user?.name || 'User';

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard userName={userName} activeMenu={activeMenu} />;
      case 'PRINCIPAL':
        return <PrincipalDashboardComponent />;
      case 'DEAN':
        return <DeanDashboard userName={userName} activeMenu={activeMenu} />;
      case 'HOD':
        return <HodDashboardComponent />;
      case 'FACULTY':
      case 'MENTOR':
        return <FacultyDashboardComponent />;
      case 'STUDENT':
        return <StudentDashboardComponent />;
      case 'PARENT':
        return <ParentDashboard userName={userName} activeMenu={activeMenu} />;
      case 'PLACEMENT_OFFICER':
        return <PlacementDashboardComponent />;
      case 'FINANCE_OFFICER':
        return <FinanceDashboardComponent />;
      case 'LIBRARIAN':
        return <LibraryDashboardComponent />;
      case 'HOSTEL_WARDEN':
        return <HostelDashboardComponent />;
      case 'TRANSPORT_MANAGER':
        return <TransportDashboardComponent />;
      default:
        return <StudentDashboardComponent />;
    }
  };

  // Get navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
    ];

    switch (role) {
      case 'STUDENT':
        return [
          ...baseItems,
          { id: 'attendance', label: 'Attendance', icon: Users },
          { id: 'academics', label: 'Academics', icon: BookOpen },
          { id: 'placement', label: 'Placement', icon: Briefcase },
          { id: 'ai', label: 'AI Assistant', icon: Brain },
          { id: 'twin', label: 'Digital Twin', icon: Users },
        ];
      case 'FACULTY':
      case 'MENTOR':
        return [
          ...baseItems,
          { id: 'attendance', label: 'Attendance', icon: Users },
          { id: 'marks', label: 'Marks', icon: BookOpen },
          { id: 'materials', label: 'Materials', icon: BookOpen },
        ];
      case 'HOD':
        return [
          ...baseItems,
          { id: 'faculty', label: 'Faculty', icon: Users },
          { id: 'students', label: 'Students', icon: GraduationCap },
          { id: 'analytics', label: 'Analytics', icon: Brain },
        ];
      case 'PRINCIPAL':
      case 'DEAN':
        return [
          ...baseItems,
          { id: 'departments', label: 'Departments', icon: Users },
          { id: 'faculty', label: 'Faculty', icon: BookOpen },
          { id: 'analytics', label: 'Analytics', icon: Brain },
          { id: 'risk', label: 'Risk Analysis', icon: Shield },
        ];
      case 'PLACEMENT_OFFICER':
        return [
          ...baseItems,
          { id: 'companies', label: 'Companies', icon: Briefcase },
          { id: 'drives', label: 'Drives', icon: Users },
          { id: 'offers', label: 'Offers', icon: DollarSign },
        ];
      case 'FINANCE_OFFICER':
        return [
          ...baseItems,
          { id: 'fees', label: 'Fees', icon: DollarSign },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
        ];
      case 'LIBRARIAN':
        return [
          ...baseItems,
          { id: 'books', label: 'Books', icon: Library },
          { id: 'issues', label: 'Issues', icon: BookOpen },
          { id: 'members', label: 'Members', icon: Users },
        ];
      case 'HOSTEL_WARDEN':
        return [
          ...baseItems,
          { id: 'rooms', label: 'Rooms', icon: BedDouble },
          { id: 'allocations', label: 'Allocations', icon: Users },
          { id: 'complaints', label: 'Complaints', icon: Shield },
        ];
      case 'TRANSPORT_MANAGER':
        return [
          ...baseItems,
          { id: 'buses', label: 'Buses', icon: Bus },
          { id: 'routes', label: 'Routes', icon: BookOpen },
          { id: 'allocations', label: 'Allocations', icon: Users },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-sm">CampusOS</h1>
                <p className="text-xs text-muted-foreground">Geetorus</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeMenu === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center'}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {sidebarOpen && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t space-y-2">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role?.replace('_', ' ').toLowerCase()}</p>
            </div>
          )}
          <Button 
            variant="outline" 
            className={`w-full ${!sidebarOpen && 'p-2'}`}
            onClick={logout}
          >
            {sidebarOpen ? 'Logout' : '→'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </Button>
              <div>
                <h2 className="text-xl font-bold capitalize">{activeMenu}</h2>
                <p className="text-sm text-muted-foreground">
                  {user?.tenant?.name || 'Geetorus Engineering College'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                {role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeMenu === 'ai' ? (
            <AIChatbot />
          ) : activeMenu === 'twin' ? (
            <DigitalTwinView />
          ) : activeMenu === 'risk' ? (
            <RiskPrediction />
          ) : (
            renderDashboard()
          )}
        </main>

        {/* Footer */}
        <footer className="bg-card border-t px-6 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 Geetorus CampusOS</p>
            <p>Enterprise College ERP SaaS</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const { setUser, clearUser, isLoading } = useAuth();

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            clearUser();
          }
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      }
    };
    
    checkAuth();
  }, [setUser, clearUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login or dashboard
  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}
