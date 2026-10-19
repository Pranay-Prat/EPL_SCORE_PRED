"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { PredictionResult } from "@/types/prediction";
import { TrendingUp, Shield } from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";

interface Props {
  result: PredictionResult;
  homeTeam: string;
  awayTeam: string;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
    >
      <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="text-lg font-bold text-foreground leading-tight">{value}</div>
        <div className="text-[0.6rem] text-muted-foreground/70">{sub}</div>
      </div>
    </motion.div>
  );
}

export default memo(function RecentForm({ result, homeTeam, awayTeam }: Props) {
  const { home, away } = result.form;
  const homeLogo = getTeamLogo(homeTeam);
  const awayLogo = getTeamLogo(awayTeam);
  const homeDomestic = result.domestic_form?.home;
  const awayDomestic = result.domestic_form?.away;

  function venueSummary(side: "home" | "away") {
    const domestic = side === "home" ? homeDomestic : awayDomestic;
    if (!result.domestic_form) return null;
    const scored = side === "home" ? domestic?.home_scored : domestic?.away_scored;
    const conceded = side === "home" ? domestic?.home_conceded : domestic?.away_conceded;
    const matches = side === "home" ? domestic?.home_matches : domestic?.away_matches;
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
        <p className="font-semibold">{domestic?.league_name ?? "Domestic form"} · {side === "home" ? "Home matches" : "Away matches"}</p>
        {scored != null && conceded != null ? (
          <p className="mt-1 leading-relaxed text-muted-foreground">{scored.toFixed(2)} scored · {conceded.toFixed(2)} conceded per match{matches != null ? ` across ${matches} ${matches === 1 ? "match" : "matches"}` : ""}.</p>
        ) : <p className="mt-1 text-muted-foreground">Venue form is unavailable; fallback inputs are used.</p>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-card border border-border rounded-xl p-5 shadow-sm"
    >
      <div className="flex flex-col items-center justify-center gap-1 mb-4">
        <h3 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Behind the forecast
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Home team form */}
        <div className="space-y-2">
          <div className="flex flex-col items-center gap-1 pb-1">
            <div className="flex items-center gap-2">
              {homeLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={homeLogo} alt="" className="h-5 w-5 object-contain" />
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-chart-1 truncate max-w-[200px]">
                {homeTeam}
              </div>
            </div>
          </div>
          {venueSummary("home")}
          <StatCard
            label="Scoring input"
            value={home.scored.toFixed(2)}
            sub="goals per game"
            icon={<TrendingUp className="h-4 w-4 text-chart-1" />}
            delay={0.6}
          />
          <StatCard
            label="Conceding input"
            value={home.conceded.toFixed(2)}
            sub="goals per game"
            icon={<Shield className="h-4 w-4 text-chart-2" />}
            delay={0.7}
          />
        </div>

        {/* Away team form */}
        <div className="space-y-2">
          <div className="flex flex-col items-center gap-1 pb-1">
            <div className="flex items-center gap-2">
              {awayLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awayLogo} alt="" className="h-5 w-5 object-contain" />
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-chart-2 truncate max-w-[200px]">
                {awayTeam}
              </div>
            </div>
          </div>
          {venueSummary("away")}
          <StatCard
            label="Scoring input"
            value={away.scored.toFixed(2)}
            sub="goals per game"
            icon={<TrendingUp className="h-4 w-4 text-chart-1" />}
            delay={0.8}
          />
          <StatCard
            label="Conceding input"
            value={away.conceded.toFixed(2)}
            sub="goals per game"
            icon={<Shield className="h-4 w-4 text-chart-2" />}
            delay={0.9}
          />
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        {result.domestic_form ? "Venue form shows the recent match averages. Model inputs below it include the form adjustments used for this forecast." : "Recent domestic form, measured in goals per match."}
      </p>
    </motion.div>
  );
});
