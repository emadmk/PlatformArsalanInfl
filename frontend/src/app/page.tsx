'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  const brandLogos = [
    { name: 'Nike', color: 'text-gray-700' },
    { name: 'Adidas', color: 'text-gray-700' },
    { name: 'Apple', color: 'text-gray-700' },
    { name: 'Samsung', color: 'text-gray-700' },
    { name: 'Amazon', color: 'text-gray-700' },
    { name: 'Google', color: 'text-gray-700' },
  ];

  const influencerReviews = [
    {
      name: 'Sarah Johnson',
      role: 'Lifestyle Influencer',
      followers: '45K followers',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      review: 'I started with just 5K followers and now earn $2,000+ monthly. This platform changed my life!',
      rating: 5,
      earnings: '$8,500',
    },
    {
      name: 'Mike Chen',
      role: 'Food Blogger',
      followers: '28K followers',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      review: 'The daily cashout feature is amazing. I get paid instantly for every campaign.',
      rating: 5,
      earnings: '$5,200',
    },
    {
      name: 'Emma Davis',
      role: 'Fashion Creator',
      followers: '62K followers',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      review: 'Best platform for micro-influencers. Brands actually value authentic engagement here.',
      rating: 5,
      earnings: '$12,300',
    },
  ];

  const businessReviews = [
    {
      name: 'TechStart Inc.',
      role: 'SaaS Company',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      review: 'We got 300% ROI on our first campaign. The micro-influencers here have real engagement.',
      rating: 5,
      campaigns: 15,
    },
    {
      name: 'BeautyBox Co.',
      role: 'E-commerce Brand',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
      review: 'Finding the right influencers used to take weeks. Now it takes minutes. Amazing platform!',
      rating: 5,
      campaigns: 32,
    },
    {
      name: 'FitLife Nutrition',
      role: 'Health & Wellness',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
      review: 'The verified influencer system gives us confidence. No fake followers, real results.',
      rating: 5,
      campaigns: 24,
    },
  ];

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
                <a href="#reviews" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Reviews
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-4">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-sm font-semibold">
                  The Future of Media Marketing
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Connect Brands with
                <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
                  Authentic Influencers
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The ultimate platform for influencer marketing campaigns with transparent pricing,
                secure crypto payments, and real-time collaboration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-primary-600 mb-2">
                    Size doesn't matter. Your voice does. Start earning today.
                  </p>
                  <Link href="/register/influencer">
                    <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                      Free Influencer Account
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-secondary-600 mb-2">
                    Lowest Price, Highest Effect
                  </p>
                  <Link href="/register/business">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg">
                      Free Business Account
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/hero.jpg"
                  alt="Influencer Marketing"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">$10M+</p>
                    <p className="text-sm text-gray-500">Paid to Creators</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">50K+</p>
                    <p className="text-sm text-gray-500">Active Creators</p>
                  </div>
                </div>
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

      {/* Brand Logos */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-8 text-sm font-medium">TRUSTED BY LEADING BRANDS WORLDWIDE</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {brandLogos.map((brand, index) => (
              <div key={index} className="text-2xl font-bold text-gray-300 hover:text-gray-500 transition-colors">
                {brand.name}
              </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: '🔐',
                    title: 'Crypto Payments',
                    description: 'Secure USDT payments on Ethereum, BSC, and Tron networks',
                  },
                  {
                    icon: '✅',
                    title: 'Verified Influencers',
                    description: 'All influencers verified through official social media APIs',
                  },
                  {
                    icon: '💬',
                    title: 'Real-time Chat',
                    description: 'Direct messaging with typing indicators and read receipts',
                  },
                  {
                    icon: '📊',
                    title: 'Advanced Analytics',
                    description: 'Track campaign performance, ROI, and engagement metrics',
                  },
                ].map((feature, index) => (
                  <Card key={index} hover className="group">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop"
                alt="Dashboard Analytics"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1552581234-26160f608093?w=600&h=400&fit=crop"
                alt="Team Collaboration"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: '🌍',
                    title: 'World Wide',
                    description: 'Connect with influencers and brands from around the globe',
                  },
                  {
                    icon: '🛡️',
                    title: 'Secure & Trusted',
                    description: 'Enterprise-grade security with escrow system',
                  },
                  {
                    icon: '⚡',
                    title: 'Instant Payouts',
                    description: 'Get paid instantly after campaign completion',
                  },
                  {
                    icon: '🎯',
                    title: 'Smart Matching',
                    description: 'AI-powered matching with the right brands',
                  },
                ].map((feature, index) => (
                  <Card key={index} hover className="group">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
            <div className="bg-white rounded-2xl p-8 shadow-lg">
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
            <div className="bg-white rounded-2xl p-8 shadow-lg">
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

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real creators and businesses
            </p>
          </div>

          {/* Influencer Reviews */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-primary-600 mb-8 text-center">Influencer Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {influencerReviews.map((review, index) => (
                <Card key={index} hover className="bg-gradient-to-br from-primary-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary-200"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.role}</p>
                        <p className="text-xs text-primary-600">{review.followers}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{review.review}"</p>
                    <div className="bg-green-100 rounded-lg px-3 py-2 inline-block">
                      <span className="text-green-700 font-bold">Total Earned: {review.earnings}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Business Reviews */}
          <div>
            <h3 className="text-2xl font-bold text-secondary-600 mb-8 text-center">Business Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {businessReviews.map((review, index) => (
                <Card key={index} hover className="bg-gradient-to-br from-secondary-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-secondary-200"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{review.review}"</p>
                    <div className="bg-blue-100 rounded-lg px-3 py-2 inline-block">
                      <span className="text-blue-700 font-bold">{review.campaigns} Campaigns Completed</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section id="guarantee" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Trust, Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We guarantee your satisfaction and security
            </p>
          </div>

          {/* Daily Cashout Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-12 text-center text-white max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold">Daily Cashout Available!</h3>
            </div>
            <p className="text-green-100 text-lg">
              Withdraw your earnings every day. No minimum waiting period for everyone!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card hover className="border-2 border-green-200 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">100% Money Back</h3>
                <p className="text-gray-600 text-sm">
                  Not satisfied? Get a full refund. We stand behind your success.
                </p>
              </CardContent>
            </Card>

            <Card hover className="border-2 border-blue-200 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600 text-sm">
                  Your funds are protected with our secure escrow system.
                </p>
              </CardContent>
            </Card>

            <Card hover className="border-2 border-purple-200 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Payouts</h3>
                <p className="text-gray-600 text-sm">
                  Cashout every day. No waiting, no delays. Your earnings, your way.
                </p>
              </CardContent>
            </Card>

            <Card hover className="border-2 border-orange-200 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast & Easy</h3>
                <p className="text-gray-600 text-sm">
                  Simple process. Start earning within minutes of signing up.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
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
