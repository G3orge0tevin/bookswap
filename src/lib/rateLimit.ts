import { supabase } from "@/integrations/supabase/client";

interface RateLimitConfig {
  operationType: string;
  userId: string;
  maxAttempts: number;
  windowMinutes: number;
}

export const checkRateLimit = async ({
  operationType,
  userId,
  maxAttempts,
  windowMinutes,
}: RateLimitConfig): Promise<{ allowed: boolean; remainingAttempts: number }> => {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  // Count attempts in the time window
  const { data, error } = await supabase
    .from('rate_limit_tracker')
    .select('operation_count')
    .eq('user_id', userId)
    .eq('operation_type', operationType)
    .gte('created_at', windowStart);

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remainingAttempts: maxAttempts }; // Fail open on error
  }

  const attemptCount = data?.reduce((sum, row) => sum + (row.operation_count || 1), 0) || 0;
  const allowed = attemptCount < maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - attemptCount);

  return { allowed, remainingAttempts };
};

export const recordAttempt = async (
  operationType: string,
  userId: string
): Promise<void> => {
  await supabase
    .from('rate_limit_tracker')
    .insert({
      user_id: userId,
      operation_type: operationType,
      operation_count: 1,
    });
};

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMinutes: 15 },
  BOOK_UPLOAD: { maxAttempts: 10, windowMinutes: 60 },
  TOKEN_PURCHASE: { maxAttempts: 10, windowMinutes: 60 },
  ADMIN_OPERATION: { maxAttempts: 50, windowMinutes: 1 },
} as const;
