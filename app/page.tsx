'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/components/TransactionTable';
import { ChartByType } from '@/components/ChartByType';
import { ChartByMonth } from '@/components/ChartByMonth';
import { 
  Transaction, 
  TransactionSummary, 
  fetchAll,
  generateSummaryFromTransactions
} from '@/utils/api';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';

import Link from 'next/link';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await fetchAll(1000);
      const generatedSummary = generateSummaryFromTransactions(fetchedTransactions);
      
      setTransactions(fetchedTransactions);
      setSummary(generatedSummary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to connect to backend. Please ensure your API is running on http://localhost:3002');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);   
  };

  const recentTransactions = transactions.slice();

  const getTransactionCount = (type: string) => {
    const typeMap: Record<string, string> = {
      'incoming': 'INCOMING',
      'p2p': 'P2P_TRANSFER',
      'withdrawal': 'WITHDRAWAL',
      'bundle': 'BUNDLE_PURCHASE',
      'airtime': 'AIRTIME',
      'bank': 'BANK_DEPOSIT'
    };
    return transactions.filter(t => t.type === typeMap[type]).length;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-4 shadow-lg">
                <DashboardIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MoMo Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Button 
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-primary hover:bg-yellow-600 text-white shadow-lg"
            >
              <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ErrorIcon className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-primary text-white animate-slide-up shadow-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">
                Total Amount
              </CardTitle>
              <AccountBalanceWalletIcon className="w-4 h-4 text-yellow-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 bg-yellow-400 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(summary?.totalAmount || 0)
                )}
              </div>
              <p className="text-xs text-yellow-200 mt-1">
                Across all transactions
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up shadow-lg border-yellow-200" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Transactions
              </CardTitle>
              <TrendingUpIcon className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  (summary?.totalCount || 0).toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up shadow-lg border-green-200" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Successful
              </CardTitle>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  (summary?.successCount || 0).toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {summary && summary.totalCount > 0 
                  ? `${Math.round((summary.successCount / summary.totalCount) * 100)}% success rate`
                  : 'Success rate'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up shadow-lg border-red-200" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Channel Distribution
              </CardTitle>
              <div className="flex gap-1">
                <PendingIcon className="w-4 h-4 text-yellow-500" />
                <ErrorIcon className="w-4 h-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  transactions.filter(t => t.channel === 'USSD').length
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                USSD transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { type: 'incoming', label: 'Incoming', color: 'bg-blue-500', icon: '📥' },
              { type: 'p2p', label: 'P2P Transfer', color: 'bg-purple-500', icon: '🔄' },
              { type: 'withdrawal', label: 'Withdrawal', color: 'bg-orange-500', icon: '💸' },
              { type: 'bundle', label: 'Bundle', color: 'bg-indigo-500', icon: '📱' },
              { type: 'airtime', label: 'Airtime', color: 'bg-cyan-500', icon: '📞' },
              { type: 'bank', label: 'Bank', color: 'bg-emerald-500', icon: '🏦' },
            ].map((item) => (
                <Card key={item.type} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-yellow-200 hover:border-yellow-400">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl shadow-md`}>
                      {item.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-600">
                      {getTransactionCount(item.type)} transactions
                    </p>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartByType transactions={transactions} loading={loading} />
          <ChartByMonth transactions={transactions} loading={loading} />
        </div>

        {/* Recent Transactions */}
        <TransactionTable 
          transactions={recentTransactions} 
          loading={loading}
          title="Recent Transactions"
        />
      </div>
    </div>
  );
}