import type { League, PredictionResult, UCLDomesticForm } from "@/types/prediction";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "").replace(/\/api$/, "");
const API_BASE = `${API_ORIGIN}/api`;

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && typeof errorJson === "object" && "detail" in errorJson) {
        errorMsg =
          typeof errorJson.detail === "string"
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
      }
    } catch {
      try {
        const body = await response.text();
        if (body) errorMsg = body;
      } catch {
        // ignore fallback errors
      }
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export async function fetchTeams(league: League = "epl"): Promise<string[]> {
  if (league === "laliga") return (await fetchDomesticTeams("spain")).teams;
  return fetchJson<string[]>(`${API_BASE}/${league}/teams`);
}

export async function fetchDomesticTeams(league: string): Promise<{ league: string; competition_code: string; teams: string[] }> {
  return fetchJson<{ league: string; competition_code: string; teams: string[] }>(
    `${API_BASE}/teams?league=${encodeURIComponent(league)}`
  );
}

interface RawPredictionResponse {
  competition?: string;
  home_team?: string;
  away_team?: string;
  xg_home: number;
  xg_away: number;
  home_win_prob: number;
  draw_prob: number;
  away_win_prob: number;
  predicted_score?: string;
  poisson_matrix: number[][];
  form?: {
    home: { scored: number; conceded: number; is_fallback: boolean };
    away: { scored: number; conceded: number; is_fallback: boolean };
  };
  form_used?: {
    home: { scored_last5: number; conceded_last5: number; is_fallback: boolean };
    away: { scored_last5: number; conceded_last5: number; is_fallback: boolean };
  };
  domestic_form?: UCLDomesticForm;
}

export async function fetchPrediction(
  home_team: string,
  away_team: string,
  league: League = "epl",
  home_league?: string,
  away_league?: string
): Promise<PredictionResult> {
  const isUcl = league === "ucl";
  const endpoint = isUcl ? `${API_BASE}/ucl/predict` : `${API_BASE}/${league}/predict`;

  const body = isUcl
    ? {
        home_team,
        away_team,
        home_league,
        away_league,
      }
    : {
        home_team,
        away_team,
      };

  const raw = await fetchJson<RawPredictionResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Normalize form structure between UCL and EPL/LaLiga
  const normalizedForm = {
    home: {
      scored: raw.form?.home?.scored ?? raw.form_used?.home?.scored_last5 ?? 0,
      conceded: raw.form?.home?.conceded ?? raw.form_used?.home?.conceded_last5 ?? 0,
      is_fallback: raw.form?.home?.is_fallback ?? raw.form_used?.home?.is_fallback ?? false,
    },
    away: {
      scored: raw.form?.away?.scored ?? raw.form_used?.away?.scored_last5 ?? 0,
      conceded: raw.form?.away?.conceded ?? raw.form_used?.away?.conceded_last5 ?? 0,
      is_fallback: raw.form?.away?.is_fallback ?? raw.form_used?.away?.is_fallback ?? false,
    },
  };

  return {
    competition: raw.competition,
    home_team: raw.home_team ?? home_team,
    away_team: raw.away_team ?? away_team,
    predicted_score: raw.predicted_score,
    xg_home: raw.xg_home,
    xg_away: raw.xg_away,
    home_win_prob: raw.home_win_prob,
    draw_prob: raw.draw_prob,
    away_win_prob: raw.away_win_prob,
    poisson_matrix: raw.poisson_matrix,
    form: normalizedForm,
    domestic_form: raw.domestic_form,
  };
}
