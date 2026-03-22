import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Tags } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen fixed h-full overflow-y-auto">
          <div className="p-6 border-b">
            <Link href="/admin">
              <h2 className="text-xl font-bold text-primary-600">Admin Panel</h2>
            </Link>
          </div>
          <nav className="px-4 py-6 space-y-2">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Package className="h-5 w-5" />
              <span>Products</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Tags className="h-5 w-5" />
              <span>Categories</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Orders</span>
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Customers</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </div>
  );
}
