"use client";

import { useState, useEffect, useCallback } from "react";
import type { League, PredictionResult } from "@/types/prediction";
import { fetchTeams, fetchPrediction } from "@/lib/api/predictor";
import { getDefaultDomesticLeague, UCL_PROXY_TEAMS } from "@/lib/domesticLeagues";

export type { League };

export function usePrediction() {
  const [league, setLeague] = useState<League>("epl");
  const [teams, setTeams] = useState<string[]>([]);
  const [homeTeam, setHomeTeamState] = useState("");
  const [awayTeam, setAwayTeamState] = useState("");
  const [homeLeague, setHomeLeague] = useState<string>("spain");
  const [awayLeague, setAwayLeague] = useState<string>("england");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Set home team and intelligently update domestic league when in UCL mode
  const setHomeTeam = useCallback((team: string) => {
    setHomeTeamState(team);
    if (league === "ucl" && team) {
      setHomeLeague(getDefaultDomesticLeague(team, "spain"));
    }
  }, [league]);

  // Set away team and intelligently update domestic league when in UCL mode
  const setAwayTeam = useCallback((team: string) => {
    setAwayTeamState(team);
    if (league === "ucl" && team) {
      setAwayLeague(getDefaultDomesticLeague(team, "england"));
    }
  }, [league]);

  // Load team list on mount or league change
  useEffect(() => {
    setTeamsLoading(true);
    setError(null);
    setResult(null);

    fetchTeams(league)
      .then((list) => {
        let teamList = list;
        if (league === "ucl") {
          const proxyNames = Object.keys(UCL_PROXY_TEAMS);
          teamList = Array.from(new Set([...proxyNames, ...list]));
        }
        setTeams(teamList);
        if (teamList.length >= 2) {
          if (league === "ucl") {
            const defaultHome = teamList.includes("Real Madrid") ? "Real Madrid" : teamList[0];
            const defaultAway = teamList.includes("Manchester City") ? "Manchester City" : teamList[1];
            setHomeTeamState(defaultHome);
            setAwayTeamState(defaultAway);
            setHomeLeague(getDefaultDomesticLeague(defaultHome, "spain"));
            setAwayLeague(getDefaultDomesticLeague(defaultAway, "england"));
          } else {
            setHomeTeamState(teamList[0]);
            setAwayTeamState(teamList[1]);
          }
        }
      })
      .catch(() => setError("Could not load team list."))
      .finally(() => setTeamsLoading(false));
  }, [league]);

  const predict = useCallback(async () => {
    if (!homeTeam || !awayTeam) return;
    if (homeTeam === awayTeam) {
      setError("Please select two different teams.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchPrediction(
        homeTeam,
        awayTeam,
        league,
        homeLeague,
        awayLeague
      );
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }, [homeTeam, awayTeam, league, homeLeague, awayLeague]);

  return {
    league,
    setLeague,
    teams,
    teamsLoading,
    homeTeam,
    setHomeTeam,
    awayTeam,
    setAwayTeam,
    homeLeague,
    setHomeLeague,
    awayLeague,
    setAwayLeague,
    result,
    loading,
    error,
    predict,
  };
}
