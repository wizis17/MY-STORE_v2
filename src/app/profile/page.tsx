import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Mail, Phone, Shield, LayoutDashboard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Type assertion for profile
  const typedProfile = profile as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: 'customer' | 'admin';
    created_at: string;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{typedProfile.full_name || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{typedProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{typedProfile.phone || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Role */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Current Role</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{typedProfile.role}</p>
                  {typedProfile.role === 'admin' && (
                    <p className="text-sm text-gray-600 mt-1">You have full administrative access</p>
                  )}
                </div>
                {typedProfile.role === 'admin' && (
                  <Link href="/admin">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Created */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">
                Account created on{' '}
                <span className="font-medium text-gray-900">
                  {new Date(typedProfile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
