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
  sourceOwnerType?: 'USER_A' | 'USER_B' | 'SHARED';
  sourceOwnerUid?: string;
  targetAccountId: string;
  targetAccountName: string;
  targetOwnerType?: 'USER_A' | 'USER_B' | 'SHARED';
  targetOwnerUid?: string;
  type: 'TRANSFER' | 'CARD_PAYMENT';
  transferKind?: 'SAME_USER' | 'CROSS_USERS' | 'CARD_PAYMENT';
  senderUid?: string;
  receiverUid?: string;
  ownerUid?: string;
  userId?: string;
  isPrivate?: boolean;
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

export interface ProjectContribution extends RecordItem {
  id: string;
  projectId: string;
  savingsProjectId?: string;
  projectName?: string;
  userId: string;
  userName?: string;
  userDisplayName?: string;
  userPhotoUrl?: string;
  user?: {
    id?: string;
    uid?: string;
    displayName?: string | null;
    photoUrl?: string | null;
  };
  amount: number;
  date: string;
  notes?: string | null;
  sourceAccountId?: string | null;
  targetAccountId?: string | null;
  householdId?: string;
  isInternalPiggyBank?: boolean;
  createdAt?: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  amountThreshold?: number;
  dateThreshold?: string;
  isCompleted: boolean;
  createdAt?: string;
}

