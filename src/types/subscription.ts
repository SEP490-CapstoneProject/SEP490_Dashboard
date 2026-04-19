export interface Feature {
  id: number; // Quan trọng để CRUD
  planId: number;
  featureKey: string;
  featureName: string;
  value: string;
  type: "Number" | "Boolean" | "Text";
  isActive: boolean;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: Feature[];
}
export interface Subscription {
  id: number;
  userId: number;
  userName: string; // Thêm trường này
  userAvatar: string; // Thêm trường này
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AnalyticsOverview {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  churnRate: number;
  mrr: number;
  arr: number;
  generatedAt: string;
}
export interface AnalyticRevenue {
  totalRevenue: number;
  revenueByPlan: Record<string, number>;
  dailyRevenue: { date: string; revenue: number }[];
  startDate: string;
  endDate: string;
}