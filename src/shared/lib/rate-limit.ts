interface RateLimitRule {
  /** Window length in seconds. */
  window: number;
  /** Maximum requests allowed per key inside the window. */
  max: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Small in-memory sliding-window limiter. Counters are per-instance - same
 * trade-off as Better Auth's built-in limiter. Swap the two exported
 * functions for a shared Redis-backed implementation if the app ever runs on
 * more than one instance.
 */
const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 50_000;

const pruneExpired = (now: number) => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
  // Hard bound so an attacker spraying unique keys can't grow memory forever.
  if (buckets.size > MAX_BUCKETS) {
    buckets.clear();
  }
};

/** Best-effort client IP from proxy headers (first x-forwarded-for entry). */
export const getClientIp = (headers: Headers): string => {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) {
      return first.trim();
    }
  }
  return (
    headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown"
  );
};

/**
 * Records one request against `key` and reports whether it is allowed.
 * When denied, `retryAfter` is the seconds until the window frees up.
 */
export const checkRateLimit = (
  key: string,
  rule: RateLimitRule,
): { allowed: boolean; retryAfter: number } => {
  const now = Date.now();
  pruneExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.window * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= rule.max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
};

/** Stable error-envelope 429 response. */
export const tooManyRequestsResponse = (retryAfter: number): Response =>
  new Response(
    JSON.stringify({
      success: false,
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfter),
      },
    },
  );
