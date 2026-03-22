'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Chrome, Facebook } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        alert('Account created successfully! Welcome!');
        window.location.href = '/';
      }
    } catch (error: unknown) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      <div className="hidden lg:flex lg:w-1/2 bg-[#eeece8] p-12 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="group relative w-80 h-80">
              {/* Main Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-gray-400 to-gray-600 group-hover:from-cyan-400 group-hover:to-blue-400 rounded-3xl flex items-center justify-center transform -rotate-6 shadow-2xl transition-colors duration-300 border border-gray-300">
                  <Image
                    src="/images/login.png"
                    alt="Sign Up"
                    width={220}
                    height={220}
                    className="object-contain grayscale brightness-90 contrast-90 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Join Us Today!</h1>
          <p className="text-lg text-gray-600">
            Start your shopping journey now
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Signup Form Card */}
          <div className="bg-white">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Sign up</h2>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-5 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

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
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-800 hover:bg-white hover:text-gray-900 text-white font-semibold rounded-lg transition-all shadow-md border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            {/* Terms */}
            <div className="mt-4 text-center text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-cyan-600 hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-cyan-600 hover:underline">
                Privacy Policy
              </Link>
            </div>

            {/* Divider */}
            <div className="mt-8 mb-6 text-center text-sm text-gray-500">
              or continue with
            </div>

            {/* Social Signup Icons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGoogleSignup}
                className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Continue with Google"
              >
                <Chrome className="w-5 h-5 text-gray-600" />
              </button>
              <button
                className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Continue with Facebook"
              >
                <Facebook className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-600 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
