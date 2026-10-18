import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../lib/api/predictor.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function client(base, payload, ok = true) {
  const calls = [];
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, process: { env: { NEXT_PUBLIC_API_URL: base } },
    fetch: async (url, options) => { calls.push({ url, options }); return { ok, status: ok ? 200 : 502, json: async () => payload }; },
  });
  return { api: exports, calls };
}

test("backend origins and /api URLs resolve to identical prediction endpoints", async () => {
  for (const base of ["https://backend.example", "https://backend.example/api/"]) {
    const { api, calls } = client(base, ["Arsenal", "Chelsea"]);
    await api.fetchTeams("epl");
    assert.equal(calls[0].url, "https://backend.example/api/epl/teams");
  }
});

test("La Liga uses the shared domestic roster instead of its deprecated endpoint", async () => {
  const { api, calls } = client("https://backend.example/api", { teams: ["Barcelona", "Real Madrid"] });
  const names = await api.fetchTeams("laliga");
  assert.deepEqual(Array.from(names), ["Barcelona", "Real Madrid"]);
  assert.equal(calls[0].url, "https://backend.example/api/teams?league=spain");
});

test("UCL sends selected model names unchanged and includes both domestic leagues", async () => {
  const { api, calls } = client("https://backend.example/api", { xg_home: 1.2, xg_away: 0.7, home_win_prob: 50, draw_prob: 30, away_win_prob: 20, poisson_matrix: [], form_used: { home: { scored_last5: 1.3, conceded_last5: 0.4, is_fallback: true } } });
  const prediction = await api.fetchPrediction("Real Madrid", "Manchester City", "ucl", "spain", "england");
  assert.deepEqual(JSON.parse(calls[0].options.body), { home_team: "Real Madrid", away_team: "Manchester City", home_league: "spain", away_league: "england" });
  assert.equal(calls[0].url, "https://backend.example/api/ucl/predict");
  assert.equal(prediction.form.home.scored, 1.3);
  assert.equal(prediction.form.home.is_fallback, true);
});

test("backend detail messages reach the frontend", async () => {
  const { api } = client("https://backend.example", { detail: "Fixture teams do not match the standings." }, false);
  await assert.rejects(() => api.fetchTeams("epl"), /Fixture teams do not match the standings/);
});
