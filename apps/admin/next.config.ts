import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fokuna/tokens", "@fokuna/ui", "@fokuna/icons"],
};

export default nextConfig;
