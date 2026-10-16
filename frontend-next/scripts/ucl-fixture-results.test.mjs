import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildFixtureResults } from "./ucl-fixture-results.mjs";

const snapshot = JSON.parse(await readFile(new URL("../data/ucl-standings.json", import.meta.url), "utf8"));
const fixtures = snapshot.fixtures.map((match) => ({ home_team_name: match.homeTeam, away_team_name: match.awayTeam }));

test("every saved fixture reproduces its score and points from the projected table", () => {
  assert.deepEqual(buildFixtureResults(fixtures, snapshot.current, snapshot.predicted), snapshot.fixtures);
  assert.equal(new Set(snapshot.fixtures.flatMap((match) => [match.homeTeam, match.awayTeam])).size, snapshot.fixtures.length * 2);
});

test("a fixture outside the saved window is rejected", () => {
  assert.throws(() => buildFixtureResults([{ home_team_name: "Unknown club", away_team_name: fixtures[0].away_team_name }], snapshot.current, snapshot.predicted), /Refresh standings/);
});

test("multiple matches per club are rejected instead of inventing scores", () => {
  assert.throws(() => buildFixtureResults([fixtures[0], fixtures[0]], snapshot.current, snapshot.predicted), /one match per club/);
});

test("contradictory goal and points changes are rejected", () => {
  const projected = structuredClone(snapshot.predicted);
  projected.find((row) => row.team === fixtures[0].home_team_name).goals_for += 1;
  assert.throws(() => buildFixtureResults(fixtures, snapshot.current, projected), /disagree/);
});

test("an empty fixture window produces an empty match list", () => {
  assert.deepEqual(buildFixtureResults([], snapshot.current, snapshot.predicted), []);
});
