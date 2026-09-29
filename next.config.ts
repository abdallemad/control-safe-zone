import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image may optimise only our own R2-backed image route
    // (app/api/images/[...key]) — nothing else, and no query strings.
    localPatterns: [{ pathname: "/api/images/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Image uploads go through Server Actions. Images are capped at 2 MB
      // (IMAGE_MAX_BYTES in constants/images.ts); the extra room
      // covers multipart overhead.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
