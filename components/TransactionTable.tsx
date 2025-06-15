'use client';

import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  title?: string;
}

const ITEMS_PER_PAGE = 10;

export function TransactionTable({ 
  transactions, 
  loading = false, 
  title = "Recent Transactions" 
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = 
          (transaction.counterparty?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (transaction.txId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (transaction.channel?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesChannel = channelFilter === 'all' || transaction.channel === channelFilter;

      return matchesSearch && matchesType && matchesChannel;
    });
  }, [transactions, searchTerm, typeFilter, channelFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOMING':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'P2P_TRANSFER':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'WITHDRAWAL':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'BUNDLE_PURCHASE':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'AIRTIME':
        return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      case 'BANK_DEPOSIT':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'USSD':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'AGENT':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'BANK':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'P2P_TRANSFER':
        return 'P2P';
      case 'BUNDLE_PURCHASE':
        return 'Bundle';
      case 'BANK_DEPOSIT':
        return 'Bank';
      default:
        return type;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Counterparty', 'Amount', 'Channel', 'Fee', 'Balance'];
    const csvData = filteredTransactions.map(transaction => [
      format(new Date(transaction.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      transaction.txId || 'N/A',
      transaction.type,
      transaction.counterparty,
      transaction.amount,
      transaction.channel,
      transaction.fee || 0,
      transaction.balance || 'Unknown'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="animate-slide-up shadow-lg border-yellow-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
          <Button 
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-yellow-50 hover:border-yellow-300"
          >
            <DownloadIcon className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-yellow-200 focus:border-yellow-400"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 border-yellow-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INCOMING">Incoming</SelectItem>
                <SelectItem value="P2P_TRANSFER">P2P Transfer</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="BUNDLE_PURCHASE">Bundle</SelectItem>
                <SelectItem value="AIRTIME">Airtime</SelectItem>
                <SelectItem value="BANK_DEPOSIT">Bank</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-32 border-yellow-200">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="USSD">USSD</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="BANK">Bank</SelectItem>
                <SelectItem value="UNKNOWN">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading transactions...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-50">
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Counterparty</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Channel</TableHead>
                    <TableHead className="font-semibold text-gray-700">Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction, index) => (
                      <TableRow 
                        key={transaction.id || index} 
                        className="hover:bg-yellow-50 transition-colors duration-150"
                      >
                        <TableCell className="font-medium">
                          {format(new Date(transaction.timestamp), 'MMM dd, yyyy')}
                          <div className="text-xs text-gray-500">
                            {format(new Date(transaction.timestamp), 'HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">
                          {transaction.txId || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${getTypeColor(transaction.type)} font-medium`}
                          >
                            {formatType(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.counterparty}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${getChannelColor(transaction.channel)} font-medium`}
                          >
                            {transaction.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {transaction.fee ? formatAmount(transaction.fee) : '0 RWF'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-yellow-50">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
                  {filteredTransactions.length} transactions
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 border-yellow-300 hover:bg-yellow-100"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 p-0 ${pageNum === currentPage ? 'bg-gradient-primary text-white' : 'border-yellow-300 hover:bg-yellow-100'}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 border-yellow-300 hover:bg-yellow-100"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}