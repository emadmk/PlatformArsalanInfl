'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { Card, CardContent } from '@/components/shared/Card';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Micro Collaboration
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  How It Works
                </a>
                <a href="#guarantee" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Guarantee
                </a>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-sm font-semibold">
                🚀 The Future of Media Marketing
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Connect Brands with
              <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
                Authentic Influencers
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate platform for influencer marketing campaigns with transparent pricing,
              secure crypto payments, and real-time collaboration.
            </p>
            {/* Influencer Hero Image */}
            <div className="mb-8 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Influencers with phones"
                className="rounded-2xl shadow-2xl w-full max-w-md"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600 mb-2">Join 50K+ Creators</p>
                <Link href="/register/influencer">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                    Join as Influencer
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-secondary-600 mb-2">Lowest Price, Highest Effect</p>
                <Link href="/register/business">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 py-6 text-lg">
                    Start as Business
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '50K+', label: 'Active Influencers', icon: '👥' },
              { value: '10K+', label: 'Campaigns Completed', icon: '✨' },
              { value: '$10M+', label: 'Total Paid Out', icon: '💰' },
              { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
            ].map((stat, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for both influencers and businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔐',
                title: 'Crypto Payments',
                description: 'Secure USDT payments on Ethereum, BSC, and Tron networks with instant settlements',
              },
              {
                icon: '✅',
                title: 'Verified Influencers',
                description: 'All influencers verified through official social media APIs for authenticity',
              },
              {
                icon: '💬',
                title: 'Real-time Chat',
                description: 'Direct messaging with typing indicators and read receipts for seamless communication',
              },
              {
                icon: '📊',
                title: 'Advanced Analytics',
                description: 'Track campaign performance, ROI, and engagement metrics in real-time',
              },
              {
                icon: '🌍',
                title: 'World Wide',
                description: 'Connect with influencers and brands from around the globe',
              },
              {
                icon: '🛡️',
                title: 'Secure & Trusted',
                description: 'Enterprise-grade security with escrow system for safe transactions',
              },
            ].map((feature, index) => (
              <Card key={index} hover className="group">
                <CardContent className="p-8">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Influencers */}
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-8 flex items-center">
                <span className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  💰
                </span>
                Make Money
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Create Your Profile', desc: 'Sign up and connect your social media accounts' },
                  { step: '2', title: 'Get Verified', desc: 'Complete verification to unlock all features' },
                  { step: '3', title: 'Browse Projects', desc: 'Find campaigns that match your niche' },
                  { step: '4', title: 'Apply & Collaborate', desc: 'Work with brands and complete tasks' },
                  { step: '5', title: 'Get Paid', desc: 'Receive secure crypto payments instantly' },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Businesses */}
            <div>
              <h3 className="text-2xl font-bold text-secondary-600 mb-8 flex items-center">
                <span className="bg-secondary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  🚀
                </span>
                Improve Your Brand
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Create Account', desc: 'Register your business and complete profile' },
                  { step: '2', title: 'Create Campaign', desc: 'Set up your influencer marketing campaign' },
                  { step: '3', title: 'Find Influencers', desc: 'Search and filter verified influencers' },
                  { step: '4', title: 'Manage Projects', desc: 'Review applications and approve influencers' },
                  { step: '5', title: 'Track Results', desc: 'Monitor performance with detailed analytics' },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section id="guarantee" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Trust, Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We guarantee your satisfaction and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card hover className="border-2 border-green-200 text-center">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Money Back</h3>
                <p className="text-gray-600">
                  Not satisfied? Get a full refund. We stand behind our platform and your success.
                </p>
              </CardContent>
            </Card>

            <Card hover className="border-2 border-blue-200 text-center">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Payments</h3>
                <p className="text-gray-600">
                  Your funds are protected with our secure escrow system. Safe transactions guaranteed.
                </p>
              </CardContent>
            </Card>

            <Card hover className="border-2 border-purple-200 text-center">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Payouts</h3>
                <p className="text-gray-600">
                  Influencers get paid instantly. No waiting, no delays. Your earnings, your way.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of influencers and businesses already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100 border-0 px-8 py-6 text-lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 border-2 border-white px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-4">
                Micro Collaboration
              </h3>
              <p className="text-gray-400 text-sm">
                The ultimate platform for connecting brands with authentic micro-influencers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#guarantee" className="hover:text-white transition-colors">Guarantee</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 Micro Collaboration. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
