import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Explicitly set the project root to prevent lockfile detection issues
    // when parent directories also contain lockfiles
    root: __dirname,
  },
};

export default nextConfig;
