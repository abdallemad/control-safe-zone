import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image may optimise only our own R2-backed image route
    // (app/api/images/[...key]) — nothing else, and no query strings.
    localPatterns: [{ pathname: "/api/images/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Uploads go through Server Actions. Images are capped at 2 MB
      // (IMAGE_MAX_BYTES in constants/images.ts) and pinout PDFs at 10 MB
      // (PDF_MAX_BYTES in constants/pdf.ts); the extra room covers
      // multipart overhead. The services re-check each file's own cap.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
