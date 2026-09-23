import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves a project site under /<repo>/. The deploy workflow sets
  // PAGES_BASE_PATH; local builds leave it empty and serve from the root.
  basePath: process.env.PAGES_BASE_PATH || undefined,
  // Dev-only. Next 16 blocks /_next/* for non-localhost origins by default, which
  // silently breaks HMR and the client bundle when the app is opened on the LAN
  // address instead of localhost. Ignored by `next build`.
  allowedDevOrigins: ["192.168.0.58", "localhost", "127.0.0.1"],
  // Stop `next dev` appending its agent-rules block to this project's CLAUDE.md.
  agentRules: false,
  // Pin the workspace root so Turbopack never walks up into the home directory.
  turbopack: { root: path.resolve(process.cwd()) },
  images: { unoptimized: true },
  trailingSlash: true,
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
