export interface RecordItem {
  id: string;
  [key: string]: any;
}

export interface Transfer {
  id: string;
  date: string;
  amount: number;
  description: string;
  sourceAccountId: string;
  sourceAccountName: string;
  targetAccountId: string;
  targetAccountName: string;
  type: 'TRANSFER' | 'CARD_PAYMENT';
}

