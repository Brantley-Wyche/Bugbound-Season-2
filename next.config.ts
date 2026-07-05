import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // StrictMode double-invokes renders and effects in dev, which would make the
  // in-app check harness report false failures. Off, deliberately — same call
  // as Season 1.
  reactStrictMode: false,
};

export default nextConfig;
