import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      images:product_images(image_url),
      variants:product_variants(quantity)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 italic">Products</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 border border-gray-200 rounded-sm">
          <div className="text-3xl font-bold text-gray-900 italic">{products?.length || 0}</div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">Total</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-sm">
          <div className="text-3xl font-bold text-green-600 italic">{(products as any[])?.filter(p => p.status === 'active').length || 0}</div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">Active</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-sm">
          <div className="text-3xl font-bold text-yellow-600 italic">{(products as any[])?.filter(p => p.status === 'draft').length || 0}</div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">Draft</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-sm">
          <div className="text-3xl font-bold text-gray-600 italic">{(products as any[])?.filter(p => p.status === 'archived').length || 0}</div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">Archived</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-gray-200 rounded-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 italic">All Products</h2>
        </div>
        {products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Sizes</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Colors</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Price</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Stock</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => {
                    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0;
                    const firstImage = product.images?.[0]?.image_url;
                    
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {firstImage ? (
                              <Image
                                src={firstImage}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {product.category?.name || 'Uncategorized'}
                        </td>
                        <td className="py-3 px-4">
                          {product.available_sizes && product.available_sizes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.available_sizes.map((size: string) => (
                                <span key={size} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                                  {size}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {product.available_colors && product.available_colors.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {product.available_colors.map((color: string) => (
                                <div key={color} className="flex items-center gap-1">
                                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{
                                    backgroundColor: color.toLowerCase() === 'black' ? '#000' :
                                                     color.toLowerCase() === 'white' ? '#fff' :
                                                     color.toLowerCase() === 'navy' ? '#001f3f' :
                                                     color.toLowerCase() === 'red' ? '#dc2626' :
                                                     color.toLowerCase() === 'blue' ? '#2563eb' :
                                                     color.toLowerCase() === 'green' ? '#16a34a' :
                                                     color.toLowerCase() === 'gray' ? '#6b7280' :
                                                     color.toLowerCase() === 'beige' ? '#f5f5dc' :
                                                     '#e5e7eb'
                                  }}></div>
                                  <span className="text-xs text-gray-600">{color}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              product.status === 'active' ? 'success' :
                              product.status === 'draft' ? 'warning' :
                              'default'
                            }
                          >
                            {product.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={totalStock === 0 ? 'destructive' : totalStock < 10 ? 'warning' : 'success'}
                          >
                            {totalStock} units
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/products/${product.slug}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
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
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No products yet</p>
            <Link href="/admin/products/new">
              <Button>Add Your First Product</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
