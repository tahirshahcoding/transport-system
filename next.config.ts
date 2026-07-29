import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-pg"],
};

export default nextConfig;
