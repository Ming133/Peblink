import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel builds the standard Next.js application and should not type-check
  // Cloudflare-only worker, D1, or vinext support files.
  typescript: {
    tsconfigPath: "./tsconfig.vercel.json",
  },
};

export default nextConfig;
