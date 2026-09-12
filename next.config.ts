import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Preserve the established lab runtime. Season 2 checks do not count renders;
  // globally enabling StrictMode still needs a full curriculum compatibility run.
  reactStrictMode: false,
};

export default nextConfig;
