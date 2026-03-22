import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Update user role (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's profile to check if admin
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // @ts-expect-error - Supabase type inference issue
    if (profileError || !currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get the user ID and new role from request body
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    if (!['customer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "customer" or "admin"' }, { status: 400 });
    }

    // Update the user's role
    const { data, error } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue
      .update({ role: role as 'customer' | 'admin' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User role updated successfully', 
      profile: data 
    });
  } catch (error) {
    console.error('Error in role update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
