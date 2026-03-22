'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setData({
        user: user,
        userError: userError?.message,
        profile: profile,
        profileError: profileError?.message,
      });
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Debug Info</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Auth User:</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(data?.user, null, 2)}</pre>
        {data?.userError && <p className="text-red-600 mt-2">Error: {data.userError}</p>}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Profile Data:</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(data?.profile, null, 2)}</pre>
        {data?.profileError && <p className="text-red-600 mt-2">Error: {data.profileError}</p>}
      </div>

      {!data?.profile && !data?.profileError && (
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <p className="font-bold">⚠️ No profile found!</p>
          <p className="text-sm mt-2">The profile record doesn't exist in the database. The trigger might not have fired.</p>
        </div>
      )}
    </div>
  );
}
