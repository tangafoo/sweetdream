import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LimitKind = "presign" | "submit";

interface LimitVerdict {
  ok: boolean;
  retryAfterSeconds?: number;
}

const WINDOWS: Record<LimitKind, { limit: number; windowSeconds: number }> = {
  presign: { limit: 10, windowSeconds: 600 }, // 10 / 10 min / IP
  submit: { limit: 3, windowSeconds: 3600 }, // 3 reviews / hour / IP
};

const upstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const limiters: Partial<Record<LimitKind, Ratelimit>> = {};

function upstashLimiter(kind: LimitKind): Ratelimit {
  if (!limiters[kind]) {
    const { limit, windowSeconds } = WINDOWS[kind];
    limiters[kind] = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `rl:${kind}`,
    });
  }
  return limiters[kind]!;
}

// Dev fallback: per-instance sliding window. Resets on cold start — fine
// locally, too weak for production (hence the warning).
const memoryHits = new Map<string, number[]>();
let warnedMemory = false;

function memoryLimit(kind: LimitKind, ip: string): LimitVerdict {
  if (!warnedMemory && process.env.NODE_ENV === "production") {
    warnedMemory = true;
    console.warn("[ratelimit] Upstash not configured — using in-memory limiter (not durable on serverless)");
  }
  const { limit, windowSeconds } = WINDOWS[kind];
  const key = `${kind}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const hits = (memoryHits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfterSeconds = Math.ceil((hits[0] + windowMs - now) / 1000);
    memoryHits.set(key, hits);
    return { ok: false, retryAfterSeconds };
  }
  hits.push(now);
  memoryHits.set(key, hits);
  return { ok: true };
}

export async function rateLimit(kind: LimitKind, ip: string): Promise<LimitVerdict> {
  if (!upstashConfigured) return memoryLimit(kind, ip);
  const res = await upstashLimiter(kind).limit(ip);
  if (res.success) return { ok: true };
  return {
    ok: false,
    retryAfterSeconds: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
  };
}
