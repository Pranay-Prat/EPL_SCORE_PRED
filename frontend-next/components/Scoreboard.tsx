"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { PredictionResult } from "@/types/prediction";
import AnimatedCounter from "./AnimatedCounter";
import { getTeamLogo } from "@/lib/teamLogos";

interface Props {
  result: PredictionResult;
  homeTeam: string;
  awayTeam: string;
}

export default memo(function Scoreboard({ result, homeTeam, awayTeam }: Props) {
  const winner =
    result.home_win_prob > result.away_win_prob
      ? "home"
      : result.away_win_prob > result.home_win_prob
        ? "away"
        : "draw";

  const homeLogo = getTeamLogo(homeTeam);
  const awayLogo = getTeamLogo(awayTeam);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg"
    >
      {/* Subtle background gradient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-48 h-48 bg-chart-1/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-48 h-48 bg-chart-2/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {/* AI Prediction badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-2 mb-6"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-3" />
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-foreground">
              {result.competition || "AI Projected Result"}
            </span>
          </div>

          {result.predicted_score && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/60 border border-border text-xs font-black tracking-widest shadow-xs"
            >
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
                Most Likely Scoreline:
              </span>
              <span className="text-sm font-black text-primary">
                {result.predicted_score}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Main scoreboard — stacked on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          {/* Home team */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full sm:flex-1 flex flex-col items-center text-center space-y-2"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-chart-1/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              {homeLogo ? (
                <motion.img
                  src={homeLogo}
                  alt={`${homeTeam} logo`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.25 }}
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md relative z-10"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-lg text-muted-foreground">
                  {homeTeam.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-chart-1/90">
              Home
            </div>
            <div className="text-base sm:text-xl font-black uppercase tracking-tight leading-tight break-words max-w-[180px]">
              {homeTeam}
            </div>
          </motion.div>

          {/* Score & xG Display */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0 py-2 sm:py-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
              className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tight ${winner === "home" ? "text-chart-1 drop-shadow-sm" : "text-foreground/80"}`}
            >
              <AnimatedCounter value={result.xg_home} decimals={2} duration={1500} />
            </motion.div>

            <div className="flex flex-col items-center gap-1">
              <div className="h-5 sm:h-7 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <span className="text-[0.55rem] sm:text-[0.6rem] font-bold tracking-widest text-muted-foreground/60 uppercase">xG</span>
              <div className="h-5 sm:h-7 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
              className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tight ${winner === "away" ? "text-chart-2 drop-shadow-sm" : "text-foreground/80"}`}
            >
              <AnimatedCounter value={result.xg_away} decimals={2} duration={1500} />
            </motion.div>
          </div>

          {/* Away team */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full sm:flex-1 flex flex-col items-center text-center space-y-2"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-chart-2/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              {awayLogo ? (
                <motion.img
                  src={awayLogo}
                  alt={`${awayTeam} logo`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.3 }}
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md relative z-10"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-lg text-muted-foreground">
                  {awayTeam.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-chart-2/90">
              Away
            </div>
            <div className="text-base sm:text-xl font-black uppercase tracking-tight leading-tight break-words max-w-[180px]">
              {awayTeam}
            </div>
          </motion.div>
        </div>

        {/* Bottom separator & probability summary */}
        <div className="mt-6 sm:mt-8 pt-5 border-t border-border/40">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2 bg-chart-1/10 px-3 py-1 rounded-full border border-chart-1/20">
              <span className="h-2 w-2 rounded-full bg-chart-1 shrink-0" />
              <span className="text-muted-foreground">
                Home <span className="text-foreground font-black ml-1">{result.home_win_prob}%</span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full border border-border/50">
              <span className="h-2 w-2 rounded-full bg-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                Draw <span className="text-foreground font-black ml-1">{result.draw_prob}%</span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-chart-2/10 px-3 py-1 rounded-full border border-chart-2/20">
              <span className="h-2 w-2 rounded-full bg-chart-2 shrink-0" />
              <span className="text-muted-foreground">
                Away <span className="text-foreground font-black ml-1">{result.away_win_prob}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

