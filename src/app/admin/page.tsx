import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Star,
  PackageOpen,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch comprehensive dashboard stats
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: recentReviews },
    { data: categories },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase
      .from('orders')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('product_variants')
      .select('*, product:products(name, slug)')
      .lte('quantity', 5)
      .limit(5),
    supabase
      .from('reviews')
      .select('*, user:profiles(full_name), product:products(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('categories').select('*'),
    supabase.from('orders').select('total, created_at, payment_status'),
  ]);

  // Calculate total revenue (only paid orders)
  const totalRevenue = (allOrders as any[])?.filter(o => o.payment_status === 'paid').reduce((sum, order) => sum + Number(order.total), 0) || 0;
  
  // Calculate this month's revenue
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);
  
  const thisMonthRevenue = (allOrders as any[])
    ?.filter(o => o.payment_status === 'paid' && new Date(o.created_at) >= thisMonthStart)
    .reduce((sum, order) => sum + Number(order.total), 0) || 0;

  const averageOrderValue = totalOrders ? totalRevenue / (totalOrders || 1) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <Button variant="outline">Add Product</Button>
          </Link>
          <Link href="/admin/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-sm text-white/80 mt-1">
              {formatPrice(thisMonthRevenue)} this month
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalOrders || 0}</div>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 text-orange-500 mr-1" />
              <p className="text-sm text-gray-600">{pendingOrders || 0} pending</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
            <Package className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalProducts || 0}</div>
            <p className="text-sm text-gray-600 mt-1">{activeProducts || 0} active</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCustomers || 0}</div>
            <p className="text-sm text-gray-600 mt-1">
              Avg order: {formatPrice(averageOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(lowStockProducts && lowStockProducts.length > 0) || (recentReviews && recentReviews.length > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((variant: any) => (
                    <div key={variant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{variant.product?.name}</p>
                        <p className="text-sm text-gray-600">
                          {variant.size} - {variant.color}
                        </p>
                      </div>
                      <Badge variant={variant.quantity === 0 ? 'destructive' : 'warning'}>
                        {variant.quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Reviews */}
          {recentReviews && recentReviews.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Star className="h-5 w-5 mr-2 text-blue-600" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReviews.map((review: any) => (
                    <div key={review.id} className="p-3 bg-white rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.product?.name}</p>
                          <p className="text-sm text-gray-600">{review.user?.full_name}</p>
                        </div>
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Alerts Section */}
      {(lowStockProducts && lowStockProducts.length > 0) || (recentReviews && recentReviews.length > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((variant: any) => (
                    <div key={variant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{variant.product?.name}</p>
                        <p className="text-sm text-gray-600">
                          {variant.size} - {variant.color}
                        </p>
                      </div>
                      <Badge variant={variant.quantity === 0 ? 'destructive' : 'warning'}>
                        {variant.quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Reviews */}
          {recentReviews && recentReviews.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Star className="h-5 w-5 mr-2 text-blue-600" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReviews.map((review: any) => (
                    <div key={review.id} className="p-3 bg-white rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.product?.name}</p>
                          <p className="text-sm text-gray-600">{review.user?.full_name}</p>
                        </div>
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Categories Overview */}
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Categories</CardTitle>
              <Link href="/admin/categories">
                <Button variant="outline" size="sm">Manage All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category: any) => (
                <div key={category.id} className="p-4 bg-gray-50 rounded-lg border hover:border-primary-300 transition-colors">
                  <p className="font-semibold text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{category.slug}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-primary-600">{order.order_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.full_name || order.shipping_full_name}</p>
                          <p className="text-sm text-gray-500">{order.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'shipped' ? 'info' :
                            'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            order.payment_status === 'paid' ? 'success' :
                            order.payment_status === 'failed' ? 'destructive' :
                            'warning'
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <PackageOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start purchasing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
