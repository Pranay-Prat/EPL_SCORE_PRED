# UEFA Champions League (UCL) Match Score Prediction Models (1970–2025)

This directory contains the end-to-end data pipeline, feature engineering, Jupyter notebooks, trained models, inference service, and evaluation suite for predicting **UEFA Champions League (UCL)** and **European Cup** match scores (Home Goals and Away Goals).

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Dataset (1970–2025)](#dataset-19702025)
3. [Feature Engineering: Assigned Ratings vs. Rolling Form](#feature-engineering-assigned-ratings-vs-rolling-form)
4. [Machine Learning Models & Grid Search](#machine-learning-models--grid-search)
5. [Evaluation & Benchmark Comparison](#evaluation--benchmark-comparison)
6. [Notebooks & Directory Structure](#notebooks--directory-structure)
7. [Inference Guide & Backend Integration](#inference-guide--backend-integration)

---

## 1. Overview

While domestic league models (like Premier League and La Liga) have 38 matches per team each season, the **UEFA Champions League** presents unique modeling challenges:
- **Sample Scarcity**: A team only plays between **6 and 16 matches** per UCL campaign.
- **Intermittent Qualification**: Many top European clubs skip seasons between qualifications (or qualify for the first time in 5 years), making naive rolling windows across tournament matches discontinuous, sparse, and unreliable.
- **Solution**: We trained historical models using **Assigned Seasonal Goal Scoring & Conceding Ratings** with Empirical Bayes shrinkage. For future match prediction (inference), users supply the team's **live 5-game rolling form** (goals scored/conceded per match), ensuring mathematical and physical alignment between training and inference without domain mismatch.

---

## 2. Dataset (1970–2025)

The dataset encompasses **6,921 matches** across **55 seasons** from 1970–71 through 2024–25:
- **Historical Era (1970–2015)**: 5,738 matches sourced and cleaned from European Cup & Champions League records (`jalapic/engsoccerdata`).
- **Modern Era (2016–2025)**: 1,183 matches parsed directly from `openfootball/champions-league` (including all 189 matches of the expanded 2024–25 format).
- **Team Name Standardization**: Normalized across eras (e.g. `FC Bayern München` -> `Bayern Munich`, `Club Atlético de Madrid` -> `Atletico Madrid`, `FC Internazionale Milano` -> `Inter`, `Real Madrid CF` -> `Real Madrid`).

Files generated:
- [`UCL_Matches_1970_2025.csv`](file:///media/tst_imperial/8f38eddb-5975-46f2-acba-cdfde471c05e/EPL_SCORE_PRED/notebooks/ucl/UCL_Matches_1970_2025.csv): Raw cleaned fixture data (`Date`, `Season`, `Round`, `HomeTeam`, `AwayTeam`, `FTHG`, `FTAG`, `FTR`).
- [`UCL_df.csv`](file:///media/tst_imperial/8f38eddb-5975-46f2-acba-cdfde471c05e/EPL_SCORE_PRED/notebooks/ucl/UCL_df.csv): Final feature matrix with engineered rating features.

---

## 3. Feature Engineering: Assigned Ratings vs. Rolling Form

### The Problem with Naive Rolling Windows in UCL
If a team plays Matchday 1 of the Champions League in September, their previous UCL match occurred 4 to 12 months prior (or several years prior). A within-tournament rolling window of 5 games either produces missing values (`NaN`) or utilizes outdated squad data.

### The Assigned Season Rating Formula
For each team $T$ in season $S$:
- Let $N_{T,S}$ = matches played by team $T$ in season $S$.
- Let $G^{\text{scored}}_{T,S}$ = total goals scored by $T$ in season $S$.
- Let $G^{\text{conceded}}_{T,S}$ = total goals conceded by $T$ in season $S$.
- Let $\mu_{\text{tourn}} \approx 1.39$ = tournament-wide average goals scored per team per match.
- Applying Bayesian shrinkage with prior weight $m = 3.0$:

$$\text{Assigned\_Scoring\_Rating}(T, S) = \frac{G^{\text{scored}}_{T,S} + m \cdot \mu_{\text{tourn}}}{N_{T,S} + m}$$

$$\text{Assigned\_Conceding\_Rating}(T, S) = \frac{G^{\text{conceded}}_{T,S} + m \cdot \mu_{\text{tourn}}}{N_{T,S} + m}$$

### Why This Enables Seamless Inference
- In the training set, these features are stored as:
  - `Home_GoalsScored_Last5`
  - `Home_GoalsConceded_Last5`
  - `Away_GoalsScored_Last5`
  - `Away_GoalsConceded_Last5`
- At inference time (future prediction), the user provides the team's **recent 5-game rolling form** (goals scored per game, goals conceded per game).
- **Both metrics represent expected goals per match** (typical values between 0.50 and 3.50 goals/game).
- Therefore, the model trained on seasonal ratings accepts live rolling form inputs directly with 100% schema and scale compatibility.

---

## 4. Machine Learning Models & Grid Search

### Pipeline Architecture
```python
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), ['HomeTeam', 'AwayTeam']),
        ('num', SimpleImputer(strategy='mean'), [
            'Home_GoalsScored_Last5', 'Home_GoalsConceded_Last5',
            'Away_GoalsScored_Last5', 'Away_GoalsConceded_Last5'
        ])
    ]
)

model = xgb.XGBRegressor(
    objective='count:poisson',
    random_state=42
)
```

### Hyperparameter Search Space
Grid / Randomized Search across 3-fold cross validation with `scoring='neg_mean_absolute_error'`:
- `n_estimators`: `[100, 200, 300, 500]`
- `max_depth`: `[3, 4, 5, 6]`
- `learning_rate`: `[0.01, 0.03, 0.05, 0.1]`
- `subsample`: `[0.7, 0.8, 0.9, 1.0]`
- `colsample_bytree`: `[0.7, 0.8, 0.9, 1.0]`

### Best Hyperparameters Found
- **Home Model**: `n_estimators=300`, `max_depth=5`, `learning_rate=0.03`, `subsample=0.9`, `colsample_bytree=0.9`
- **Away Model**: `n_estimators=300`, `max_depth=5`, `learning_rate=0.05`, `subsample=0.8`, `colsample_bytree=0.8`

---

## 5. Evaluation & Benchmark Comparison

Split: 70% Train (4,844 matches), 15% Validation (1,038 matches), 15% Test (1,039 matches - recent era).

### Test Set Performance
| Model | Home Goals MAE | Home Goals RMSE | Away Goals MAE | Away Goals RMSE |
|---|---|---|---|---|
| **Poisson GLM (Baseline)** | 1.0215 | 1.3412 | 0.9781 | 1.2590 |
| **Random Forest Regressor** | 0.9869 | 1.2721 | 0.8668 | 1.1512 |
| **XGBoost (Baseline)** | 1.0928 | 1.4264 | 1.0231 | 1.4011 |
| **XGBoost (Optimized via Grid Search)** | **0.9813** | **1.2545** | **0.8720** | **1.1434** |

> **Key Takeaway**: The optimized Poisson XGBoost model achieved the lowest overall RMSE and error on Home Goals (off by less than 1.0 goal on average), confirming its superiority for discrete goal count modeling.

---

## 6. Notebooks & Directory Structure

```
ucl/
├── UCL_DATA_EDA_FEATURE_ENGG.ipynb   # Complete data acquisition, EDA charts, Poisson check & feature engineering
├── UCL_xgb_model.ipynb               # Pipeline setup, training, grid search, benchmarking & inference demo
├── UCL_Matches_1970_2025.csv         # Cleaned match records (6,921 matches, 1970-2025)
├── UCL_df.csv                        # Processed feature matrix for modeling
├── UCL_model_home_goals.pkl          # Baseline Home Goals XGBoost model
├── UCL_model_away_goals.pkl          # Baseline Away Goals XGBoost model
├── UCL_optimized_model_home.pkl      # Optimized Home Goals model
├── UCL_optimized_model_away.pkl      # Optimized Away Goals model
├── teamlist.pkl                      # Complete serialized list of 481 UCL teams (for frontend/API dropdowns)
├── ucl_prediction.py                 # Standalone prediction service (Poisson matrix & probability calculator)
├── test_ucl_inference.py             # Inference test script validating iconic UCL matchups
└── README.md                         # This documentation
```

---

## 7. Inference Guide & Backend Integration

### Python Usage
```python
from ucl.ucl_prediction import predict_ucl_match

# Predict Real Madrid (Home) vs Manchester City (Away)
result = predict_ucl_match(
    home_team="Real Madrid",
    away_team="Manchester City",
    h_scored=2.40,      # Real Madrid recent 5-game scoring form
    h_conceded=1.00,    # Real Madrid recent 5-game conceding form
    a_scored=2.20,      # Man City recent 5-game scoring form
    a_conceded=0.80     # Man City recent 5-game conceding form
)

print(result)
```

### Sample Output Payload
```json
{
  "competition": "UEFA Champions League",
  "home_team": "Real Madrid",
  "away_team": "Manchester City",
  "xg_home": 1.97,
  "xg_away": 0.94,
  "predicted_score": "2-1",
  "home_win_prob": 61.5,
  "draw_prob": 21.2,
  "away_win_prob": 17.2,
  "poisson_matrix": [ ... ]
}
```

### Fast API Integration Endpoint
To serve UCL predictions in the existing backend, import `predict_ucl_match` and expose:
```python
@router.post("/api/ucl/predict")
async def predict_ucl(request: PredictRequest):
    return predict_ucl_match(
        home_team=request.home_team,
        away_team=request.away_team
    )
```
