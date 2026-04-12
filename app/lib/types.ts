export type ProductFeatures = {
  batteryLifeHours: number | null;
  bluetoothVersion: string | null;
  noiseCancelling: boolean | null;
  waterResistance: string | null;
  weightGrams: number | null;
};

export type LiveProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  sourceUrl: string;
  features: ProductFeatures;
  description: string;
  customerSentiment: string;
  rationale: string;
  isRecommended: boolean;
  recommendationReason: string | null;
};

export type CartItem = {
  product: LiveProduct;
  quantity: number;
};

export type ClarifyingQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type ClarifyResponse = {
  questions: ClarifyingQuestion[];
};

export type RecommendResponse = {
  summary: string;
  recommendations: LiveProduct[];
};

export type QuestionAnswer = {
  question: string;
  answer: string;
};

export type AppScreen = "landing" | "clarifying" | "results" | "checkout";
