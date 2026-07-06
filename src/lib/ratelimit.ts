import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * Rate limiting using Supabase (PostgreSQL).
 *
 * Uses a sliding window counter stored in the `api_rate_limits` table.
 * No external services needed — Supabase is already in the stack.
 *
 * Setup: run supabase/migrations/rate_limits.sql in Supabase SQL Editor.
 */

interface RateLimitConfig {
  /** Unique prefix for this endpoint (e.g. "newsletter", "contact") */
  prefix: string;
  /** Max requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/**
 * Check rate limit for an IP against a given config.
 * Returns a 429 NextResponse if limited, null if the request is allowed.
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const key = `rl:${config.prefix}:${ip}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  try {
    const supabase = getSupabaseAdmin();

    // Fetch existing record
    const { data: existing } = await supabase
      .from('api_rate_limits')
      .select('count, window_start')
      .eq('key', key)
      .single();

    let currentCount = 0;

    if (!existing || new Date(existing.window_start) < windowStart) {
      // No record or window expired — start a fresh window at count=1
      await supabase
        .from('api_rate_limits')
        .upsert(
          { key, count: 1, window_start: now.toISOString(), updated_at: now.toISOString() },
          { onConflict: 'key' }
        );
      currentCount = 1;
    } else {
      // Within window — increment counter
      currentCount = existing.count + 1;
      await supabase
        .from('api_rate_limits')
        .update({ count: currentCount, updated_at: now.toISOString() })
        .eq('key', key);
    }

    if (currentCount > config.limit) {
      const resetAt = new Date(
        (existing ? new Date(existing.window_start).getTime() : now.getTime()) + config.windowMs
      );
      const retryAfterSecs = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(resetAt.getTime() / 1000)),
            'Retry-After': String(Math.max(1, retryAfterSecs)),
          },
        }
      );
    }

    return null; // Request is allowed
  } catch (err) {
    // If rate limit check fails (e.g. table doesn't exist yet), allow the request
    // to avoid blocking legitimate users due to infra issues.
    console.error('[ratelimit] Error checking rate limit, allowing request:', err);
    return null;
  }
}

/**
 * Extract the real IP from a request.
 * Respects Vercel's x-forwarded-for header.
 */
export function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'anonymous';
}

// Pre-configured limiters for each endpoint

/** Newsletter: 3 subscriptions per IP per 10 minutes */
export const NEWSLETTER_LIMIT: RateLimitConfig = {
  prefix: 'newsletter',
  limit: 3,
  windowMs: 10 * 60 * 1000, // 10 minutes
};

/** Contact form: 5 messages per IP per 30 minutes */
export const CONTACT_LIMIT: RateLimitConfig = {
  prefix: 'contact',
  limit: 5,
  windowMs: 30 * 60 * 1000, // 30 minutes
};
