import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting utility using Upstash Redis.
 *
 * Requires in environment:
 *   UPSTASH_REDIS_REST_URL=https://...
 *   UPSTASH_REDIS_REST_TOKEN=AX...
 *
 * Falls back gracefully (allows request) when env vars are not set,
 * so the app works in development without Upstash configured.
 */

// Lazily initialise Redis only when env vars are present
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Newsletter: 3 subscriptions per IP per 10 minutes
export function getNewsletterLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    analytics: false,
    prefix: 'rl:newsletter',
  });
}

// Contact form: 5 messages per IP per 30 minutes
export function getContactLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '30 m'),
    analytics: false,
    prefix: 'rl:contact',
  });
}

/**
 * Extract the real IP from a Next.js request.
 * Respects Vercel's x-forwarded-for header.
 */
export function getIp(req: NextRequest | Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'anonymous';
}

/**
 * Check rate limit for a request.
 * Returns a 429 Response if limited, null if allowed.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  ip: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // No limiter configured — allow

  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
