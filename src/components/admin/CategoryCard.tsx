'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
  };
  productCount: number;
}

export function CategoryCard({ category, productCount }: CategoryCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete category');
      setDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-32 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
            <Package className="h-12 w-12 text-primary-400" />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {category.description || 'No description'}
        </p>
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{productCount}</span> products
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/categories/${category.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
        </div>
      </CardContent>
    </Card>
  );
}
