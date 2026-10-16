import { existsSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const destination = new URL("data/ucl-standings.json", root);
const force = process.argv.includes("--force");

if (existsSync(destination) && !force) {
  console.log("Keeping the saved UCL snapshot. Use --force to refresh it for a new matchweek.");
  process.exit(0);
}

for (const filename of [".env.local", ".env"]) {
  const path = new URL(filename, root);
  if (existsSync(path)) process.loadEnvFile(fileURLToPath(path));
}

const configuredUrl = process.env.UCL_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL;
if (!configuredUrl) throw new Error("Set UCL_API_ORIGIN or NEXT_PUBLIC_API_URL to the backend URL.");
const origin = configuredUrl.replace(/\/+$/, "").replace(/\/api$/, "");
const numericFields = ["rank", "played", "won", "drawn", "lost", "goals_for", "goals_against", "goal_difference", "points"];

async function loadStandings(path) {
  console.log(`Fetching ${path} once…`);
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(900_000) });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(typeof payload.detail === "string" ? payload.detail : JSON.stringify(payload.detail ?? payload));
  }
  if (!Array.isArray(payload)) throw new Error(`${path}: expected an array of standings.`);
  return payload.map((row, index) => {
    if (!row || typeof row.team !== "string" || !row.team.trim()) {
      throw new Error(`${path}: invalid team in row ${index + 1}.`);
    }
    const normalized = { team: row.team };
    for (const field of numericFields) {
      if (typeof row[field] !== "number" || !Number.isFinite(row[field])) {
        throw new Error(`${path}: invalid ${field} for ${row.team}.`);
      }
      normalized[field] = row[field];
    }
    return normalized;
  }).sort((a, b) => a.rank - b.rank);
}

try {
  const current = await loadStandings("/ucl/standings");
  const predicted = await loadStandings("/ucl/predicted_table");
  const snapshot = { capturedAt: new Date().toISOString(), source: origin, current, predicted };
  await mkdir(new URL("data/", root), { recursive: true });
  const temporary = new URL("data/ucl-standings.json.tmp", root);
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, destination);
  console.log(`Saved ${current.length} current and ${predicted.length} predicted rows to data/ucl-standings.json.`);
} catch (error) {
  console.error(`UCL snapshot was not replaced: ${error.message}`);
  process.exitCode = 1;
}
