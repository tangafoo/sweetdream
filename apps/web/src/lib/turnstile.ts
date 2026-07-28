interface TurnstileVerdict {
  ok: boolean;
  reason?: string;
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<TurnstileVerdict> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[turnstile] TURNSTILE_SECRET_KEY unset — skipping verification (dev only)");
      return { ok: true };
    }
    // fail closed in production
    return { ok: false, reason: "turnstile_not_configured" };
  }

  if (!token) return { ok: false, reason: "missing_token" };

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success ? { ok: true } : { ok: false, reason: "verification_failed" };
  } catch {
    return { ok: false, reason: "verification_error" };
  }
}
