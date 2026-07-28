import { createHash } from "node:crypto";

/**
 * On Vercel both headers are platform-set and unspoofable. If you ever
 * self-host or add a CDN that *appends* to x-forwarded-for instead of
 * replacing it, revisit this — the leftmost XFF hop is client-controlled
 * on such setups, which would let callers rotate past the rate limits.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${ip}${salt}`).digest("hex");
}
