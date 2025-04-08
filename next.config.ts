import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // new URL('https://i.postimg.cc/') as RemotePattern,
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**"
      }
    ],
  }
};

export default nextConfig;
