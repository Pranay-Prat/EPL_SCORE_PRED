// Recover the exact score applied by predicted_table from each club's GF/GA
// changes. This avoids re-running the expensive model for every fixture.
export function buildFixtureResults(fixtures, current, predicted) {
  if (!Array.isArray(fixtures)) throw new Error("Expected a fixture array.");
  const seen = new Set();
  const key = (name) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return fixtures.map((fixture) => {
    const names = [fixture.home_team_name, fixture.away_team_name];
    const changes = names.map((name) => {
      if (typeof name !== "string" || seen.has(key(name))) {
        throw new Error("Fixture window must contain one match per club.");
      }
      seen.add(key(name));
      const beforeRows = current.filter((row) => key(row.team) === key(name));
      const afterRows = predicted.filter((row) => key(row.team) === key(name));
      const before = beforeRows[0];
      const after = afterRows[0];
      if (beforeRows.length !== 1 || afterRows.length !== 1 || after.played - before.played !== 1) {
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
    return {
      homeTeam: names[0], awayTeam: names[1], homeGoals: home.scored, awayGoals: away.scored,
      ...(fixture.kickoff_time ? { kickoffTime: fixture.kickoff_time } : {}),
      ...(fixture.gameweek != null ? { gameweek: fixture.gameweek } : {}),
    };
  });
}
