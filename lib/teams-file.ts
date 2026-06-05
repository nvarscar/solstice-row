import path from "path";

/**
 * Resolves the absolute path to teams.json.
 *
 * In production the file lives in the persistent Docker volume mounted at
 * DATA_DIR (default /data), so it survives image rebuilds.
 * In development (source volume-mounted) it falls back to content/teams.json
 * inside the repo, which is the same file you see in the editor.
 */
export function teamsFilePath(): string {
  const dataDir = process.env.DATA_DIR;
  if (dataDir) {
    return path.join(dataDir, "teams.json");
  }
  return path.join(process.cwd(), "content", "teams.json");
}
