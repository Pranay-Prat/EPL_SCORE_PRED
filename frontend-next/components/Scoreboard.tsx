"use client";

import { motion } from "framer-motion";
import type { PredictionResult } from "@/types/prediction";
import TeamCrest from "@/components/TeamCrest";

export default function Scoreboard({ result, homeTeam, awayTeam }: { result: PredictionResult; homeTeam: string; awayTeam: string }) {
  const score = result.predicted_score?.split("-");
  const homeScore = score?.[0] ?? result.xg_home.toFixed(2);
  const awayScore = score?.[1] ?? result.xg_away.toFixed(2);
  const total = result.home_win_prob + result.draw_prob + result.away_win_prob || 100;
  const probabilities = [{ label: "Home", value: result.home_win_prob, color: "var(--chart-1)" }, { label: "Draw", value: result.draw_prob, color: "var(--muted-foreground)" }, { label: "Away", value: result.away_win_prob, color: "var(--chart-2)" }];
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-label="Match prediction" className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4 text-center"><p className="eyebrow">{result.competition || "Your match forecast"}</p></div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-8 sm:gap-6 sm:p-10">
        <div className="flex min-w-0 flex-col items-center gap-3 text-center"><TeamCrest team={homeTeam} className="h-12 w-12 sm:h-20 sm:w-20" /><p className="text-xs font-bold sm:text-base">{homeTeam}</p></div>
        <div className="text-center"><p className="mb-3 text-[9px] uppercase tracking-widest text-muted-foreground">{score ? "Predicted score" : "Expected goals"}</p><p className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tighter tabular-nums sm:gap-5 sm:text-6xl"><span>{homeScore}</span><span className="text-lg font-normal text-muted-foreground/40 sm:text-3xl">:</span><span>{awayScore}</span></p>{score && <p className="mt-3 text-[10px] text-muted-foreground">xG {result.xg_home.toFixed(2)} — {result.xg_away.toFixed(2)}</p>}</div>
        <div className="flex min-w-0 flex-col items-center gap-3 text-center"><TeamCrest team={awayTeam} className="h-12 w-12 sm:h-20 sm:w-20" /><p className="text-xs font-bold sm:text-base">{awayTeam}</p></div>
      </div>
      <div className="border-t border-border px-6 py-5 sm:px-10"><div className="mb-3 grid grid-cols-3 gap-3">{probabilities.map((item) => <p key={item.label} className="flex items-baseline justify-center gap-2 text-xs"><span className="text-muted-foreground">{item.label}</span><strong className="font-semibold tabular-nums">{item.value}%</strong></p>)}</div><div aria-hidden="true" className="flex h-1.5 gap-1 overflow-hidden rounded-full">{probabilities.map((item) => <span key={item.label} className="rounded-full" style={{ width: `${item.value / total * 100}%`, background: item.color }} />)}</div></div>
    </motion.section>
  );
}
