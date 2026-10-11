"""
UEFA Champions League Match Prediction Service
Provides full ML + Poisson prediction logic for UEFA Champions League fixtures,
fully compatible with the FastAPI backend and Next.js frontend architecture.
"""

import os
import numpy as np
import pandas as pd
import joblib
from scipy.stats import poisson

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
# Empirical average goals per match in UCL matches
LEAGUE_FALLBACK_SCORED = 1.40
LEAGUE_FALLBACK_CONCEDED = 1.30
MAX_GOALS = 10  # Poisson goal matrix dimension (0 to 9 goals)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

_HOME_MODEL_PATH = os.path.join(_CURRENT_DIR, "UCL_optimized_model_home.pkl")
_AWAY_MODEL_PATH = os.path.join(_CURRENT_DIR, "UCL_optimized_model_away.pkl")

# Fallback to baseline if optimized not found
if not os.path.exists(_HOME_MODEL_PATH):
    _HOME_MODEL_PATH = os.path.join(_CURRENT_DIR, "UCL_model_home_goals.pkl")
if not os.path.exists(_AWAY_MODEL_PATH):
    _AWAY_MODEL_PATH = os.path.join(_CURRENT_DIR, "UCL_model_away_goals.pkl")

model_home = joblib.load(_HOME_MODEL_PATH)
model_away = joblib.load(_AWAY_MODEL_PATH)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _safe_parse_form(val: float, fallback: float) -> tuple[float, bool]:
    """Parse form metric with fallback on null, nan, or error."""
    if val is None:
        return fallback, True
    try:
        val_f = float(val)
        if np.isnan(val_f) or val_f < 0:
            return fallback, True
        return val_f, False
    except Exception:
        return fallback, True


# ---------------------------------------------------------------------------
# Main Prediction Function
# ---------------------------------------------------------------------------
def predict_ucl_match(
    home_team: str,
    away_team: str,
    h_scored: float = None,
    h_conceded: float = None,
    a_scored: float = None,
    a_conceded: float = None,
) -> dict:
    """
    Run full UCL score & outcome prediction.
    
    Parameters:
    - home_team: Name of Home Team (e.g. 'Real Madrid')
    - away_team: Name of Away Team (e.g. 'Manchester City')
    - h_scored: Recent form average goals scored per match (last 5 games)
    - h_conceded: Recent form average goals conceded per match (last 5 games)
    - a_scored: Recent form average goals scored per match (last 5 games)
    - a_conceded: Recent form average goals conceded per match (last 5 games)
    
    Returns:
    - Dictionary with xg_home, xg_away, home_win_prob, draw_prob, away_win_prob,
      and 10x10 poisson_matrix.
    """
    # 1. Resolve form metrics (or use empirical fallbacks)
    h_sc, h_sc_fb = _safe_parse_form(h_scored, LEAGUE_FALLBACK_SCORED)
    h_co, h_co_fb = _safe_parse_form(h_conceded, LEAGUE_FALLBACK_CONCEDED)
    a_sc, a_sc_fb = _safe_parse_form(a_scored, LEAGUE_FALLBACK_SCORED)
    a_co, a_co_fb = _safe_parse_form(a_conceded, LEAGUE_FALLBACK_CONCEDED)

    # 2. Build feature DataFrame (Matching exact model schema)
    input_data = pd.DataFrame(
        {
            "HomeTeam": [home_team],
            "AwayTeam": [away_team],
            "Home_GoalsScored_Last5": [h_sc],
            "Home_GoalsConceded_Last5": [h_co],
            "Away_GoalsScored_Last5": [a_sc],
            "Away_GoalsConceded_Last5": [a_co],
        }
    )

    # 3. Predict Expected Goals (xG)
    xg_home = float(model_home.predict(input_data)[0])
    xg_away = float(model_away.predict(input_data)[0])

    # Ensure non-negative goals
    xg_home = max(0.05, xg_home)
    xg_away = max(0.05, xg_away)

    # 4. Generate Poisson probability matrix
    home_probs = poisson.pmf(np.arange(MAX_GOALS), xg_home)
    away_probs = poisson.pmf(np.arange(MAX_GOALS), xg_away)
    prob_matrix = np.outer(home_probs, away_probs)

    home_win_prob = float(np.sum(np.tril(prob_matrix, -1))) * 100
    draw_prob = float(np.sum(np.diag(prob_matrix))) * 100
    away_win_prob = float(np.sum(np.triu(prob_matrix, 1))) * 100

    # 5. Build standardized response payload
    return {
        "competition": "UEFA Champions League",
        "home_team": home_team,
        "away_team": away_team,
        "xg_home": round(xg_home, 2),
        "xg_away": round(xg_away, 2),
        "home_win_prob": round(home_win_prob, 1),
        "draw_prob": round(draw_prob, 1),
        "away_win_prob": round(away_win_prob, 1),
        "predicted_score": f"{int(round(xg_home))}-{int(round(xg_away))}",
        "poisson_matrix": [
            [round(float(prob_matrix[h][a]), 4) for a in range(MAX_GOALS)]
            for h in range(MAX_GOALS)
        ],
        "form_used": {
            "home": {
                "scored_last5": round(h_sc, 2),
                "conceded_last5": round(h_co, 2),
                "is_fallback": h_sc_fb or h_co_fb,
            },
            "away": {
                "scored_last5": round(a_sc, 2),
                "conceded_last5": round(a_co, 2),
                "is_fallback": a_sc_fb or a_co_fb,
            },
        },
    }


if __name__ == "__main__":
    print("Testing UCL Prediction Service...\n")
    sample = predict_ucl_match(
        home_team="Real Madrid",
        away_team="Manchester City",
        h_scored=2.40,
        h_conceded=1.00,
        a_scored=2.20,
        a_conceded=0.80,
    )
    print(f"Matchup: {sample['home_team']} vs {sample['away_team']}")
    print(f"Expected Goals (xG): {sample['home_team']} {sample['xg_home']} - {sample['xg_away']} {sample['away_team']}")
    print(f"Predicted Score: {sample['predicted_score']}")
    print(f"Probabilities -> Home Win: {sample['home_win_prob']}% | Draw: {sample['draw_prob']}% | Away Win: {sample['away_win_prob']}%")
