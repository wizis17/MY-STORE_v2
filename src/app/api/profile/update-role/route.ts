import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Update current user's own role
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the new role from request body
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    if (!['customer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "customer" or "admin"' }, { status: 400 });
    }

    // Update the user's own role
    const { data, error } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue
      .update({ role: role as 'customer' | 'admin' })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Role updated successfully',
      profile: data,
    });
  } catch (error) {
    console.error('Error in role update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
