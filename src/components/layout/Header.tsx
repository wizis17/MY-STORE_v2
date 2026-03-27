'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Package, Home, LogOut, UserCircle, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type ProfileRole = {
  role: 'customer' | 'admin';
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined);
  const [userRole, setUserRole] = useState<'customer' | 'admin' | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const applyAuthState = async (nextUser: SupabaseUser | null) => {
      if (!isMounted) return;

      setUser(nextUser);

      if (!nextUser) {
        setUserRole(null);
        setIsAuthReady(true);
        return;
      }

      // Fetch user's role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextUser.id)
        .single();

      if (!isMounted) return;

      if (error) {
        console.error('Profile fetch error:', error);
      }

      const role = (profile as ProfileRole | null)?.role || 'customer';
      setUserRole(role);
      setIsAuthReady(true);
    };

    // Get initial session quickly so header doesn't show wrong auth state
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Session fetch error:', error);
      }

      void applyAuthState(data.session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyAuthState(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    setUser(null);
    setUserRole(null);
    setIsAuthReady(true);

    try {
      // Call logout API to clear server-side cookies
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect to home and force reload
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#eeece8] shadow-sm">
      <div className="container-padding mx-auto">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-start">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-coral transition-colors">
                <span>All Products</span>
              </Link>
              <Link href="/contact" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-coral transition-colors">
                <span>Contact Us</span>
              </Link>
            </nav>
          </div>

          <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="Flux Logo" width={80} height={40} />
          </Link>

          <div className="flex items-center justify-end space-x-3">
            {!isAuthReady ? (
              <div className="hidden md:block h-10 w-28 rounded-lg bg-gray-100 animate-pulse" />
            ) : user ? (
              <>
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <UserCircle className="h-5 w-5 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.full_name || 'Account'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hidden md:inline-flex items-center justify-center rounded-md gap-2 text-[12px] font-semibold uppercase italic tracking-[0.25em] px-6 py-3 bg-black text-white hover:bg-black/80 transition-colors"
                >
                  Log in
                </Link>
              </>
            )}

            <Link 
              href="/cart"
              className="relative hidden md:inline-flex h-10 w-10 items-center justify-center rounded-md font-medium transition-colors hover:bg-gray-100 text-gray-900"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-coral text-xs text-white flex items-center justify-center font-bold">
                  {totalItems()}
                </span>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="md:hidden fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <div className="flex w-fit items-center gap-3 rounded-full border border-sky-100 bg-white px-3 py-2 shadow-[0_10px_30px_rgba(46,84,150,0.18)]">
            {/* All Products — left */}
            <Link
              href="/products"
              aria-label="All products"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Package className="h-5 w-5" />
            </Link>
            {/* Home — center, highlighted */}
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition-colors hover:bg-sky-200"
            >
              <Home className="h-5 w-5" />
            </Link>
            {/* Cart — right */}
            <Link
              href="/cart"
              aria-label="Open cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-coral px-1 text-xs text-white flex items-center justify-center font-bold">
                  {totalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="space-y-2">
                {!isAuthReady ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading account...</div>
                ) : user ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || 'Account'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {userRole === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium transition-colors w-full border border-blue-300 bg-white text-blue-600 hover:bg-blue-50"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      href="/profile" 
                      className="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 w-full"
                    >
                      Log in
                    </Link>
                  </>
                )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
