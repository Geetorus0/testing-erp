'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@prisma/client';

// Types
export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface UserSession {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  tenant?: TenantInfo;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// App State Interface
interface AppState {
  // User Session State
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Tenant State
  tenant: TenantInfo | null;
  
  // Sidebar State
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme Preferences
  theme: 'light' | 'dark' | 'system';
  
  // Notification State
  notifications: NotificationItem[];
  unreadCount: number;
  
  // Actions - User
  setUser: (user: UserSession | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  
  // Actions - Tenant
  setTenant: (tenant: TenantInfo | null) => void;
  
  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Actions - Notifications
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setUnreadCount: (count: number) => void;
  
  // Actions - Auth
  login: (user: UserSession) => void;
  logout: () => void;
}

// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  tenant: null,
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'system' as const,
  notifications: [],
  unreadCount: 0,
};

// Create Store with Persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // User Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        tenant: user?.tenant || null,
        isLoading: false 
      }),
      
      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false, 
        tenant: null,
        notifications: [],
        unreadCount: 0,
        isLoading: false 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      // Tenant Actions
      setTenant: (tenant) => set({ tenant }),
      
      // Sidebar Actions
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebarCollapse: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      
      // Theme Actions
      setTheme: (theme) => set({ theme }),
      
      // Notification Actions
      setNotifications: (notifications) => set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.read).length 
      }),
      
      addNotification: (notification) => {
        const newNotification: NotificationItem = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),
      
      clearNotifications: () => set({ 
        notifications: [], 
        unreadCount: 0 
      }),
      
      setUnreadCount: (count) => set({ unreadCount: count }),
      
      // Auth Actions
      login: (user) => set({ 
        user, 
        isAuthenticated: true, 
        tenant: user.tenant || null,
        isLoading: false 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        tenant: null,
        notifications: [],
        unreadCount: 0,
        isLoading: false 
      }),
    }),
    {
      name: 'geetorus-campusos-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selector Hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useTenant = () => useAppStore((state) => state.tenant);
export const useSidebar = () => useAppStore((state) => ({
  open: state.sidebarOpen,
  collapsed: state.sidebarCollapsed,
  toggle: state.toggleSidebar,
  setOpen: state.setSidebarOpen,
  toggleCollapse: state.toggleSidebarCollapse,
  setCollapsed: state.setSidebarCollapsed,
}));
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => ({
  items: state.notifications,
  unreadCount: state.unreadCount,
  add: state.addNotification,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  clear: state.clearNotifications,
  setItems: state.setNotifications,
  setUnreadCount: state.setUnreadCount,
}));

// Auth Actions Hook
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading, login, logout } = useAppStore();
  
  const fetchCurrentUser = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      clearUser();
    }
  };
  
  const performLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.user) {
        login(data.user);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'An error occurred during login' };
    }
  };
  
  const performLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login: performLogin,
    logout: performLogout,
    fetchCurrentUser,
    setUser,
    clearUser,
  };
};

export default useAppStore;
