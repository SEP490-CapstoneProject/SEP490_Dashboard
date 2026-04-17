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