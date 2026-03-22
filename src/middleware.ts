import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Import supabase here to check user role
    const { createServerClient } = await import('@supabase/ssr');
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      return Response.redirect(new URL('/login', request.url));
    }

    // Check if user has admin role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('🔐 Middleware check:', { 
      userId: user.id, 
      profile, 
      error,
      profileRole: profile?.role 
    });

    // TEMPORARILY DISABLED: Allow all logged-in users to access admin
    // TODO: Re-enable this after debugging
    /* 
    if (profile?.role !== 'admin') {
      return Response.redirect(new URL('/', request.url));
    }
    */
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
