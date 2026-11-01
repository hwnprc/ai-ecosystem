import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Serve the standalone value capture explainer at a clean URL.
  async rewrites() {
    return [{ source: "/value-capture", destination: "/value-capture.html" }];
  },
};

export default nextConfig;
