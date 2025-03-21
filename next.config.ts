import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["pino", "pino-pretty"],
  images: {
    remotePatterns: [{ hostname: "0emf60eliu.ufs.sh" }],
  },
};

export default nextConfig;
