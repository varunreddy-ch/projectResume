
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Resume {
  id: string;
  title: string;
  content: any;
  userId?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageData {
  can_generate: boolean;
  current_usage: number;
  daily_limit: number;
  remaining: number;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}
