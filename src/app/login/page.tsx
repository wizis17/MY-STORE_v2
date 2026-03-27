'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Chrome, Facebook } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data.user) {
        window.location.href = '/';
      }
    } catch (error: unknown) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (error: unknown) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <Link
        href="/"
        className="group absolute left-6 top-6 z-20 inline-flex items-center gap-2 font-semibold transition-all duration-200 hover:-translate-x-1 hover:opacity-90 lg:text-gray-600"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back</span>
      </Link>

      <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center lg:flex">
        <div className="rounded-full bg-white p-2 shadow-xl">
          <Image
            src="/images/circle-logo.png"
            alt="Flux circle logo"
            width={88}
            height={88}
            className="h-20 w-20 rounded-full object-cover"
            priority
          />
        </div>
      </div>

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#eeece8]  p-12 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="group relative w-80 h-80">
              {/* Main Shopping Bag */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-64 h-64 rounded-3xl flex items-center justify-center transform -rotate-6 shadow-2xl transition-all duration-300 border border-gray-300 bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/bg-login.jpg')" }}
                >
                  <Image
                    src="/images/login.png"
                    alt="Login"
                    width={220}
                    height={220}
                    className="object-contain grayscale brightness-90 contrast-90 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome Back!</h1>
          <p className="text-lg text-gray-600">
            Sign in to continue shopping
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Login Form Card */}
          <div className="bg-white">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Login</h2>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-800 hover:bg-white hover:text-gray-900 text-white font-semibold rounded-lg transition-all shadow-md border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Log in'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6 text-center text-sm text-gray-500">
              or continue with
            </div>

            {/* Social Login Icons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGoogleLogin}
                className="w-12 h-12 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-white transition-colors"
                title="Continue with Google"
              >
                <Chrome className="w-5 h-5 text-gray-600" />
              </button>
              <button
                className="w-12 h-12 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-white transition-colors"
                title="Continue with Facebook"
              >
                <Facebook className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-gray-800 font-semibold hover:text-black hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
