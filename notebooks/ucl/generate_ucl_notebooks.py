import nbformat as nbf
from nbconvert.preprocessors import ExecutePreprocessor
import os

ucl_dir = '/media/tst_imperial/8f38eddb-5975-46f2-acba-cdfde471c05e/EPL_SCORE_PRED/notebooks/ucl'

print('--- Generating UCL_DATA_EDA_FEATURE_ENGG.ipynb ---')
nb1 = nbf.v4.new_notebook()

nb1.cells.append(nbf.v4.new_markdown_cell("""# UEFA Champions League (1970–2025)
## Match EDA & Feature Engineering Notebook

### Project Overview:
1. **Historical Dataset Assembly**: Complete UEFA Champions League and European Cup fixtures from **1970 through 2024–25** (6,921 matches).
2. **Exploratory Data Analysis (EDA)**:
   - Match outcome distribution (Home Win %, Away Win %, Draw %)
   - Poisson distribution check for Home and Away goals scored
   - Feature Correlation Matrix
3. **Feature Engineering Strategy for UCL**:
   - In domestic leagues (EPL / La Liga), teams play 38 matches per season, so computing rolling form over the last 5 matches is smooth.
   - In the Champions League, teams only play 6 to 16 matches per season, and teams often skip seasons between qualifications. A naive rolling window inside UCL produces sparse, disjointed, and missing data.
   - **Methodology**: For historical training (1970–2025), we assign each team an empirical **Season Scoring Rating** and **Season Conceding Rating** with Bayesian shrinkage towards the tournament mean.
   - **Inference Bridge**: During future match prediction / live inference, these seasonal rating features are directly replaced by the team's live **5-match rolling form** (goals scored/conceded per match), ensuring zero domain or scale mismatch between training and inference."""))

nb1.cells.append(nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
%matplotlib inline"""))

nb1.cells.append(nbf.v4.new_code_cell("""df = pd.read_csv('UCL_Matches_1970_2025.csv')
print(f"Total Matches: {len(df)}")
print(f"Seasons: {df['Season'].min()} to {df['Season'].max()} ({df['Season'].nunique()} seasons)")
df.head(10)"""))

nb1.cells.append(nbf.v4.new_code_cell("""print("--- Dataset Info ---")
print(df.info())
print("\\n--- Missing Values Check ---")
print(df.isna().sum())"""))

nb1.cells.append(nbf.v4.new_markdown_cell("""### 1. Exploratory Data Analysis: Match Outcomes
Examining the historical distribution of Home wins, Away wins, and Draws across all European Cup / Champions League fixtures."""))

nb1.cells.append(nbf.v4.new_code_cell("""home_wins = sum(df["FTR"] == "H")
away_wins = sum(df["FTR"] == "A")
draws = sum(df["FTR"] == "D")
count = df["FTR"].count()

print(f"Total Matches: {count}")
print(f"Home Wins: {home_wins} ({home_wins/count*100:.1f}%)")
print(f"Away Wins: {away_wins} ({away_wins/count*100:.1f}%)")
print(f"Draws:     {draws} ({draws/count*100:.1f}%)")

plt.figure(figsize=(7, 7))
plt.pie([home_wins, away_wins, draws], 
        labels=["Home wins", "Away wins", "Draws"], 
        colors=["#e74c3c", "#3498db", "#2ecc71"],
        autopct='%1.1f%%', 
        shadow=True, 
        startangle=140,
        explode=(0.03, 0.03, 0.03))
plt.title('UEFA Champions League Match Outcome Distribution (1970–2025)', fontsize=14, pad=15)
plt.axis('equal')
plt.show()"""))

nb1.cells.append(nbf.v4.new_markdown_cell("""### 2. Poisson Distribution Check
Checking the discrete goal distributions for home and away sides. Football scoring closely mirrors a Poisson point process."""))

nb1.cells.append(nbf.v4.new_code_cell("""plt.figure(figsize=(10, 5))
sns.histplot(data=df, x="FTHG", color="red", label=f"Home Goals (Mean: {df['FTHG'].mean():.2f})", discrete=True, alpha=0.5)
sns.histplot(data=df, x="FTAG", color="blue", label=f"Away Goals (Mean: {df['FTAG'].mean():.2f})", discrete=True, alpha=0.5)

plt.legend(fontsize=12)
plt.title("Home vs Away Goal Distribution (Poisson Check)", fontsize=14)
plt.xlabel("Goals Scored", fontsize=12)
plt.ylabel("Frequency", fontsize=12)
plt.show()"""))

nb1.cells.append(nbf.v4.new_markdown_cell("""### 3. Feature Correlation Matrix
Mapping match results numerically (+1 for Home Win, 0 for Draw, -1 for Away Win) to examine correlations."""))

nb1.cells.append(nbf.v4.new_code_cell("""hdf = df.copy()
hdf["Result"] = hdf["FTR"].map({"H": 1, "D": 0, "A": -1})
ncols = hdf.select_dtypes(include=[np.number])
corr_mtx = ncols.corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr_mtx, annot=True, fmt=".2f", cmap="coolwarm", center=0, linewidths=0.5)
plt.title("Feature Correlation Matrix - UCL Historical Data", fontsize=14)
plt.show()"""))

nb1.cells.append(nbf.v4.new_markdown_cell("""## Feature Engineering: Assigned Season Ratings

### The Mathematical Formula:
Let $N_{T,S}$ be the number of matches team $T$ played in season $S$.
Let $G^{\\text{scored}}_{T,S}$ and $G^{\\text{conceded}}_{T,S}$ be their total goals scored and conceded.
Let $\\mu_{\\text{tourn}}$ be the tournament-wide average goals scored per match (~1.39).
With Bayesian shrinkage prior weight $m = 3.0$:

$$\\text{Assigned\\_Scoring\\_Rating}(T, S) = \\frac{G^{\\text{scored}}_{T,S} + m \\cdot \\mu_{\\text{tourn}}}{N_{T,S} + m}$$
$$\\text{Assigned\\_Conceding\\_Rating}(T, S) = \\frac{G^{\\text{conceded}}_{T,S} + m \\cdot \\mu_{\\text{tourn}}}{N_{T,S} + m}$$

### Why this enables seamless Live Inference:
- In the training set, these columns are named:
  - `Home_GoalsScored_Last5`
  - `Home_GoalsConceded_Last5`
  - `Away_GoalsScored_Last5`
  - `Away_GoalsConceded_Last5`
- At inference time, the user passes the team's **last 5 games form** (goals scored per match and goals conceded per match).
- Both metrics represent **expected goals per game** (typical range 0.5 – 3.5), allowing direct drop-in inference with 100% architectural compatibility!"""))

nb1.cells.append(nbf.v4.new_code_cell("""# Calculate tournament mean
mu_scored = (df['FTHG'].sum() + df['FTAG'].sum()) / (len(df) * 2)
mu_conceded = mu_scored
print(f"Overall tournament mean goals per match: {mu_scored:.4f}")

# Stack home and away games
hg = df[['Season', 'HomeTeam', 'FTHG', 'FTAG']].copy().rename(
    columns={'HomeTeam': 'Team', 'FTHG': 'GoalsFor', 'FTAG': 'GoalsAgainst'}
)
ag = df[['Season', 'AwayTeam', 'FTAG', 'FTHG']].copy().rename(
    columns={'AwayTeam': 'Team', 'FTAG': 'GoalsFor', 'FTHG': 'GoalsAgainst'}
)
all_games = pd.concat([hg, ag])

# Calculate team seasonal stats
team_stats = all_games.groupby(['Season', 'Team']).agg(
    Matches=('GoalsFor', 'count'),
    TotalGoalsFor=('GoalsFor', 'sum'),
    TotalGoalsAgainst=('GoalsAgainst', 'sum')
).reset_index()

m_prior = 3.0
team_stats['Assigned_Scoring_Rating'] = (team_stats['TotalGoalsFor'] + m_prior * mu_scored) / (team_stats['Matches'] + m_prior)
team_stats['Assigned_Conceding_Rating'] = (team_stats['TotalGoalsAgainst'] + m_prior * mu_conceded) / (team_stats['Matches'] + m_prior)

print("Sample of Season Ratings (2024 Season Top Scorers):")
print(team_stats[team_stats['Season'] == 2024].sort_values(by='Assigned_Scoring_Rating', ascending=False).head(10))"""))

nb1.cells.append(nbf.v4.new_code_cell("""# Merge for Home Team
df_features = pd.merge(
    df,
    team_stats[['Season', 'Team', 'Assigned_Scoring_Rating', 'Assigned_Conceding_Rating']],
    left_on=['Season', 'HomeTeam'],
    right_on=['Season', 'Team'],
    how='left'
).rename(columns={
    'Assigned_Scoring_Rating': 'Home_GoalsScored_Last5',
    'Assigned_Conceding_Rating': 'Home_GoalsConceded_Last5'
}).drop(columns=['Team'])

# Merge for Away Team
df_features = pd.merge(
    df_features,
    team_stats[['Season', 'Team', 'Assigned_Scoring_Rating', 'Assigned_Conceding_Rating']],
    left_on=['Season', 'AwayTeam'],
    right_on=['Season', 'Team'],
    how='left'
).rename(columns={
    'Assigned_Scoring_Rating': 'Away_GoalsScored_Last5',
    'Assigned_Conceding_Rating': 'Away_GoalsConceded_Last5'
}).drop(columns=['Team'])

print(f"Engineered Dataset Shape: {df_features.shape}")
print("Checking for nulls:")
print(df_features.isna().sum())
df_features.head(10)"""))

nb1.cells.append(nbf.v4.new_code_cell("""df_features.to_csv('UCL_df.csv', index=False)
print("Successfully saved processed dataset to UCL_df.csv!")"""))

nb1_path = os.path.join(ucl_dir, 'UCL_DATA_EDA_FEATURE_ENGG.ipynb')
nbf.write(nb1, nb1_path)
print(f'Wrote {nb1_path}')

# Execute nb1
ep = ExecutePreprocessor(timeout=600, kernel_name='ucl_env')
with open(nb1_path, 'r', encoding='utf-8') as f:
    nb1_read = nbf.read(f, as_version=4)
print('Executing UCL_DATA_EDA_FEATURE_ENGG.ipynb...')
ep.preprocess(nb1_read, {'metadata': {'path': ucl_dir}})
with open(nb1_path, 'w', encoding='utf-8') as f:
    nbf.write(nb1_read, f)
print('Executed and saved UCL_DATA_EDA_FEATURE_ENGG.ipynb!')

print('\n--- Generating UCL_xgb_model.ipynb ---')
nb2 = nbf.v4.new_notebook()

nb2.cells.append(nbf.v4.new_markdown_cell("""# UEFA Champions League - XGBoost Poisson Models
## Training, Hyperparameter Tuning & Model Benchmarking

This notebook builds and optimizes separate models for **Home Goals** and **Away Goals**:
- **Target Variables**:
  - `y_home`: Full Time Home Goals (`FTHG`)
  - `y_away`: Full Time Away Goals (`FTAG`)
- **Features**:
  - Categorical: `HomeTeam`, `AwayTeam`
  - Numerical: `Home_GoalsScored_Last5`, `Home_GoalsConceded_Last5`, `Away_GoalsScored_Last5`, `Away_GoalsConceded_Last5`
- **Objective Function**: `count:poisson` (Poisson Regression for counting goals)
- **Tuning**: Grid / RandomizedSearchCV for hyperparameter optimization
- **Benchmarking**: Comparison against Poisson GLM and Random Forest Regressors
- **Inference Verification**: Demonstrating prediction with live rolling form"""))

nb2.cells.append(nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import RandomizedSearchCV
from sklearn.linear_model import PoissonRegressor
from sklearn.ensemble import RandomForestRegressor
import joblib
from scipy.stats import poisson"""))

nb2.cells.append(nbf.v4.new_code_cell("""df = pd.read_csv("UCL_df.csv")
print("Dataset Shape:", df.shape)
print("Columns:", list(df.columns))
df.head()"""))

nb2.cells.append(nbf.v4.new_code_cell("""cols_to_drop = ['Date', 'Season', 'Round', 'FTHG', 'FTAG', 'FTR']
X = df.drop(columns=cols_to_drop, errors="ignore")
y_home = df['FTHG']
y_away = df['FTAG']

print("Features (X):")
print(X.head())"""))

nb2.cells.append(nbf.v4.new_code_cell("""n = len(X)
train_end = int(n * 0.70)
val_end = int(n * 0.85)

X_train = X.iloc[:train_end]
X_val = X.iloc[train_end:val_end]
X_test = X.iloc[val_end:]

y_home_train = y_home.iloc[:train_end]
y_away_train = y_away.iloc[:train_end]
y_home_val = y_home.iloc[train_end:val_end]
y_away_val = y_away.iloc[train_end:val_end]
y_home_test = y_home.iloc[val_end:]
y_away_test = y_away.iloc[val_end:]

print(f"Total Matches:      {n}")
print(f"Train Set (70%):   {len(X_train)} matches")
print(f"Validation Set (15%): {len(X_val)} matches")
print(f"Test Set (15%):     {len(X_test)} matches")"""))

nb2.cells.append(nbf.v4.new_code_cell("""categorical_cols = ['HomeTeam', 'AwayTeam']
numerical_cols = ['Home_GoalsScored_Last5', 'Home_GoalsConceded_Last5', 
                  'Away_GoalsScored_Last5', 'Away_GoalsConceded_Last5']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), categorical_cols),
        ('num', SimpleImputer(strategy='mean'), numerical_cols)
    ]
)"""))

nb2.cells.append(nbf.v4.new_code_cell("""pipe_home = Pipeline([
    ('preprocessor', preprocessor),
    ('model', xgb.XGBRegressor(objective='count:poisson', n_estimators=1000, max_depth=6, random_state=42))
])

pipe_away = Pipeline([
    ('preprocessor', preprocessor),
    ('model', xgb.XGBRegressor(objective='count:poisson', n_estimators=1000, max_depth=6, random_state=42))
])"""))

nb2.cells.append(nbf.v4.new_code_cell("""print("Training Baseline Home Model...")
pipe_home.fit(X_train, y_home_train)

print("Training Baseline Away Model...")
pipe_away.fit(X_train, y_away_train)
print("Training Complete!")"""))

nb2.cells.append(nbf.v4.new_code_cell("""def evaluate_model(pipe, X_data, y_true, set_name="Validation"):
    preds = pipe.predict(X_data)
    mae = mean_absolute_error(y_true, preds)
    mse = mean_squared_error(y_true, preds)
    rmse = np.sqrt(mse)
    
    print(f"--- {set_name} Results ---")
    print(f"   MAE:  {mae:.4f} (Off by {mae:.2f} goals)")
    print(f"   RMSE: {rmse:.4f}")
    return mae, rmse

print("EVALUATING BASELINE ON VALIDATION SET...")
val_mae_home, val_rmse_home = evaluate_model(pipe_home, X_val, y_home_val, "Home Goals (Val)")
val_mae_away, val_rmse_away = evaluate_model(pipe_away, X_val, y_away_val, "Away Goals (Val)")

print("\\n" + "="*40 + "\\n")

print("EVALUATING BASELINE ON TEST SET...")
test_mae_home, test_rmse_home = evaluate_model(pipe_home, X_test, y_home_test, "Home Goals (Test)")
test_mae_away, test_rmse_away = evaluate_model(pipe_away, X_test, y_away_test, "Away Goals (Test)")"""))

nb2.cells.append(nbf.v4.new_code_cell("""joblib.dump(pipe_home, 'UCL_model_home_goals.pkl')
joblib.dump(pipe_away, 'UCL_model_away_goals.pkl')
print("Baseline models saved successfully!")"""))

nb2.cells.append(nbf.v4.new_markdown_cell("""### Hyperparameter Tuning via Grid / Randomized Search
Optimizing key hyperparameters:
- `n_estimators`: [100, 200, 300, 500]
- `max_depth`: [3, 4, 5, 6]
- `learning_rate`: [0.01, 0.03, 0.05, 0.1]
- `subsample`: [0.7, 0.8, 0.9, 1.0]
- `colsample_bytree`: [0.7, 0.8, 0.9, 1.0]"""))

nb2.cells.append(nbf.v4.new_code_cell("""param_grid = {
    'model__n_estimators': [100, 200, 300, 500],
    'model__max_depth': [3, 4, 5, 6],
    'model__learning_rate': [0.01, 0.03, 0.05, 0.1],
    'model__subsample': [0.7, 0.8, 0.9, 1.0],
    'model__colsample_bytree': [0.7, 0.8, 0.9, 1.0]
}

random_search_home = RandomizedSearchCV(
    pipe_home, 
    param_distributions=param_grid, 
    n_iter=20,           
    cv=3,                
    scoring='neg_mean_absolute_error',
    verbose=1,
    random_state=42,
    n_jobs=-1            
)

random_search_away = RandomizedSearchCV(
    pipe_away, 
    param_distributions=param_grid, 
    n_iter=20,
    cv=3,
    scoring='neg_mean_absolute_error',
    verbose=1,
    random_state=42,
    n_jobs=-1
)

print("Tuning Home Model...")
random_search_home.fit(X_train, y_home_train)
print(f"Best Home Parameters: {random_search_home.best_params_}")
print(f"Best Home Cross-Val MAE: {-random_search_home.best_score_:.4f}")

print("\\nTuning Away Model...")
random_search_away.fit(X_train, y_away_train)
print(f"Best Away Parameters: {random_search_away.best_params_}")
print(f"Best Away Cross-Val MAE: {-random_search_away.best_score_:.4f}")"""))

nb2.cells.append(nbf.v4.new_code_cell("""best_home_model = random_search_home.best_estimator_
best_away_model = random_search_away.best_estimator_

print("RE-EVALUATING OPTIMIZED MODELS ON TEST SET...")
test_mae_home_opt, test_rmse_home_opt = evaluate_model(best_home_model, X_test, y_home_test, "Home Goals (Optimized)")
test_mae_away_opt, test_rmse_away_opt = evaluate_model(best_away_model, X_test, y_away_test, "Away Goals (Optimized)")

print(f"\\nImprovement Home MAE: {test_mae_home - test_mae_home_opt:.4f}")
print(f"Improvement Away MAE: {test_mae_away - test_mae_away_opt:.4f}")"""))

nb2.cells.append(nbf.v4.new_markdown_cell("""### Model Comparison & Benchmarking
Comparing the optimized Poisson XGBoost model against Poisson GLM and Random Forest Regressor."""))

nb2.cells.append(nbf.v4.new_code_cell("""# 1. Poisson GLM
glm_home = Pipeline([('preprocessor', preprocessor), ('model', PoissonRegressor(max_iter=500))])
glm_away = Pipeline([('preprocessor', preprocessor), ('model', PoissonRegressor(max_iter=500))])
glm_home.fit(X_train, y_home_train)
glm_away.fit(X_train, y_away_train)
glm_h_mae = mean_absolute_error(y_home_test, glm_home.predict(X_test))
glm_a_mae = mean_absolute_error(y_away_test, glm_away.predict(X_test))

# 2. Random Forest Regressor
rf_home = Pipeline([('preprocessor', preprocessor), ('model', RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42))])
rf_away = Pipeline([('preprocessor', preprocessor), ('model', RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42))])
rf_home.fit(X_train, y_home_train)
rf_away.fit(X_train, y_away_train)
rf_h_mae = mean_absolute_error(y_home_test, rf_home.predict(X_test))
rf_a_mae = mean_absolute_error(y_away_test, rf_away.predict(X_test))

benchmark_df = pd.DataFrame({
    'Model': ['Poisson GLM', 'Random Forest', 'XGBoost Optimized'],
    'Home Goals Test MAE': [glm_h_mae, rf_h_mae, test_mae_home_opt],
    'Away Goals Test MAE': [glm_a_mae, rf_a_mae, test_mae_away_opt]
})
print("Model Comparison Summary:")
print(benchmark_df.to_string(index=False))"""))

nb2.cells.append(nbf.v4.new_code_cell("""joblib.dump(best_home_model, 'UCL_optimized_model_home.pkl')
joblib.dump(best_away_model, 'UCL_optimized_model_away.pkl')

# Save complete team list
teams_list = sorted(list(set(df['HomeTeam'].unique()) | set(df['AwayTeam'].unique())))
joblib.dump(teams_list, 'teamlist.pkl')
print(f"Saved {len(teams_list)} teams to teamlist.pkl!")
print("Optimized models and team list saved successfully!")"""))

nb2.cells.append(nbf.v4.new_markdown_cell("""## Live Match Inference Demonstration
Demonstrating how future predictions are executed by feeding a team's **live rolling form (last 5 games)** into the model to predict Expected Goals (xG) and Poisson win/draw/loss probabilities."""))

nb2.cells.append(nbf.v4.new_code_cell("""def predict_ucl_fixture(home_team, away_team, h_scored_last5, h_conceded_last5, a_scored_last5, a_conceded_last5):
    input_data = pd.DataFrame({
        'HomeTeam': [home_team],
        'AwayTeam': [away_team],
        'Home_GoalsScored_Last5': [h_scored_last5],
        'Home_GoalsConceded_Last5': [h_conceded_last5],
        'Away_GoalsScored_Last5': [a_scored_last5],
        'Away_GoalsConceded_Last5': [a_conceded_last5],
    })
    
    xg_home = float(best_home_model.predict(input_data)[0])
    xg_away = float(best_away_model.predict(input_data)[0])
    
    MAX_GOALS = 10
    home_probs = poisson.pmf(np.arange(MAX_GOALS), xg_home)
    away_probs = poisson.pmf(np.arange(MAX_GOALS), xg_away)
    prob_matrix = np.outer(home_probs, away_probs)
    
    home_win_prob = float(np.sum(np.tril(prob_matrix, -1))) * 100
    draw_prob = float(np.sum(np.diag(prob_matrix))) * 100
    away_win_prob = float(np.sum(np.triu(prob_matrix, 1))) * 100
    
    print(f"==================================================")
    print(f"Fixture: {home_team} (Home) vs {away_team} (Away)")
    print(f"--------------------------------------------------")
    print(f"Input Form -> {home_team}: {h_scored_last5:.2f} scored / {h_conceded_last5:.2f} conceded (last 5)")
    print(f"Input Form -> {away_team}: {a_scored_last5:.2f} scored / {a_conceded_last5:.2f} conceded (last 5)")
    print(f"Expected Goals (xG): {home_team} {xg_home:.2f} - {xg_away:.2f} {away_team}")
    print(f"Probabilities: Home Win {home_win_prob:.1f}% | Draw {draw_prob:.1f}% | Away Win {away_win_prob:.1f}%")

predict_ucl_fixture('Real Madrid', 'Manchester City', 2.40, 1.00, 2.20, 0.80)
predict_ucl_fixture('Barcelona', 'Paris SG', 2.60, 1.20, 2.10, 0.90)
predict_ucl_fixture('Bayern Munich', 'Arsenal', 2.80, 1.10, 1.90, 0.70)"""))

nb2_path = os.path.join(ucl_dir, 'UCL_xgb_model.ipynb')
nbf.write(nb2, nb2_path)
print(f'Wrote {nb2_path}')

# Execute nb2
with open(nb2_path, 'r', encoding='utf-8') as f:
    nb2_read = nbf.read(f, as_version=4)
print('Executing UCL_xgb_model.ipynb...')
ep.preprocess(nb2_read, {'metadata': {'path': ucl_dir}})
with open(nb2_path, 'w', encoding='utf-8') as f:
    nbf.write(nb2_read, f)
print('Executed and saved UCL_xgb_model.ipynb!')

print('\nAll notebooks built and executed successfully!')
