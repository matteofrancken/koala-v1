
export enum PlanType {
  FREE = 'Gratis',
  STARTER = 'Starter',
  PRO = 'Pro',
  UNLIMITED = 'Unlimited'
}

export enum ToneType {
  FORMAL = 'Formeel',
  BUSINESS = 'Zakelijk neutraal',
  INFORMAL = 'Informeel vriendelijk',
  EXTRA_FRIENDLY = 'Extra vriendelijk',
  ASSERTIVE = 'Assertief beleefd',
  CUSTOM = 'Custom'
}

export enum LengthType {
  ULTRA_SHORT = 'Ultra kort',
  SHORT = 'Kort',
  NORMAL = 'Normaal',
  EXTENDED = 'Uitgebreid'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  onboardingCompleted: boolean;
  password?: string;
  plan: PlanType;
  responsesUsed: number;
  maxResponses: number;
  timeSaved: number; // In minutes
  lastResetMonth?: string; // Format: YYYY-MM
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'past_due';
  createdAt: string;
}

export interface GeneratedResponse {
  id: string;
  userId: string;
  originalMessage: string;
  aiResponseA: string;
  aiResponseB: string;
  tone: ToneType | string;
  length: LengthType;
  intent: string;
  emotion: string;
  urgency: string;
  createdAt: string;
}

export interface AppState {
  user: User | null;
  history: GeneratedResponse[];
  loading: boolean;
}
