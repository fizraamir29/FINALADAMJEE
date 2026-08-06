import { NextResponse } from 'next/server';

/**
 * Shared security primitives for the API layer.
 * Keep this file dependency-free so it can be imported from any route.
 */

export const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Input coercion ─────────────────────────────────────────────────────────
/**
 * Force a value coming from a JSON body into a plain string.
 * This is the primary defence against NoSQL operator injection: without it a
 * body like {"email": {"$ne": null}} is passed straight into a Mongo query.
 */
export function asString(value: unknown, maxLength = 512): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLength);
}

export function isPlainString(value: unknown): value is string {
  return typeof value === 'string';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown): string | null {
  const raw = asString(value, 254).trim().toLowerCase();
  if (!raw || !EMAIL_RE.test(raw)) return null;
  return raw;
}

/** Escape regex metacharacters so user input cannot alter the pattern or cause ReDoS. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a safe case-insensitive "contains" filter from untrusted search input.
 * Returns null when the input is unusable.
 */
export function safeSearchRegex(value: unknown, maxLength = 80) {
  const raw = asString(value, maxLength).trim();
  if (!raw) return null;
  return { $regex: escapeRegex(raw), $options: 'i' };
}

/** Keep only the allowed keys from an untrusted object (anti mass-assignment). */
export function pick(source: unknown, allowed: readonly string[]): Record<string, any> {
  const out: Record<string, any> = {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return out;
  for (const key of allowed) {
    const value = (source as Record<string, any>)[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Reject payloads containing Mongo operators / prototype pollution keys at any depth. */
export function hasForbiddenKeys(value: unknown, depth = 0): boolean {
  if (depth > 8 || !value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(v => hasForbiddenKeys(v, depth + 1));
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || key === 'prototype') return true;
    if (hasForbiddenKeys((value as Record<string, any>)[key], depth + 1)) return true;
  }
  return false;
}

// ─── Rate limiting ──────────────────────────────────────────────────────────
// In-memory, per-instance. Good enough to blunt credential stuffing and spam on
// a single-instance deployment; swap for Redis/Upstash if you scale horizontally.
type Bucket = { count: number; resetAt: number };
const buckets: Map<string, Bucket> = ((global as any).__rateLimitBuckets ??= new Map());

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns null when the request is allowed, or a 429 response when it is not.
 */
export function rateLimit(req: Request, bucketName: string, limit: number, windowMs: number): NextResponse | null {
  const key = `${bucketName}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic cleanup so the map cannot grow without bound.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return null;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }
  return null;
}

/** Clear a bucket, e.g. after a successful login. */
export function resetRateLimit(req: Request, bucketName: string) {
  buckets.delete(`${bucketName}:${clientIp(req)}`);
}

// ─── Responses ──────────────────────────────────────────────────────────────
/**
 * Log the real error server-side, return a generic message to the client so we
 * never leak stack traces, driver errors or connection strings.
 */
export function serverError(context: string, err: unknown): NextResponse {
  console.error(`[api] ${context}:`, err);
  return NextResponse.json(
    { success: false, message: 'Internal Server Error' },
    { status: 500 }
  );
}

export const unauthorized = () =>
  NextResponse.json({ success: false, message: 'Access denied. Please login to continue.' }, { status: 401 });

export const forbidden = () =>
  NextResponse.json({ success: false, message: 'Access denied. Admins only.' }, { status: 403 });
