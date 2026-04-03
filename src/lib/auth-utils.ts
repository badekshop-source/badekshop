// src/lib/auth-utils.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { db } from './db';
import { profiles } from './db/schema';
import { eq } from 'drizzle-orm';

/**
 * Checks if the user has admin role
 * @param request - The NextRequest object
 * @returns Promise with session data if user is admin, null otherwise
 */
export async function requireAdminAuth(request: NextRequest) {
  try {
    // Get session using better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if session exists
    if (!session?.user) {
      return null;
    }

    // Check if user has admin role by querying the profiles table using email
    try {
      const userProfile = await db
        .select({ 
          id: profiles.id,
          role: profiles.role,
          name: profiles.name,
          email: profiles.email,
          phone: profiles.phone,
          address: profiles.address,
          createdAt: profiles.createdAt,
          updatedAt: profiles.updatedAt
        })
        .from(profiles)
        .where(eq(profiles.email, session.user.email))
        .limit(1);
      
      if (userProfile.length === 0 || userProfile[0].role !== 'admin') {
        return null;
      }
      
      // Return session with role information
      return {
        ...session,
        user: {
          ...session.user,
          id: userProfile[0].id, // Use the profile ID
          role: userProfile[0].role,
          name: userProfile[0].name,
          phone: userProfile[0].phone,
          address: userProfile[0].address,
          profileCreatedAt: userProfile[0].createdAt,
          profileUpdatedAt: userProfile[0].updatedAt
        }
      };
    } catch (error) {
      console.error('Error checking user role:', error);
      return null;
    }
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return null;
  }
}

/**
 * Generic function to require authentication
 * @param request - The NextRequest object
 * @returns Promise with session data if authenticated, null otherwise
 */
export async function requireAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
}

/**
 * Helper function to return unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

/**
 * Helper function to return forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}