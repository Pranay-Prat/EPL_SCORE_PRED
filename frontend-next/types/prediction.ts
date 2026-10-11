export type League = "epl" | "laliga" | "ucl";

export interface TeamForm {
  scored: number;
  conceded: number;
  is_fallback: boolean;
}

export interface UCLDomesticFormItem {
  league: string;
  league_name: string;
  competition_code?: string;
  team: string;
  data_team?: string;
  last_n?: number;
  home_matches?: number;
  home_scored?: number;
  home_conceded?: number;
  away_matches?: number;
  away_scored?: number;
  away_conceded?: number;
}

export interface UCLDomesticForm {
  home: UCLDomesticFormItem | null;
  away: UCLDomesticFormItem | null;
}

export interface PredictionResult {
  competition?: string;
  home_team?: string;
  away_team?: string;
  predicted_score?: string;
  xg_home: number;
  xg_away: number;
  home_win_prob: number;
  draw_prob: number;
  away_win_prob: number;
  poisson_matrix: number[][];
  form: {
    home: TeamForm;
    away: TeamForm;
  };
  domestic_form?: UCLDomesticForm;
}
