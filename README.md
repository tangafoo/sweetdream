# sweetdream — mattress storefront

Image-led storefront for 14 mattresses. Customers browse an immersive full-viewport carousel, check per-size prices, and leave reviews (no account needed — protected by Turnstile, rate limiting, and OpenAI moderation of text **and** photos).

## Stack

- **Turborepo + pnpm** monorepo: `apps/web` (Next.js App Router) + `packages/db` (Prisma schema/client, seed)
- **Supabase Postgres** via Prisma (pooled `DATABASE_URL` + `DIRECT_URL` for migrations)
- **Cloudflare R2** public bucket for all imagery (product photos *and* reviewer uploads via presigned PUTs)
- Tailwind v4, Motion (framer-motion successor), zod, Upstash Redis (rate limiting), Cloudflare Turnstile, OpenAI `omni-moderation-latest`
- Deploys to **Vercel** (root directory: `apps/web`)

## Quick start

```sh
pnpm install
cp .env.example .env        # fill in what you have — everything degrades gracefully
pnpm db:push                # create tables in Supabase (uses DIRECT_URL)
pnpm db:seed                # upsert the 14 products (add --with-reviews for demo reviews)
pnpm dev                    # http://localhost:3000
```

**No env vars at all?** The site still runs: pages render from seed data and every image slot shows a designed placeholder. Fill in services as you provision them.

The root `.env` is the single source of truth locally — `apps/web/next.config.ts` and the db scripts both load it.

## Service setup

### Supabase
Create a project → **Connect** → copy the *Transaction pooler* URL into `DATABASE_URL` (keep `?pgbouncer=true&connection_limit=1`) and the *Session/direct* URL into `DIRECT_URL`. Then `pnpm db:push && pnpm db:seed`.

### Cloudflare R2
1. Create a bucket, enable public access, put its public base URL in `NEXT_PUBLIC_R2_PUBLIC_URL`.
2. Create an API token (Object Read & Write) → fill the `R2_*` vars.
3. **CORS** on the bucket (allows browser PUTs for review photos):
   ```json
   [{ "AllowedOrigins": ["http://localhost:3000", "https://<your-prod-domain>"],
      "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"] }]
   ```
4. **Lifecycle rule**: delete objects under prefix `reviews/incoming/` after 1 day (abandoned uploads self-destruct; submitted reviews are copied to `reviews/` first).

### Product images
Drop photos into the bucket at the keys the seed defines — they appear with zero code changes:
```
products/<slug>/hero.webp
products/<slug>/gallery-1.webp … gallery-4.webp
```
The logo is a placeholder component: `apps/web/src/components/brand/Logo.tsx`.

### Turnstile / OpenAI / Upstash
- Turnstile: create a widget, set both keys. Unset = skipped in dev, **fail-closed in prod**.
- OpenAI: any key with moderation access. Moderation failure ⇒ review saved as `PENDING` (hidden; flip to `PUBLISHED` in Supabase Studio if legit). Flagged ⇒ stored `REJECTED` for audit, photos deleted, submitter sees a generic message.
- Upstash: create a Redis DB, set both vars. Unset = in-memory limiter (fine locally only).

## Review pipeline (`POST /api/reviews`)

zod → Turnstile verify → rate limit (3/h/IP; presign 10/10min/IP) → HEAD-verify uploaded objects (size/type/single draft) → one `omni-moderation-latest` call over text + public image URLs → promote images out of `reviews/incoming/` → insert → `revalidatePath` for `/` and the product page.

Photos are downscaled client-side (≤1600px, webp) and PUT **directly to R2** — nothing streams through Vercel, so the 4.5 MB body limit never applies.

## Rendering

`/` and all 14 `/products/[slug]` pages are static (`generateStaticParams`, `dynamicParams = false`, `revalidate = 3600`) and revalidate on demand when a review publishes. The DB is only touched at build/revalidate time and on submissions.

## Deploy (Vercel)

1. Import the repo, set **Root Directory** to `apps/web` (Vercel handles the pnpm/turbo monorepo automatically).
2. Add every var from `.env.example` in project settings.
3. Add the production domain to Turnstile and to the R2 CORS rule.
