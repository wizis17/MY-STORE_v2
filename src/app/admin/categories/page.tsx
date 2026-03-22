import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products:products(count)
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">Organize your products with categories</p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {categories?.length || 0}
            </div>
            <p className="text-sm text-gray-600">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {(categories as any[])?.filter(c => c.products && c.products.length > 0).length || 0}
            </div>
            <p className="text-sm text-gray-600">Active Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {(categories as any[])?.filter(c => !c.products || c.products.length === 0).length || 0}
            </div>
            <p className="text-sm text-gray-600">Empty Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: any) => {
                const productCount = category.products?.[0]?.count || 0;
                
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
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
                          <Button variant="ghost" size="sm">
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
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No categories yet</p>
              <Link href="/admin/categories/new">
                <Button className="mt-4">Add Your First Category</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
