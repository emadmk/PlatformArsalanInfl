'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import api from '@/lib/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  CreditCard,
} from 'lucide-react';

interface Transaction {
  _id: string;
  type: 'credit' | 'debit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    withdrawalMethod?: string;
  };
}

interface WalletData {
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawals: number;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('usdt');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, [page]);

  const fetchWalletData = async () => {
    try {
      const { data } = await api.get('/influencer/wallet');
      setWallet({
        balance: data.balance || 0,
        pendingBalance: data.pendingBalance || 0,
        totalEarnings: data.totalEarnings || 0,
        totalWithdrawals: data.totalWithdrawals || 0,
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/payment/transactions', {
        params: { page, limit: 20 },
      });
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    if (!withdrawAddress) {
      alert('Please enter your wallet address');
      return;
    }

    try {
      await api.post('/payment/withdraw', {
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        address: withdrawAddress,
      });

      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      fetchWalletData();
      fetchTransactions();
      alert('Withdrawal request submitted successfully!');
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      alert(error.response?.data?.error || 'Failed to process withdrawal');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      cancelled: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Wallet className="w-8 h-8 mr-3" />
            <h1 className="text-3xl font-bold">My Wallet</h1>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm">Available Balance</p>
                  <DollarSign className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm">Pending Balance</p>
                  <Clock className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(wallet.pendingBalance)}
                </p>
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm">Total Earnings</p>
                  <ArrowDownRight className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(wallet.totalEarnings)}
                </p>
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm">Total Withdrawals</p>
                  <ArrowUpRight className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(wallet.totalWithdrawals)}
                </p>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <Button
              variant="primary"
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-gray-400 text-4xl mb-2">💰</div>
                      <p className="text-gray-600">No transactions yet</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.type === 'credit' ? (
                            <ArrowDownRight className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                        {transaction.metadata?.withdrawalMethod && (
                          <div className="text-xs text-gray-500 mt-1">
                            via {transaction.metadata.withdrawalMethod.toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === 'credit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {Math.min((page - 1) * 20 + 1, total)} to {Math.min(page * 20, total)} of{' '}
                {total} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Balance
                  </label>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(wallet.balance)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Method
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="usdt">USDT (Tether)</option>
                    <option value="btc">Bitcoin</option>
                    <option value="eth">Ethereum</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={wallet.balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum withdrawal: $50.00
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address / Account Number
                  </label>
                  <Input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder={
                      withdrawMethod === 'bank'
                        ? 'Enter bank account number'
                        : 'Enter wallet address'
                    }
                    required
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Withdrawals are processed within 24-48 hours. A 2.5% processing fee
                    will be applied.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Withdraw {withdrawAmount && `$${parseFloat(withdrawAmount).toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
