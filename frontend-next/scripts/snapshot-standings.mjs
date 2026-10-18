import { existsSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildFixtureResults } from "./ucl-fixture-results.mjs";

const root = new URL("../", import.meta.url);
for (const name of [".env.local", ".env"]) {
  const path = new URL(name, root);
  if (existsSync(path)) process.loadEnvFile(fileURLToPath(path));
}
const configured = process.env.UCL_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL;
if (!configured) throw new Error("Set NEXT_PUBLIC_API_URL to your backend origin.");
const origin = configured.replace(/\/+$/, "").replace(/\/api$/, "");
const requested = process.argv.find((arg) => arg.startsWith("--league="))?.split("=")[1];
const leagues = requested ? [requested] : ["epl", "laliga", "ucl"];
if (leagues.some((league) => !["epl", "laliga", "ucl"].includes(league))) throw new Error("Unknown competition.");
const fields = ["rank", "played", "won", "drawn", "lost", "goals_for", "goals_against", "goal_difference", "points"];

async function load(path, standings = false) {
  console.log(`Fetching ${path} once…`);
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(900_000) });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail ?? data));
  if (!Array.isArray(data)) throw new Error(`${path}: expected an array.`);
  if (standings && data.some((row) => typeof row.team !== "string" || fields.some((field) => !Number.isFinite(row[field])))) {
    throw new Error(`${path}: invalid standings.`);
  }
  return standings ? data.sort((a, b) => a.rank - b.rank) : data;
}

for (const league of leagues) {
  const destination = new URL(`data/${league}-standings.json`, root);
  if (existsSync(destination) && !process.argv.includes("--force")) {
    console.log(`Keeping saved ${league} snapshot. Use --force to refresh.`);
    continue;
  }
  try {
    const current = await load(`/${league}/standings`, true);
    const predicted = await load(`/${league}/predicted_table`, true);
    const upcoming = await load(`/${league}/get_fixtures`);
    const fixtures = buildFixtureResults(upcoming, current, predicted);
    const snapshot = { capturedAt: new Date().toISOString(), source: origin, current, predicted, fixtures };
    await mkdir(new URL("data/", root), { recursive: true });
    const temporary = new URL(`data/${league}-standings.json.tmp`, root);
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporary, destination);
    console.log(`Saved ${league}: ${current.length} clubs, ${fixtures.length} matches.`);
  } catch (error) {
    console.error(`${league}: saved snapshot was not replaced: ${error.message}`);
    process.exitCode = 1;
  }
}
