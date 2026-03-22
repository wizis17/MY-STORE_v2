import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import CustomersTable from '@/components/admin/CustomersTable';
import { Users, ShoppingBag, Calendar, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Fetch all users (both customers and admins)
  const { data: customers, error } = await supabase
    .from('profiles')
    .select(`
      *,
      orders(count)
    `)
    .order('created_at', { ascending: false });

  console.log('=== CUSTOMERS PAGE DEBUG ===');
  console.log('Authenticated user:', user?.email);
  console.log('Customers error:', error);
  console.log('Customers data:', customers);
  console.log('Customers count:', customers?.length);

  const totalUsers = customers?.length || 0;
  const adminCount = customers?.filter((c: { role: string }) => c.role === 'admin').length || 0;
  const activeBuyers = customers?.filter((c: { orders?: { count: number }[] }) => c.orders && c.orders.length > 0).length || 0;
  const newThisMonth = customers?.filter((c: { created_at: string }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(c.created_at) >= thirtyDaysAgo;
  }).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">View and manage user accounts and roles</p>
        </div>
      </div>

      {/* Debug Info */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">Error:</p>
            <pre className="text-sm text-red-800 mt-2 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800 font-semibold">⚠️ Not logged in</p>
            <p className="text-sm text-yellow-700 mt-1">You need to log in to view this page</p>
          </CardContent>
        </Card>
      )}

      {user && !error && customers?.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-800 font-semibold">ℹ️ No data in database</p>
            <p className="text-sm text-blue-700 mt-1">
              Logged in as: <strong>{user.email}</strong>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              There are no users in the profiles table yet. Please sign up some users first.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalUsers}
                </div>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {adminCount}
                </div>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {activeBuyers}
                </div>
                <p className="text-sm text-gray-600">Active Buyers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {newThisMonth}
                </div>
                <p className="text-sm text-gray-600">New This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersTable customers={customers || []} />
        </CardContent>
      </Card>
    </div>
  );
}
