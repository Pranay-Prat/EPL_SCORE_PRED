"""
Test Script for UCL Prediction Model
Runs inference across iconic Champions League matchups using the newly trained models.
"""

from ucl_prediction import predict_ucl_match

TEST_FIXTURES = [
    {
        "home": "Real Madrid",
        "away": "Manchester City",
        "h_scored": 2.4,
        "h_conceded": 1.0,
        "a_scored": 2.2,
        "a_conceded": 0.8,
    },
    {
        "home": "Barcelona",
        "away": "Paris SG",
        "h_scored": 2.6,
        "h_conceded": 1.2,
        "a_scored": 2.1,
        "a_conceded": 0.9,
    },
    {
        "home": "Bayern Munich",
        "away": "Arsenal",
        "h_scored": 2.8,
        "h_conceded": 1.1,
        "a_scored": 1.9,
        "a_conceded": 0.7,
    },
    {
        "home": "Inter",
        "away": "Atletico Madrid",
        "h_scored": 1.8,
        "h_conceded": 0.6,
        "a_scored": 1.6,
        "a_conceded": 0.8,
    },
    {
        "home": "Liverpool",
        "away": "Borussia Dortmund",
        "h_scored": 2.2,
        "h_conceded": 0.9,
        "a_scored": 2.0,
        "a_conceded": 1.2,
    },
]


def run_tests():
    print("=" * 65)
    print("      UEFA CHAMPIONS LEAGUE MATCH PREDICTION INFERENCE TEST")
    print("=" * 65)

    for fix in TEST_FIXTURES:
        res = predict_ucl_match(
            home_team=fix["home"],
            away_team=fix["away"],
            h_scored=fix["h_scored"],
            h_conceded=fix["h_conceded"],
            a_scored=fix["a_scored"],
            a_conceded=fix["a_conceded"],
        )

        print(f"\n⚽ FIXTURE: {res['home_team']} vs {res['away_team']}")
        print(f"   Input 5-Game Form:")
        print(f"     - {res['home_team']}: {fix['h_scored']:.2f} scored / {fix['h_conceded']:.2f} conceded")
        print(f"     - {res['away_team']}: {fix['a_scored']:.2f} scored / {fix['a_conceded']:.2f} conceded")
        print(f"   Expected Goals (xG):  {res['home_team']} {res['xg_home']:.2f} - {res['xg_away']:.2f} {res['away_team']}")
        print(f"   Predicted Scoreline:  {res['predicted_score']}")
        print(f"   Win Probabilities:    Home Win: {res['home_win_prob']:.1f}% | Draw: {res['draw_prob']:.1f}% | Away Win: {res['away_win_prob']:.1f}%")

    print("\n" + "=" * 65)
    print("All inference tests passed successfully!")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()
