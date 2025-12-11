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
                    No matter your size, start earning today
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

            {/* Right - Hero Image (shows first on mobile) */}
            <div className="relative order-first lg:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/hero.jpg"
                  alt="Influencer Marketing"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {/* Nike */}
            <svg className="h-8 w-auto text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.456 0-2.387-.588-2.787-1.764-.376-1.107.074-2.497 1.35-4.17-.034.206-.058.378-.058.512 0 .955.576 1.433 1.727 1.433.656 0 1.419-.205 2.291-.616L24 7.8z"/>
            </svg>
            {/* Adidas */}
            <svg className="h-8 w-auto text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.936 4L0 17.532h4.229l7.707-8.751V4zm.128 9.264L5.987 20h4.322l3.207-3.64v-3.096h-1.452zm4.227-4.808V20h3.709V8.456h-3.709z"/>
            </svg>
            {/* Apple */}
            <svg className="h-8 w-auto text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            {/* Google */}
            <svg className="h-8 w-auto text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {/* Meta */}
            <svg className="h-8 w-auto text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.001 2.002c-5.522 0-9.999 4.477-9.999 9.999 0 4.99 3.656 9.126 8.437 9.879v-6.988h-2.54v-2.891h2.54V9.798c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.238.195 2.238.195v2.459h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988c4.781-.753 8.437-4.889 8.437-9.879 0-5.522-4.477-9.999-9.999-9.999z"/>
            </svg>
            {/* Amazon */}
            <svg className="h-8 w-auto text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.143-.125-.16-.27-.106-.34zm6.565-5.942c0-1.32.323-2.4.97-3.236.645-.835 1.515-1.486 2.61-1.95 1.025-.428 2.272-.728 3.742-.9.664-.07 1.695-.136 3.088-.2V5.2c0-1.04-.125-1.775-.373-2.204-.352-.6-1.01-.9-1.973-.9-.858 0-1.524.21-1.994.635-.47.422-.774 1.1-.912 2.03-.03.176-.133.27-.308.285l-2.082-.234c-.193-.028-.29-.123-.29-.29.025-.57.1-1.044.22-1.422.286-.93.746-1.67 1.38-2.22.87-.755 2.08-1.132 3.63-1.132 1.418 0 2.55.27 3.4.807.945.616 1.485 1.49 1.615 2.62.048.414.073 1.116.073 2.105v5.15c0 .91.07 1.545.208 1.905.14.362.37.685.69.97.076.07.114.138.114.204a.3.3 0 01-.114.204l-1.6 1.324c-.112.093-.238.103-.378.03-.306-.21-.543-.424-.712-.644-.17-.22-.322-.5-.458-.84-.71.81-1.406 1.37-2.09 1.68-.795.363-1.695.544-2.7.544-1.08 0-1.97-.305-2.668-.912-.698-.608-1.047-1.485-1.047-2.63zm3.414-.6c0 .588.156 1.05.467 1.388.312.336.714.505 1.21.505.45 0 .884-.106 1.3-.316.416-.21.753-.53 1.01-.96.166-.274.28-.574.346-.897.064-.323.097-.808.097-1.456v-.755c-1.204 0-2.102.072-2.695.217-.95.236-1.735.855-1.735 2.275z"/>
            </svg>
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
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
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
