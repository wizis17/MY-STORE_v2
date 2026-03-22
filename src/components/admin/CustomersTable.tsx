'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Mail, Users, Eye } from 'lucide-react';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  orders?: Array<{ count: number }>;
};

interface CustomersTableProps {
  customers: Profile[];
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const [profiles, setProfiles] = useState<Profile[]>(customers);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role?`)) {
      return;
    }

    setUpdating(userId);
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Update local state
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole as 'customer' | 'admin' } : p))
      );

      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      {profiles && profiles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((customer) => {
                const orderCount = customer.orders?.[0]?.count || 0;

                return (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                          <Image
                            src={customer.avatar_url}
                            alt={customer.full_name || 'Customer'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {customer.full_name?.charAt(0) || customer.email?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.full_name || 'No name'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{customer.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={customer.role === 'admin' ? 'warning' : 'default'}>
                        {customer.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={orderCount > 0 ? 'success' : 'default'}>
                        {orderCount} orders
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(customer.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleRoleChange(customer.id, customer.role)}
                          disabled={updating === customer.id}
                          size="sm"
                          variant="outline"
                        >
                          {updating === customer.id
                            ? 'Updating...'
                            : customer.role === 'admin'
                            ? 'Make Customer'
                            : 'Make Admin'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No users yet</p>
          <p className="text-sm text-gray-400 mt-1">Users will appear here once they sign up</p>
        </div>
      )}
    </>
  );
}
