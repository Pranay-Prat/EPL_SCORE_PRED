import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEspnStandings, projectStandings, upcomingFixtures } from "./standings-data.mjs";
import { buildFixtureResults } from "./ucl-fixture-results.mjs";

const madrid = { team: "Real Madrid", rank: 1, played: 9, won: 7, drawn: 0, lost: 2, goals_for: 23, goals_against: 9, goal_difference: 14, points: 21 };
const betis = { team: "Real Betis", rank: 2, played: 9, won: 6, drawn: 1, lost: 2, goals_for: 16, goals_against: 14, goal_difference: 2, points: 19 };
const fixture = { homeTeam: "Real Betis", awayTeam: "Real Madrid", homeGoals: 1, awayGoals: 1, kickoffTime: "2026-10-21T18:00:00Z" };

test("ESPN standings preserve provider ranks and completed results", () => {
  const entries = [madrid, betis].map((row) => ({ team: {displayName: row.team}, stats: Object.entries({rank: row.rank, gamesPlayed: row.played, wins: row.won, ties: row.drawn, losses: row.lost, pointsFor: row.goals_for, pointsAgainst: row.goals_against, pointDifferential: row.goal_difference, points: row.points}).map(([name, value]) => ({name, value})) }));
  assert.deepEqual(parseEspnStandings({children:[{standings:{entries:entries.reverse()}}]}), [madrid, betis]);
  entries[0].stats = entries[0].stats.filter((s) => s.name !== "points");
  assert.throws(() => parseEspnStandings({children:[{standings:{entries}}]}), /invalid points/);
  assert.throws(() => parseEspnStandings({children:[]}), /no standings/);
});

test("fresh standings retain a completed win when model projections are reapplied", () => {
  const current = structuredClone([madrid, betis]);
  const projected = projectStandings(current, [fixture]);
  assert.equal(projected.find((r) => r.team === "Real Madrid").points, 22);
  assert.equal(projected.find((r) => r.team === "Real Madrid").played, 10);
  assert.deepEqual(current, [madrid, betis]);
  assert.deepEqual(buildFixtureResults([{home_team_name:fixture.homeTeam, away_team_name:fixture.awayTeam, kickoff_time:fixture.kickoffTime}], current, projected), [fixture]);
});

test("projection supports home wins, away wins, and reassigns ranks", () => {
  const homeWin = projectStandings([madrid, betis], [{...fixture, homeGoals:2, awayGoals:0}]);
  assert.equal(homeWin[0].team, "Real Betis");
  assert.equal(homeWin[0].points, 22);
  assert.equal(homeWin[0].won, 7);
  const awayWin = projectStandings([madrid, betis], [{...fixture, homeGoals:0, awayGoals:2}]);
  assert.equal(awayWin[0].points, 24);
  assert.equal(awayWin[1].lost, 3);
});

test("started matches are excluded rather than counted twice", () => {
  const started = {...fixture, kickoffTime:"2026-10-19T10:00:00Z"};
  assert.deepEqual(upcomingFixtures([started, fixture], Date.parse(started.kickoffTime)), [fixture]);
  assert.throws(() => upcomingFixtures([{...fixture, kickoffTime:undefined}], Date.now()), /valid kickoff/);
});

test("unknown clubs and invalid scores fail instead of corrupting the table", () => {
  assert.throws(() => projectStandings([madrid, betis], [{...fixture, homeTeam:"Unknown"}]), /Cannot match/);
  assert.throws(() => projectStandings([madrid, betis], [{...fixture, homeGoals:-1}]), /Cannot match/);
});
