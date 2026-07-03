import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const owner = repository[0] ?? "";
const repositoryName = repository[1] ?? "";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrganizationSite = repositoryName === `${owner}.github.io`;
const basePath = isGitHubPagesBuild && repositoryName && !isUserOrOrganizationSite ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
