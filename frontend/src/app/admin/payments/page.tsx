'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';
import {
  Search,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface Transaction {
  _id: string;
  type: 'payment' | 'withdrawal' | 'refund' | 'settlement';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  projectId?: {
    _id: string;
    title: string;
  };
  description?: string;
  paymentMethod?: string;
  walletAddress?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

interface Withdrawal {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  walletAddress: string;
  network?: string;
  txHash?: string;
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
}

function AdminPaymentsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('type') === 'withdrawals' ? 'withdrawals' : 'transactions';

  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals' | 'settlements'>(initialTab as any);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Transaction | Withdrawal | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [txHash, setTxHash] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingWithdrawals: 0,
    totalWithdrawals: 0,
    platformFees: 0,
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [page, statusFilter, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10, sort: '-createdAt' };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (activeTab === 'withdrawals') {
        const { data } = await api.get('/admin/withdrawals', { params });
        setWithdrawals(data.withdrawals || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        params.type = activeTab === 'settlements' ? 'settlement' : undefined;
        const { data } = await api.get('/admin/transactions', { params });
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (activeTab === 'withdrawals') {
        setWithdrawals([]);
      } else {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard/stats');
      setStats({
        totalRevenue: data.totalRevenue || 0,
        pendingWithdrawals: data.pendingWithdrawals || 0,
        totalWithdrawals: data.totalWithdrawalsAmount || 0,
        platformFees: data.platformFees || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleViewItem = (item: Transaction | Withdrawal) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const openActionModal = (item: Withdrawal, action: 'approve' | 'reject' | 'complete') => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedItem || !('requestedAt' in selectedItem)) return;

    try {
      setActionLoading(true);

      if (actionType === 'approve') {
        await api.put(`/admin/withdrawals/${selectedItem._id}/approve`, {
          adminNote,
        });
      } else if (actionType === 'reject') {
        if (!adminNote) {
          alert('Please provide a reason for rejection');
          return;
        }
        await api.put(`/admin/withdrawals/${selectedItem._id}/reject`, {
          adminNote,
        });
      } else if (actionType === 'complete') {
        if (!txHash) {
          alert('Please provide the transaction hash');
          return;
        }
        await api.put(`/admin/withdrawals/${selectedItem._id}/complete`, {
          txHash,
          adminNote,
        });
      }

      setShowActionModal(false);
      setSelectedItem(null);
      setAdminNote('');
      setTxHash('');
      fetchData();
      fetchStats();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      completed: 'success',
      approved: 'success',
      pending: 'warning',
      failed: 'danger',
      rejected: 'danger',
      cancelled: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      payment: 'success',
      withdrawal: 'warning',
      refund: 'danger',
      settlement: 'info',
    };
    return <Badge variant={variants[type] || 'gray'}>{type}</Badge>;
  };

  return (
    <>
      <AdminNavbar />
      <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Payments & Transactions</h1>
              <p className="text-slate-400 mt-1">
                Manage all financial transactions and withdrawals
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Platform Fees</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {formatCurrency(stats.platformFees)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending Withdrawals</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pendingWithdrawals}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatCurrency(stats.totalWithdrawals)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab('transactions');
                setPage(1);
                setStatusFilter('all');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => {
                setActiveTab('withdrawals');
                setPage(1);
                setStatusFilter('all');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'withdrawals'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => {
                setActiveTab('settlements');
                setPage(1);
                setStatusFilter('all');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settlements'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Settlements
            </button>
          </div>

          {/* Filters */}
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by user or transaction ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  {activeTab === 'withdrawals' && (
                    <>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                  <option value="failed">Failed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : activeTab === 'withdrawals' ? (
                // Withdrawals Table
                withdrawals.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No withdrawals found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Wallet
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {withdrawals.map((withdrawal) => (
                          <tr key={withdrawal._id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">
                                  {withdrawal.userId?.firstName} {withdrawal.userId?.lastName}
                                </p>
                                <p className="text-slate-500 text-sm">{withdrawal.userId?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-emerald-400 font-bold">
                              {formatCurrency(withdrawal.amount)}
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(withdrawal.status)}</td>
                            <td className="px-6 py-4">
                              <p className="text-slate-400 text-sm font-mono max-w-[150px] truncate">
                                {withdrawal.walletAddress}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {formatDate(withdrawal.requestedAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewItem(withdrawal)}
                                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {withdrawal.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => openActionModal(withdrawal, 'approve')}
                                      className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                                      title="Approve"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openActionModal(withdrawal, 'reject')}
                                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                      title="Reject"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {withdrawal.status === 'approved' && (
                                  <button
                                    onClick={() => openActionModal(withdrawal, 'complete')}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Mark as Completed"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                // Transactions Table
                transactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No transactions found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {transactions.map((transaction) => (
                          <tr key={transaction._id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {transaction.type === 'payment' ? (
                                  <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                                )}
                                {getTypeBadge(transaction.type)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">
                                  {transaction.userId?.firstName} {transaction.userId?.lastName}
                                </p>
                                <p className="text-slate-500 text-sm">{transaction.userId?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`font-bold ${
                                  transaction.type === 'payment' ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {transaction.type === 'payment' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                            <td className="px-6 py-4">
                              {transaction.projectId ? (
                                <p className="text-slate-400 text-sm max-w-[150px] truncate">
                                  {transaction.projectId.title}
                                </p>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleViewItem(transaction)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">
                    Page {page} of {totalPages} ({total} items)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {'requestedAt' in selectedItem ? 'Withdrawal Details' : 'Transaction Details'}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Amount</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(selectedItem.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-white mt-1 text-sm">
                    {formatDate('requestedAt' in selectedItem ? selectedItem.requestedAt : selectedItem.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-400 text-sm">User</p>
                <p className="text-white mt-1">
                  {selectedItem.userId?.firstName} {selectedItem.userId?.lastName}
                </p>
                <p className="text-slate-500 text-sm">{selectedItem.userId?.email}</p>
              </div>

              {'walletAddress' in selectedItem && (
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Wallet Address</p>
                  <p className="text-white mt-1 font-mono text-sm break-all">
                    {selectedItem.walletAddress}
                  </p>
                </div>
              )}

              {'txHash' in selectedItem && selectedItem.txHash && (
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Transaction Hash</p>
                  <p className="text-white mt-1 font-mono text-sm break-all">
                    {selectedItem.txHash}
                  </p>
                </div>
              )}

              {'adminNote' in selectedItem && selectedItem.adminNote && (
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Admin Note</p>
                  <p className="text-white mt-1">{selectedItem.adminNote}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedItem && 'requestedAt' in selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'approve' && 'Approve Withdrawal'}
                {actionType === 'reject' && 'Reject Withdrawal'}
                {actionType === 'complete' && 'Complete Withdrawal'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setAdminNote('');
                  setTxHash('');
                }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <p className="text-slate-400 text-sm">Amount</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(selectedItem.amount)}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  To: {selectedItem.walletAddress?.substring(0, 20)}...
                </p>
              </div>

              <p className="text-slate-300 mb-4">
                {actionType === 'approve' && (
                  <>This will approve the withdrawal request and mark it for processing.</>
                )}
                {actionType === 'reject' && (
                  <>
                    This will reject the withdrawal and return the funds to the user's balance.
                  </>
                )}
                {actionType === 'complete' && (
                  <>
                    Mark this withdrawal as completed. Please enter the transaction hash.
                  </>
                )}
              </p>

              {actionType === 'complete' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Transaction Hash *
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Enter blockchain transaction hash..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  {actionType === 'reject' ? 'Reason for Rejection *' : 'Admin Note (Optional)'}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionType === 'reject'
                      ? 'Enter reason for rejecting this withdrawal...'
                      : 'Add a note (optional)...'
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionModal(false);
                  setAdminNote('');
                  setTxHash('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'reject' ? 'danger' : 'secondary'}
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : (
                  <>
                    {actionType === 'approve' && 'Approve'}
                    {actionType === 'reject' && 'Reject'}
                    {actionType === 'complete' && 'Complete'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <AdminPaymentsContent />
    </Suspense>
  );
}
