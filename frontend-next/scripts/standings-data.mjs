const key = (name) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function parseEspnStandings(payload) {
  const entries = payload.children?.flatMap((group) => group.standings?.entries ?? []);
  if (!entries?.length) throw new Error("ESPN returned no standings; keeping the saved snapshot.");
  const fields = { rank: "rank", played: "gamesPlayed", won: "wins", drawn: "ties", lost: "losses", goals_for: "pointsFor", goals_against: "pointsAgainst", goal_difference: "pointDifferential", points: "points" };
  const seen = new Set();
  return entries.map((entry) => {
    const team = entry.team?.displayName;
    if (typeof team !== "string" || !team.trim() || seen.has(key(team))) throw new Error("ESPN standings contain missing or duplicate clubs.");
    seen.add(key(team));
    const stats = new Map(entry.stats?.map((stat) => [stat.name, stat.value]));
    const row = { team };
    for (const [field, stat] of Object.entries(fields)) {
      const value = stats.get(stat);
      if (!Number.isInteger(value) || (field !== "goal_difference" && value < 0)) throw new Error(`ESPN returned invalid ${field} for ${team}.`);
      row[field] = value;
    }
    if (row.played !== row.won + row.drawn + row.lost || row.goal_difference !== row.goals_for - row.goals_against) {
      throw new Error(`ESPN returned inconsistent standings for ${team}.`);
    }
    return row;
  }).sort((a, b) => a.rank - b.rank);
}

export function projectStandings(current, fixtures) {
  const table = current.map((row) => ({ ...row }));
  const rows = new Map(table.map((row) => [key(row.team), row]));
  if (rows.size !== table.length) throw new Error("Cannot project duplicate clubs.");
  for (const fixture of fixtures) {
    const home = rows.get(key(fixture.homeTeam));
    const away = rows.get(key(fixture.awayTeam));
    const { homeGoals, awayGoals } = fixture;
    if (!home || !away || home === away || ![homeGoals, awayGoals].every((n) => Number.isInteger(n) && n >= 0)) {
      throw new Error("Cannot match a predicted fixture to the fresh standings.");
    }
    for (const [row, scored, conceded] of [[home, homeGoals, awayGoals], [away, awayGoals, homeGoals]]) {
      row.played += 1;
      row.goals_for += scored;
      row.goals_against += conceded;
      row.goal_difference = row.goals_for - row.goals_against;
      row.won += Number(scored > conceded);
      row.drawn += Number(scored === conceded);
      row.lost += Number(scored < conceded);
      row.points += scored > conceded ? 3 : scored === conceded ? 1 : 0;
    }
  }
  return table.sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function upcomingFixtures(fixtures, now) {
  return fixtures.filter((fixture) => {
    const kickoff = Date.parse(fixture.kickoffTime);
    if (!Number.isFinite(kickoff)) throw new Error("La Liga fixture is missing a valid kickoff time.");
    return kickoff > now;
  });
}
