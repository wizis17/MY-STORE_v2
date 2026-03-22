'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shield, UserCircle } from 'lucide-react';

interface ProfileRoleSelectorProps {
  currentRole: 'customer' | 'admin';
}

export default function ProfileRoleSelector({ currentRole }: ProfileRoleSelectorProps) {
  const [role, setRole] = useState<'customer' | 'admin'>(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: 'customer' | 'admin') => {
    if (newRole === role) return;

    const confirmMessage =
      newRole === 'admin'
        ? 'Switch to Admin role? You will have full access to the admin dashboard.'
        : 'Switch to Customer role? You will lose access to the admin dashboard.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch('/api/profile/update-role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      setRole(newRole);
      alert(`Role updated to ${newRole} successfully! Refreshing page...`);
      
      // Refresh the page to update session
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Role Display */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {role === 'admin' ? (
            <Shield className="h-6 w-6 text-orange-600" />
          ) : (
            <UserCircle className="h-6 w-6 text-blue-600" />
          )}
          <div>
            <p className="text-sm text-gray-500">Current Role</p>
            <p className="font-semibold text-gray-900 capitalize">{role}</p>
          </div>
        </div>
        <Badge variant={role === 'admin' ? 'warning' : 'info'}>{role}</Badge>
      </div>

      {/* Role Description */}
      <div className="space-y-3">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Customer Role</h3>
          </div>
          <p className="text-sm text-gray-600">
            Standard user access. Browse products, make purchases, and manage your orders.
          </p>
        </div>

        <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Admin Role</h3>
          </div>
          <p className="text-sm text-gray-600">
            Full administrative access. Manage products, categories, orders, and user accounts.
          </p>
        </div>
      </div>

      {/* Role Switch Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleRoleChange('customer')}
          disabled={isUpdating || role === 'customer'}
          variant={role === 'customer' ? 'default' : 'outline'}
          className="flex-1"
        >
          <UserCircle className="h-4 w-4 mr-2" />
          Switch to Customer
        </Button>
        <Button
          onClick={() => handleRoleChange('admin')}
          disabled={isUpdating || role === 'admin'}
          variant={role === 'admin' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Shield className="h-4 w-4 mr-2" />
          Switch to Admin
        </Button>
      </div>

      {isUpdating && (
        <p className="text-center text-sm text-gray-500">Updating role...</p>
      )}
    </div>
  );
}
