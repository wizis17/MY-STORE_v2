import { createClient } from '@/lib/supabase/server';

export default async function AdminDebugPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Get profile if user exists
  let profile = null;
  let profileError = null;
  
  if (user) {
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    profile = result.data;
    profileError = result.error;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Access Debug</h1>
        
        {/* User Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {userError ? (
            <div className="text-red-600">
              <p className="font-semibold">Error:</p>
              <pre className="mt-2 p-4 bg-red-50 rounded overflow-auto">
                {JSON.stringify(userError, null, 2)}
              </pre>
            </div>
          ) : user ? (
            <div className="text-green-600">
              <p className="font-semibold">✓ Authenticated</p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            </div>
          ) : (
            <div className="text-yellow-600">
              <p>⚠ Not authenticated</p>
            </div>
          )}
        </div>

        {/* Profile Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Status</h2>
          {profileError ? (
            <div className="text-red-600">
              <p className="font-semibold">Error loading profile:</p>
              <pre className="mt-2 p-4 bg-red-50 rounded overflow-auto">
                {JSON.stringify(profileError, null, 2)}
              </pre>
            </div>
          ) : profile ? (
            <div>
              <p className="text-green-600 font-semibold mb-4">✓ Profile found</p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p className="text-lg">
                  <strong>Role:</strong>{' '}
                  <span className={`px-3 py-1 rounded-full ${
                    profile.role === 'admin' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.role}
                  </span>
                </p>
                <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600 hover:underline">
                  View full profile data
                </summary>
                <pre className="mt-2 p-4 bg-gray-50 rounded overflow-auto text-sm">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-yellow-600">
              <p>⚠ No profile found</p>
            </div>
          )}
        </div>

        {/* Admin Access Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Access Check</h2>
          {profile?.role === 'admin' ? (
            <div className="text-green-600">
              <p className="font-semibold text-lg">✓ You have admin access!</p>
              <div className="mt-4">
                <a 
                  href="/admin" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Admin Dashboard →
                </a>
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="font-semibold text-lg">✗ No admin access</p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800">What to do:</p>
                <ol className="mt-2 space-y-2 text-gray-700 list-decimal list-inside">
                  <li>Make sure you've executed the schema.sql in Supabase SQL Editor</li>
                  <li>Make sure your role is set to 'admin' in the profiles table</li>
                  <li>
                    <strong>Logout and login again</strong> to refresh your session
                    <div className="mt-2">
                      <a 
                        href="/api/auth/logout" 
                        className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Logout Now
                      </a>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <a 
              href="/" 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              ← Back to Home
            </a>
            <a 
              href="/profile" 
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              View Profile
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
