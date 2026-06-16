import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Try to get user from request (for API routes) or from session
    let user = await getUserFromRequest(request);
    
    if (!user) {
      user = await getCurrentUser();
    }
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated',
          user: null 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user API error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred', user: null },
      { status: 500 }
    );
  }
}
