export interface CreatePaymentRequest {
  walletNumber: string;
  account: string;
  email: string;
  phone?: string | null;
  amount: number;
  currency: string;
  comment?: string | null;
}

export interface PaymentResponse extends CreatePaymentRequest {
  id: string;
  status: string;
  createdAt: string;
}

export interface DailyPaymentStatistics {
  date: string;
  count: number;
  amount: number;
}

export interface CurrencyStatistics {
  currency: string;
  totalAmount: number;
  count: number;
  dailyStats: DailyPaymentStatistics[];
}

export interface PaymentStatistics {
  totalCount: number;
  byCurrency: CurrencyStatistics[];
}