// Recover the exact score applied by predicted_table from each club's GF/GA
// changes. This avoids re-running the expensive model for every fixture.
export function buildFixtureResults(fixtures, current, predicted) {
  if (!Array.isArray(fixtures)) throw new Error("Expected a fixture array.");
  const seen = new Set();
  return fixtures.map((fixture) => {
    const names = [fixture.home_team_name, fixture.away_team_name];
    const changes = names.map((name) => {
      if (typeof name !== "string" || seen.has(name)) {
        throw new Error("Fixture window must contain one match per club.");
      }
      seen.add(name);
      const before = current.find((row) => row.team === name);
      const after = predicted.find((row) => row.team === name);
      if (!before || !after || after.played - before.played !== 1) {
        throw new Error(`Refresh standings: ${name} does not have exactly one projected match.`);
      }
      return {
        scored: after.goals_for - before.goals_for,
        conceded: after.goals_against - before.goals_against,
        points: after.points - before.points,
      };
    });
    const [home, away] = changes;
    if (![home.scored, away.scored].every((score) => Number.isInteger(score) && score >= 0)
      || home.scored !== away.conceded || away.scored !== home.conceded
      || home.points !== (home.scored > away.scored ? 3 : home.scored === away.scored ? 1 : 0)
      || away.points !== (away.scored > home.scored ? 3 : away.scored === home.scored ? 1 : 0)) {
      throw new Error(`Fixture and saved projection disagree: ${names.join(" vs ")}.`);
    }
    return { homeTeam: names[0], awayTeam: names[1], homeGoals: home.scored, awayGoals: away.scored };
  });
}
