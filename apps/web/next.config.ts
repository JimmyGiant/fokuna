import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fokuna/icons", "@fokuna/tokens", "@fokuna/ui"],
};

export default nextConfig;
