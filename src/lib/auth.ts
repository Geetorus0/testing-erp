import { db } from '@/lib/db';
import { User, UserRole, Tenant } from '@prisma/client';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'geetorus-campusos-secret-key-2024';
const key = new TextEncoder().encode(JWT_SECRET);

export interface SessionUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  tenant?: {
    name: string;
    slug: string;
    logo?: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface SessionData {
  user: SessionUser;
  expiresAt: Date;
}

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// Create JWT token
export async function createToken(payload: SessionData): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) return null;
    
    const session = await verifyToken(token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    return session.user;
  } catch {
    return null;
  }
}

// Get user from request (for API routes)
export async function getUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  try {
    const token = request.cookies.get('session')?.value;
    
    if (!token) return null;
    
    const session = await verifyToken(token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    return session.user;
  } catch {
    return null;
  }
}

// Login function
export async function login(email: string, password: string): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    // Find user with tenant info (using findFirst since email is unique only within tenant)
    const user = await db.user.findFirst({
      where: { email },
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
          }
        }
      }
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if user is active
    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated' };
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return { success: false, error: 'Account is temporarily locked' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      // Increment failed attempts
      await db.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: user.failedAttempts + 1,
          lockedUntil: user.failedAttempts >= 4 ? new Date(Date.now() + 30 * 60 * 1000) : null // Lock for 30 mins after 5 failed attempts
        }
      });
      return { success: false, error: 'Invalid email or password' };
    }

    // Reset failed attempts and update last login
    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

    // Create session data
    const sessionUser: SessionUser = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      tenant: user.tenant
    };

    const sessionData: SessionData = {
      user: sessionUser,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    // Create token
    const token = await createToken(sessionData);

    // Store session in database
    await db.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken: token,
        expiresAt: sessionData.expiresAt
      }
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (token) {
      // Delete session from database
      await db.session.deleteMany({
        where: { token }
      });
    }
    
    // Clear cookie
    cookieStore.delete('session');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Role hierarchy for permission checks
export const roleHierarchy: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  PRINCIPAL: 90,
  DEAN: 80,
  HOD: 70,
  FACULTY: 50,
  MENTOR: 50,
  PLACEMENT_OFFICER: 60,
  FINANCE_OFFICER: 60,
  LIBRARIAN: 40,
  HOSTEL_WARDEN: 40,
  TRANSPORT_MANAGER: 40,
  STUDENT: 20,
  PARENT: 10
};

// Check if user has sufficient role level
export function hasRoleLevel(userRole: UserRole, minimumRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

// Get role permissions
export function getRolePermissions(role: UserRole): string[] {
  const basePermissions = ['read:profile', 'update:profile'];
  
  const rolePermissions: Record<UserRole, string[]> = {
    SUPER_ADMIN: [
      ...basePermissions,
      'manage:tenant', 'manage:users', 'manage:roles', 'manage:settings',
      'read:all', 'write:all', 'delete:all', 'manage:audit'
    ],
    PRINCIPAL: [
      ...basePermissions,
      'read:all', 'write:all', 'manage:departments', 'manage:faculty',
      'manage:students', 'read:analytics', 'read:audit'
    ],
    DEAN: [
      ...basePermissions,
      'read:departments', 'read:faculty', 'read:students', 'read:analytics',
      'write:departments', 'write:faculty', 'write:students'
    ],
    HOD: [
      ...basePermissions,
      'read:department', 'read:faculty', 'read:students', 'read:subjects',
      'write:department', 'write:faculty', 'write:students', 'write:subjects',
      'manage:attendance', 'manage:marks'
    ],
    FACULTY: [
      ...basePermissions,
      'read:students', 'read:subjects', 'read:materials',
      'write:attendance', 'write:marks', 'write:materials', 'write:assignments',
      'read:timetable'
    ],
    MENTOR: [
      ...basePermissions,
      'read:mentees', 'read:attendance', 'read:marks', 'read:portfolio',
      'write:counseling', 'read:parents'
    ],
    PLACEMENT_OFFICER: [
      ...basePermissions,
      'manage:companies', 'manage:drives', 'read:students', 'read:portfolio',
      'write:interviews', 'write:offers'
    ],
    FINANCE_OFFICER: [
      ...basePermissions,
      'manage:fees', 'manage:payments', 'manage:scholarships', 'read:finance'
    ],
    LIBRARIAN: [
      ...basePermissions,
      'manage:books', 'manage:issues', 'read:students'
    ],
    HOSTEL_WARDEN: [
      ...basePermissions,
      'manage:hostels', 'manage:rooms', 'manage:allocations', 'read:students'
    ],
    TRANSPORT_MANAGER: [
      ...basePermissions,
      'manage:buses', 'manage:routes', 'manage:allocations'
    ],
    STUDENT: [
      ...basePermissions,
      'read:attendance', 'read:marks', 'read:assignments', 'read:materials',
      'read:timetable', 'read:portfolio', 'write:portfolio', 'write:requests',
      'read:placement', 'read:fees', 'read:library'
    ],
    PARENT: [
      ...basePermissions,
      'read:child:attendance', 'read:child:marks', 'read:child:progress'
    ]
  };
  
  return rolePermissions[role] || basePermissions;
}
