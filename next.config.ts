import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i1.sndcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a1.sndcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.sndcdn.com',
      },
    ],
  },
};

export default nextConfig;
