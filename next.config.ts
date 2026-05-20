import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/platform/pwa/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Use webpack for builds (Serwist doesn't support Turbopack yet)
  turbopack: {},
  allowedDevOrigins: ["127.0.0.1"],
};

export default withSerwist(nextConfig);
