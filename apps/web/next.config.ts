import path from "node:path";
import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

// Single source of truth for env in local dev: the repo-root .env.
// (No-op on Vercel, where env comes from project settings.)
loadEnv({ path: path.join(process.cwd(), "../../.env") });

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  transpilePackages: ["@sd/db"],
  images: {
    remotePatterns: r2PublicUrl
      ? [{ protocol: "https" as const, hostname: new URL(r2PublicUrl).hostname }]
      : [],
  },
};

export default nextConfig;
