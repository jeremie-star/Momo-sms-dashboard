'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/utils/api';
import { useMemo } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface ChartByTypeProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function ChartByType({ transactions, loading = false }: ChartByTypeProps) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const typeData = transactions.reduce((acc, transaction) => {
      const type = transaction.type;
      if (!acc[type]) {
        acc[type] = {
          type: formatTypeName(type),
          count: 0,
          amount: 0,
          totalFees: 0,
        };
      }
      
      acc[type].count += 1;
      acc[type].amount += transaction.amount;
      acc[type].totalFees += transaction.fee || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(typeData).map((data: any) => ({
      ...data,
      amount: Math.round(data.amount / 1000), // Convert to thousands for better readability
      avgAmount: Math.round(data.amount * 1000 / data.count), // Average amount per transaction
    }));
  }, [transactions]);

  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  function formatTypeName(type: string): string {
    switch (type) {
      case 'P2P_TRANSFER':
        return 'P2P Transfer';
      case 'BUNDLE_PURCHASE':
        return 'Bundle';
      case 'BANK_DEPOSIT':
        return 'Bank';
      case 'INCOMING':
        return 'Incoming';
      case 'WITHDRAWAL':
        return 'Withdrawal';
      case 'AIRTIME':
        return 'Airtime';
      default:
        return type;
    }
  }
console.log('Chart Data:', chartData);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg border-yellow-200">
          <p className="font-semibold text-gray-900">{`Type: ${label}`}</p>
          <p className="text-blue-600">{`Transactions: ${data.count}`}</p>
          <p className="text-yellow-600">{`Amount: ${data.amount.toLocaleString()} RWF`}</p>
          <p className="text-green-600">{`Avg: ${data.avgAmount.toLocaleString()} RWF`}</p>
          <p className="text-purple-600">{`Total Fees: ${data.totalFees.toLocaleString()} RWF`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="animate-slide-up shadow-lg border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
            Transactions by Type
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up shadow-lg border-yellow-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
            Transactions by Type
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900">{totalTransactions.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            No data available
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis 
                  dataKey="type" 
                  stroke="#92400e"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#92400e"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Transactions"
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
                <Bar 
                  dataKey="amount" 
                  name="Amount (K RWF)"
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-yellow-200">
          {chartData.slice(0, 4).map((item) => (
            <div key={item.type} className="text-center">
              <p className="text-xs text-gray-600 uppercase tracking-wide">{item.type}</p>
              <p className="text-lg font-semibold text-gray-900">{item.count}</p>
              <p className="text-xs text-gray-500">{item.amount} RWF</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}