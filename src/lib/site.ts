function getRepositoryParts(): { owner: string; repositoryName: string } {
  const [owner = "", repositoryName = ""] = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
  return { owner, repositoryName };
}

export function getSiteBasePath(): string {
  const { owner, repositoryName } = getRepositoryParts();
  if (!owner || !repositoryName || process.env.GITHUB_ACTIONS !== "true") return "";
  return repositoryName === `${owner}.github.io` ? "" : `/${repositoryName}`;
}

export function getSiteUrl(): string {
  const { owner, repositoryName } = getRepositoryParts();
  if (owner && repositoryName && process.env.GITHUB_ACTIONS === "true") {
    const basePath = getSiteBasePath();
    return `https://${owner}.github.io${basePath}`;
  }
  return "http://localhost:3000";
}
