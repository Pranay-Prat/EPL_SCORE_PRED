"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { League, PredictionResult } from "@/types/prediction";
import { fetchTeams, fetchPrediction } from "@/lib/api/predictor";
import { getDefaultDomesticLeague } from "@/lib/domesticLeagues";

export type { League };

export function usePrediction() {
  const [league, setLeagueState] = useState<League>("epl");
  const requestId = useRef(0);
  const [teams, setTeams] = useState<string[]>([]);
  const [homeTeam, setHomeTeamState] = useState("");
  const [awayTeam, setAwayTeamState] = useState("");
  const [homeLeague, setHomeLeagueState] = useState<string>("spain");
  const [awayLeague, setAwayLeagueState] = useState<string>("england");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const clearPrediction = useCallback(() => {
    requestId.current += 1;
    setLoading(false);
    setResult(null);
    setError(null);
  }, []);

  const setHomeLeague = useCallback((next: string) => {
    clearPrediction();
    setHomeLeagueState(next);
  }, [clearPrediction]);

  const setAwayLeague = useCallback((next: string) => {
    clearPrediction();
    setAwayLeagueState(next);
  }, [clearPrediction]);

  const setLeague = useCallback((next: League) => {
    if (next === league) return;
    requestId.current += 1;
    setLoading(false);
    setResult(null);
    setTeams([]);
    setHomeTeamState("");
    setAwayTeamState("");
    setTeamsLoading(true);
    setLeagueState(next);
  }, [league]);

  // Set home team and intelligently update domestic league when in UCL mode
  const setHomeTeam = useCallback((team: string) => {
    clearPrediction();
    setHomeTeamState(team);
    if (league === "ucl" && team) {
      setHomeLeagueState(getDefaultDomesticLeague(team, "spain"));
    }
  }, [league, clearPrediction]);

  // Set away team and intelligently update domestic league when in UCL mode
  const setAwayTeam = useCallback((team: string) => {
    clearPrediction();
    setAwayTeamState(team);
    if (league === "ucl" && team) {
      setAwayLeagueState(getDefaultDomesticLeague(team, "england"));
    }
  }, [league, clearPrediction]);

  // Load team list on mount or league change
  useEffect(() => {
    let active = true;
    setTeamsLoading(true);
    setError(null);
    setResult(null);

    fetchTeams(league)
      .then((list) => {
        if (!active) return;
        const teamList = list;
        setTeams(teamList);
        if (teamList.length >= 2) {
          if (league === "ucl") {
            const defaultHome = teamList.includes("Real Madrid") ? "Real Madrid" : teamList[0];
            const defaultAway = teamList.includes("Manchester City") ? "Manchester City" : teamList[1];
            setHomeTeamState(defaultHome);
            setAwayTeamState(defaultAway);
            setHomeLeagueState(getDefaultDomesticLeague(defaultHome, "spain"));
            setAwayLeagueState(getDefaultDomesticLeague(defaultAway, "england"));
          } else {
            setHomeTeamState(teamList[0]);
            setAwayTeamState(teamList[1]);
          }
        }
      })
      .catch((error) => { if (active) setError(error instanceof Error ? error.message : "Could not load team list."); })
      .finally(() => { if (active) setTeamsLoading(false); });
    return () => { active = false; };
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
    const currentRequest = ++requestId.current;

    try {
      const data = await fetchPrediction(
        homeTeam,
        awayTeam,
        league,
        homeLeague,
        awayLeague
      );
      if (requestId.current === currentRequest) setResult(data);
    } catch (e: unknown) {
      if (requestId.current === currentRequest) setError(e instanceof Error ? e.message : "Prediction failed.");
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
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
