const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Transaction {
  id: string;
  type: 'INCOMING' | 'P2P_TRANSFER' | 'WITHDRAWAL' | 'BUNDLE_PURCHASE' | 'AIRTIME' | 'BANK_DEPOSIT';
  amount: number;
  counterparty: string;
  timestamp: string;
  txId?: string;
  fee?: number;
  balance?: number;
  channel: string;
  msisdn?: string;
  rawBody?: string;
}

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API function
async function apiRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Fetch all transactions
export async function fetchAll(limit = 100): Promise<Transaction[]> {
  return apiRequest<Transaction[]>(`/api/transactions?limit=${limit}`);
}

// Fetch transactions by type
export async function fetchDataByType(type: string, limit = 100): Promise<Transaction[]> {
  const typeMap: Record<string, string> = {
    'incoming': 'INCOMING',
    'p2p': 'P2P_TRANSFER',
    'withdrawal': 'WITHDRAWAL',
    'bundle': 'BUNDLE_PURCHASE',
    'airtime': 'AIRTIME',
    'bank': 'BANK_DEPOSIT'
  };

  const backendType = typeMap[type.toLowerCase()];
  if (!backendType) {
    throw new Error(`Unknown transaction type: ${type}`);
  }

  return apiRequest<Transaction[]>(`/api/transactions/${type}?limit=${limit}`);
}

// Fetch filtered transactions
export async function fetchFilteredTransactions(
  type?: string,
  limit = 100
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  
  if (type && type !== 'all') {
    const typeMap: Record<string, string> = {
      'incoming': 'INCOMING',
      'p2p': 'P2P_TRANSFER',
      'withdrawal': 'WITHDRAWAL',
      'bundle': 'BUNDLE_PURCHASE',
      'airtime': 'AIRTIME',
      'bank': 'BANK_DEPOSIT'
    };
    const backendType = typeMap[type.toLowerCase()];
    if (backendType) {
      params.append('type', backendType);
    }
  }
  
  params.append('limit', limit.toString());

  return apiRequest<Transaction[]>(`/api/transactions?${params.toString()}`);
}

// Generate transaction summary from data
export function generateSummaryFromTransactions(transactions: Transaction[]): TransactionSummary {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCount = transactions.length;
  const successCount = totalCount; 
  const pendingCount = 0;
  const failedCount = 0;

  return {
    totalAmount,
    totalCount,
    successCount,
    pendingCount,
    failedCount,
  };
}