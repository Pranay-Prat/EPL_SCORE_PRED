export interface Standing {
  rank: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface SavedFixture {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  kickoffTime?: string;
  gameweek?: number;
}

export interface MatchweekSnapshot {
  capturedAt: string;
  source: string;
  current: Standing[];
  predicted: Standing[];
  fixtures: SavedFixture[];
}
