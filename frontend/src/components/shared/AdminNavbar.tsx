'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: { label: string; href: string }[];
}

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      children: [
        { label: 'All Users', href: '/admin/users' },
        { label: 'Influencers', href: '/admin/users?role=influencer' },
        { label: 'Businesses', href: '/admin/users?role=business' },
        { label: 'Suspended', href: '/admin/users?status=banned' },
      ],
    },
    {
      label: 'Projects',
      href: '/admin/projects',
      icon: <FolderKanban className="w-5 h-5" />,
      children: [
        { label: 'All Projects', href: '/admin/projects' },
        { label: 'Pending Approval', href: '/admin/projects?status=pending' },
        { label: 'Active', href: '/admin/projects?status=active' },
        { label: 'Completed', href: '/admin/projects?status=completed' },
      ],
    },
    {
      label: 'Payments',
      href: '/admin/payments',
      icon: <CreditCard className="w-5 h-5" />,
      children: [
        { label: 'All Transactions', href: '/admin/payments' },
        { label: 'Pending Withdrawals', href: '/admin/payments?type=withdrawals' },
        { label: 'Settlements', href: '/admin/payments?type=settlements' },
      ],
    },
    {
      label: 'Chats',
      href: '/admin/chats',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: 'Safira',
      href: '/admin/safira',
      icon: <Shield className="w-5 h-5" />,
      children: [
        { label: 'Overview', href: '/admin/safira' },
        { label: 'Influencer Stats', href: '/admin/safira/influencers' },
        { label: 'Conversions', href: '/admin/safira/conversions' },
        { label: 'Settings', href: '/admin/safira/settings' },
      ],
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700 z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Admin Panel</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-white placeholder-slate-400 ml-2 w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="text-white text-sm hidden md:block">Admin</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-700 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedItem === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedItem === item.label && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === child.href.split('?')[0] && pathname.includes(child.href.split('?')[0])
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
