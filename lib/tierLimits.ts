export interface TierLimits {
  dailyAnalyses: number;
  maxVideoDuration: number; // en segundos
  name: string;
}

export const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    dailyAnalyses: 1,
    maxVideoDuration: 60, // 1 minuto
    name: 'Free'
  },
  starter: {
    dailyAnalyses: 3,
    maxVideoDuration: 120, // 2 minutos
    name: 'Starter'
  },
  pro: {
    dailyAnalyses: 10,
    maxVideoDuration: 300, // 5 minutos
    name: 'Pro'
  },
  premium: {
    dailyAnalyses: 999, // "ilimitado"
    maxVideoDuration: 600, // 10 minutos
    name: 'Premium'
  }
};

export function getTierLimit(tier: string): TierLimits {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}