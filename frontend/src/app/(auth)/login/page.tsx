'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import api from '@/lib/api';

type AccountType = 'influencer' | 'business';

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>('influencer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', formData);

      if (data.requiresTwoFactor) {
        router.push(`/verify-2fa?userId=${data.userId}`);
        return;
      }

      // Check if user role matches selected account type
      const userRole = data.user.role;

      if (accountType === 'influencer' && userRole === 'business') {
        setError('This is a business account. Please switch to the Business tab to login.');
        setIsLoading(false);
        return;
      }

      if (accountType === 'business' && userRole === 'influencer') {
        setError('This is an influencer account. Please switch to the Influencer tab to login, or use a business email to create a new business account.');
        setIsLoading(false);
        return;
      }

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (userRole === 'influencer') {
        router.push('/dashboard');
      } else if (userRole === 'business') {
        router.push('/business/dashboard');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-secondary-600/90 z-10" />
        <img
          src={accountType === 'influencer'
            ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop"
            : "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1200&fit=crop"
          }
          alt={accountType === 'influencer' ? 'Influencers' : 'Business Team'}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-12">
          <div className="max-w-md text-center">
            {accountType === 'influencer' ? (
              <>
                <div className="text-6xl mb-6">💎</div>
                <h2 className="text-3xl font-bold mb-4">Welcome Back, Creator!</h2>
                <p className="text-lg text-white/90">
                  Sign in to access your campaigns, track earnings, and connect with brands.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-2xl font-bold">$40</p>
                    <p className="text-sm text-white/80">Per Sale</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-2xl font-bold">Daily</p>
                    <p className="text-sm text-white/80">Cashout</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-2xl font-bold">50K+</p>
                    <p className="text-sm text-white/80">Creators</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-3xl font-bold mb-4">Welcome Back, Business!</h2>
                <p className="text-lg text-white/90">
                  Sign in to manage campaigns, find influencers, and grow your brand.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-white/80">Campaigns</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-2xl font-bold">300%</p>
                    <p className="text-sm text-white/80">Avg ROI</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-2xl font-bold">4.9</p>
                    <p className="text-sm text-white/80">Rating</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="pb-0">
              {/* Account Type Tabs */}
              <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('influencer');
                    setError('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    accountType === 'influencer'
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Influencer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('business');
                    setError('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    accountType === 'business'
                      ? 'bg-white text-secondary-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Business
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className={`p-3 rounded-lg text-sm ${
                  accountType === 'influencer'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'bg-secondary-50 text-secondary-700 border border-secondary-200'
                }`}>
                  {accountType === 'influencer' ? (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Login with your influencer account email
                    </p>
                  ) : (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Login with your business account email
                    </p>
                  )}
                </div>

                <Input
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={accountType === 'influencer' ? 'your@email.com' : 'business@company.com'}
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className={accountType === 'business' ? 'bg-secondary-600 hover:bg-secondary-700' : ''}
                >
                  Sign In as {accountType === 'influencer' ? 'Influencer' : 'Business'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link href="/register/influencer">
                    <Button variant="outline" fullWidth size="sm" className="text-xs">
                      Sign up as Influencer
                    </Button>
                  </Link>
                  <Link href="/register/business">
                    <Button variant="outline" fullWidth size="sm" className="text-xs border-secondary-300 text-secondary-600 hover:bg-secondary-50">
                      Sign up as Business
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Info */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {accountType === 'influencer'
                ? 'Join 50K+ creators earning with us'
                : 'Trusted by 10K+ businesses worldwide'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
