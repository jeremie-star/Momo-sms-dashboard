'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,} from 'recharts';
import { Transaction } from '@/utils/api';
import { useMemo } from 'react';
import {format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths,} from 'date-fns';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface ChartByMonthProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function ChartByMonth({ transactions, loading = false }: ChartByMonthProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);

    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(now),
    });

    const monthlyData = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.timestamp);
        if (isNaN(transactionDate.getTime())) {
          console.warn('Invalid date:', transaction.timestamp);
          return false;
        }
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const totalAmount = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalFees = monthTransactions.reduce((sum, t) => sum + (t.fee || 0), 0);

      return {
        month: format(month, 'MMM yyyy'),
        shortMonth: format(month, 'MMM'),
        totalTransactions: monthTransactions.length,
        totalAmount: Math.round(totalAmount / 1000000),
        totalFees: Math.round(totalFees / 1000),
        averageAmount: monthTransactions.length
          ? Math.round(totalAmount / monthTransactions.length)
          : 0,
        ussdTransactions: monthTransactions.filter((t) => t.channel === 'USSD').length,
        agentTransactions: monthTransactions.filter((t) => t.channel === 'AGENT').length,
      };
    });

    return monthlyData;
  }, [transactions]);

  const totalGrowth = useMemo(() => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1]?.totalAmount || 0;
    const previous = chartData[chartData.length - 2]?.totalAmount || 0;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg border-yellow-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">{`Total: ${data.totalTransactions} transactions`}</p>
            <p className="text-yellow-600">{`Amount: ${data.totalAmount}M RWF`}</p>
            <p className="text-green-600">{`Fees: ${data.totalFees}K RWF`}</p>
            <p className="text-orange-600">{`Avg Amount: ${data.averageAmount.toLocaleString()} RWF`}</p>
            <p className="text-purple-600">{`USSD: ${data.ussdTransactions}, Agent: ${data.agentTransactions}`}</p>
          </div>
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
            <ShowChartIcon className="w-5 h-5 text-green-600" />
            Monthly Transaction Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up shadow-lg border-yellow-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShowChartIcon className="w-5 h-5 text-green-600" />
            Monthly Transaction Trends
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-600">Month-over-Month Growth</p>
            <p
              className={`text-lg font-semibold ${
                totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalGrowth >= 0 ? '+' : ''}
              {totalGrowth}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every((d) => d.totalTransactions === 0) ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            No data available for the selected period
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis
                  dataKey="shortMonth"
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
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="totalTransactions"
                  fill="#f59e0b"
                  name="Total Transactions"
                  barSize={30}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  name="Amount (M RWF)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-yellow-200">
          {chartData.slice(-4).map((item) => (
            <div key={item.month} className="text-center">
              <p className="text-xs text-gray-600 uppercase tracking-wide">{item.shortMonth}</p>
              <p className="text-lg font-semibold text-gray-900">{item.totalTransactions}</p>
              <p className="text-xs text-gray-500">{item.totalAmount}M RWF</p>
              <p className="text-xs text-green-600">{item.ussdTransactions} USSD</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
