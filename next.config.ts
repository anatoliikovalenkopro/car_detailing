import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/estimate", destination: "/quote", permanent: true }];
  },
};

export default nextConfig;
