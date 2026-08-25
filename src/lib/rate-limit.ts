/**
 * In-memory sliding-window rate limiter.
 *
 * SCOPE AND HONEST LIMITATIONS
 * ----------------------------
 * State lives in the process. On Vercel that means the limit is per serverless
 * instance, not global — a determined attacker spreading requests across cold
 * starts can exceed the nominal rate. This is a deliberate trade-off, not an
 * oversight:
 *
 *   - It stops the realistic threat (a script hammering one endpoint from one
 *     address) with zero infrastructure and zero added dependencies.
 *   - It is not the only defence. The honeypot, the timing check and the
 *     required-field validation all sit in front of the mail send.
 *   - For a corporate contact form receiving a handful of messages a week, a
 *     Redis-backed limiter would be operational overhead out of all proportion
 *     to the risk.
 *
 * If volume ever justifies it, swap this for `@upstash/ratelimit` — the call
 * signature below is intentionally the same shape, so only this file changes.
 * That upgrade path is documented in PROJECT_DOCUMENTATION.md.
 */

interface Bucket {
  /** Epoch-ms timestamps of recent hits, oldest first. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** Stop the map growing without bound in a long-lived process. */
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  ok: boolean;
  /** Requests still allowed in the current window. */
  remaining: number;
  /** Seconds until the window frees up. Only meaningful when `ok` is false. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    // Cheap eviction: when the map is full, drop entries whose window has
    // fully expired. Avoids an LRU structure for a map this small.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [existingKey, existing] of buckets) {
        const last = existing.hits[existing.hits.length - 1];
        if (last === undefined || last < cutoff) buckets.delete(existingKey);
      }
    }
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  // Drop hits that have slid out of the window.
  while (bucket.hits.length > 0 && (bucket.hits[0] ?? 0) < cutoff) {
    bucket.hits.shift();
  }

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.hits.length),
    retryAfter: 0,
  };
}

/**
 * Best-effort client IP.
 *
 * `x-forwarded-for` is only trustworthy behind a proxy that sets it, which is
 * the case on Vercel and on any sane reverse-proxy deployment. The leftmost
 * entry is the original client. Falls back to a constant so the limiter still
 * applies (globally, conservatively) if no header is present.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
