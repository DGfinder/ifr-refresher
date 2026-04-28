import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

// Build/dev are pinned to webpack via package.json scripts because
// @serwist/next does not support Turbopack (no SW would be emitted).
const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
