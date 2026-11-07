// Simple in-memory rate limiter for Next.js route handlers.
// Tracks request counts by IP + endpoint key. Suitable for single-instance
// deployments (Vercel hobby, a single VPS). For multi-instance production,
// swap the Map for Redis or Upstash.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes to prevent memory leaks
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 5 * 60 * 1000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

interface RateLimitOptions {
  /** Window size in milliseconds */
  windowMs: number
  /** Maximum requests per window */
  max: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether a request should be allowed under the rate limit.
 * Returns `{ success: true }` if allowed, `{ success: false, ... }` if blocked.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  cleanup()
  const now = Date.now()
  const existing = store.get(identifier)

  if (!existing || existing.resetAt < now) {
    // First request in window, or window expired
    const entry: RateLimitEntry = { count: 1, resetAt: now + options.windowMs }
    store.set(identifier, entry)
    return { success: true, remaining: options.max - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= options.max) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return {
    success: true,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  }
}

/** Check the limit WITHOUT counting this request (used to count only failed logins). */
export function rateLimitPeek(identifier: string, options: RateLimitOptions): RateLimitResult {
  cleanup()
  const now = Date.now()
  const existing = store.get(identifier)
  if (!existing || existing.resetAt < now) {
    return { success: true, remaining: options.max, resetAt: now + options.windowMs }
  }
  return {
    success: existing.count < options.max,
    remaining: Math.max(0, options.max - existing.count),
    resetAt: existing.resetAt,
  }
}

/** Forget an identifier's counter (e.g. after a successful login). */
export function rateLimitReset(identifier: string) {
  store.delete(identifier)
}

/** Extract a stable identifier (IP + endpoint) from a Next.js request. */
export function getClientId(req: Request, scope: string): string {
  // Try common headers for the real client IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const vercelIp = req.headers.get('x-vercel-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? vercelIp ?? 'unknown'
  return `${scope}:${ip}`
}

/** Build a 429 response with standard rate-limit headers. */
export function rateLimitedResponse(resetAt: number): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  )
}

// Common rate limit presets
export const RATE_LIMITS = {
  // Auth: 5 attempts per 15 minutes per IP (brute-force protection)
  auth: { windowMs: 15 * 60 * 1000, max: 5 },
  // Auth register: 3 per hour (slower to prevent account spam)
  register: { windowMs: 60 * 60 * 1000, max: 3 },
  // Submissions: 10 per hour per IP (content spam protection)
  submission: { windowMs: 60 * 60 * 1000, max: 10 },
  // General API: 100 per minute per IP
  api: { windowMs: 60 * 1000, max: 100 },
} as const
