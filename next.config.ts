import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The graph page moved from /graph to /ai-ecosystem-graph. Keep old links working.
  async redirects() {
    return [{ source: "/graph", destination: "/ai-ecosystem-graph", permanent: true }];
  },
};

export default nextConfig;
