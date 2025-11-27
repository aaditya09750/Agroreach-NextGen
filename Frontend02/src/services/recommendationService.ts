import api from './api';

export interface RecommendationActionData {
  type: string;
  currentPrice?: number;
  suggestedPrice?: string;
  currentDiscount?: number;
  suggestedDiscount?: number;
  wholesalePrice?: string;
  minBulkQuantity?: number;
  stockQuantity?: number;
  daysOld?: number;
  duration?: string;
  potentialRevenue?: string;
  savingsForBuyers?: string;
  expectedOutcome?: string;
  urgencyReason?: string;
  processingOptions?: string[];
  shelfLifeExtension?: string;
  marginIncrease?: string;
  totalValue?: string;
  estimatedPremium?: string;
  coverage?: string;
  benefits?: string[];
}

export interface ActionDetails {
  steps: string[];
  implementationTime: string;
  expectedResult: string;
}

export interface Recommendation {
  _id: string;
  farmerId: string;
  productId: string | null;
  productName: string;
  type: 'EMERGENCY_AUCTION' | 'FLASH_SALE' | 'BULK_MODE' | 'VALUE_ADDITION' | 'INSURANCE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  actionData: RecommendationActionData;
  actionDetails?: ActionDetails;
  icon: string;
  color: string;
  status: 'ACTIVE' | 'DISMISSED' | 'ACTED';
  dismissedAt?: Date;
  actedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendationsStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: Recommendation[];
  stats: RecommendationsStats;
  message?: string;
}

export interface ProductRecommendationsResponse {
  success: boolean;
  product: {
    id: string;
    name: string;
    category: string;
    stock: number;
    price: number;
  };
  recommendations: Recommendation[];
}

// Get all recommendations for farmer
export const getRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await api.get('/farmer/recommendations');
  return response.data;
};

// Get recommendations for specific product
export const getProductRecommendations = async (productId: string): Promise<ProductRecommendationsResponse> => {
  const response = await api.get(`/farmer/recommendations/product/${productId}`);
  return response.data;
};

// Dismiss a recommendation
export const dismissRecommendation = async (recommendationId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/farmer/recommendations/${recommendationId}/dismiss`);
  return response.data;
};

// Mark recommendation as acted upon
export const markAsActed = async (recommendationId: string): Promise<{ success: boolean; message: string; recommendation: Recommendation }> => {
  const response = await api.post(`/farmer/recommendations/${recommendationId}/acted`);
  return response.data;
};
