'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    earnings: 0,
  });

  useEffect(() => {
    // Animate numbers on mount
    const targets = { users: 15420, projects: 3850, earnings: 2450000 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        users: Math.floor(targets.users * progress),
        projects: Math.floor(targets.projects * progress),
        earnings: Math.floor(targets.earnings * progress),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-600">
            Micro Influencer
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-primary-600 hover:text-primary-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Connect with Authentic Micro Influencers
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Grow your brand with genuine voices. Join thousands of businesses and
          influencers creating successful campaigns.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register?type=business"
            className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            I'm a Business
          </Link>
          <Link
            href="/register?type=influencer"
            className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            I'm an Influencer
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.users.toLocaleString()}+
            </div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.projects.toLocaleString()}+
            </div>
            <div className="text-gray-600">Completed Projects</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              ${(stats.earnings / 1000).toFixed(0)}K+
            </div>
            <div className="text-gray-600">Earned by Influencers</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose Our Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Verified Influencers"
            description="All influencers are verified with real engagement metrics from their social platforms."
            icon="✓"
          />
          <FeatureCard
            title="Secure Payments"
            description="Crypto-based escrow system ensures safe transactions for both parties."
            icon="🔒"
          />
          <FeatureCard
            title="Global Reach"
            description="Connect with influencers and businesses from around the world in 10 languages."
            icon="🌍"
          />
          <FeatureCard
            title="Real-time Chat"
            description="Direct communication between businesses and influencers for better collaboration."
            icon="💬"
          />
          <FeatureCard
            title="Task Management"
            description="Track deliverables with deadlines and approval workflows."
            icon="📋"
          />
          <FeatureCard
            title="Analytics Dashboard"
            description="Comprehensive insights into campaigns, earnings, and performance."
            icon="📊"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of successful campaigns today
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Micro Influencer</h3>
              <p className="text-gray-400">
                Connecting authentic voices with brands worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Businesses</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/case-studies">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Influencers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/how-it-works">How It Works</Link></li>
                <li><Link href="/success-stories">Success Stories</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2024 Micro Influencer Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
