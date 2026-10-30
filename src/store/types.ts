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

export interface Budget extends RecordItem {
  id: string;
  categoryId: string;
  category?: string;
  assignedAmount: number;
  base?: number;
  period: string;
  ownerType: string;
  icon?: string;
  splitType?: string;
  customUserId?: string | null;
  customUserAmount?: number | null;
}

