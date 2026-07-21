import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@fokuna/api-contracts",
    "@fokuna/db",
    "@fokuna/domain",
    "@fokuna/icons",
    "@fokuna/tokens",
    "@fokuna/ui",
  ],
};

export default nextConfig;
