import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Eye, Download, Filter, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = (orders as any[])?.filter(o => o.status === 'pending').length || 0;
  const processingOrders = (orders as any[])?.filter(o => o.status === 'processing').length || 0;
  const shippedOrders = (orders as any[])?.filter(o => o.status === 'shipped').length || 0;
  const deliveredOrders = (orders as any[])?.filter(o => o.status === 'delivered').length || 0;
  const totalRevenue = (orders as any[])?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-700">{pendingOrders}</div>
            <p className="text-sm text-yellow-700">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-700">{processingOrders}</div>
            <p className="text-sm text-blue-700">Processing</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-700">{shippedOrders}</div>
            <p className="text-sm text-purple-700">Shipped</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">{deliveredOrders}</div>
            <p className="text-sm text-green-700">Delivered</p>
          </CardContent>
        </Card>
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="pt-6">
            <div className="text-xl font-bold text-primary-700">{formatPrice(totalRevenue)}</div>
            <p className="text-sm text-primary-700">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
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
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-primary-600">{order.order_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user?.full_name || order.shipping_full_name}
                          </p>
                          <p className="text-sm text-gray-500">{order.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'shipped' ? 'info' :
                            order.status === 'processing' ? 'info' :
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
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start purchasing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
