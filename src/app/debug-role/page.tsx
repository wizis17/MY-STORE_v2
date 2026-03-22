'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugRolePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setData({
        user: user,
        profile: profile,
        userRole: (profile as any)?.role,
      });
    }

    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Role Check</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">User ID:</h2>
        <p className="text-sm">{data?.user?.id}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">User Email:</h2>
        <p className="text-sm">{data?.user?.email}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Profile Role:</h2>
        <p className="text-2xl font-bold">{data?.userRole || 'NULL'}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Full Profile Data:</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(data?.profile, null, 2)}</pre>
      </div>

      {data?.userRole === 'admin' ? (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="font-bold text-green-800">✅ You ARE an admin!</p>
          <p className="text-sm mt-2">The Admin Dashboard link should appear in the header menu.</p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-red-100 rounded">
          <p className="font-bold text-red-800">❌ Role is not 'admin'</p>
          <p className="text-sm mt-2">Current role: {data?.userRole}</p>
        </div>
      )}
    </div>
  );
}
