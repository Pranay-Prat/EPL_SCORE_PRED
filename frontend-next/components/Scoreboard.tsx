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
  const favorite = probabilities.reduce((best, item) => item.value > best.value ? item : best);
  const tied = probabilities.filter((item) => item.value === favorite.value).length > 1;
  const outcome = tied ? "No clear favourite" : favorite.label === "Draw" ? "Draw is the leading outcome" : `${favorite.label === "Home" ? homeTeam : awayTeam} lead the forecast`;
  const scorelines = result.poisson_matrix.flatMap((row, h) => row.map((probability, a) => ({ home: h, away: a, probability })))
    .filter((item) => Number.isFinite(item.probability) && item.probability > 0)
    .sort((a, b) => b.probability - a.probability).slice(0, 3);
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-label="Match prediction" className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4"><p className="eyebrow">{result.competition || "Your match forecast"}</p><span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">Model projection</span></div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-8 sm:gap-6 sm:p-10">
        <div className="flex min-w-0 flex-col items-center gap-3 text-center"><TeamCrest team={homeTeam} className="h-12 w-12 sm:h-20 sm:w-20" /><p className="text-xs font-bold sm:text-base">{homeTeam}</p></div>
        <div className="text-center"><p className="mb-3 text-[9px] uppercase tracking-widest text-muted-foreground">{score ? "Predicted score" : "Expected goals"}</p><p className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tighter tabular-nums sm:gap-5 sm:text-6xl"><span>{homeScore}</span><span className="text-lg font-normal text-muted-foreground/40 sm:text-3xl">:</span><span>{awayScore}</span></p>{score && <p className="mt-3 text-[10px] text-muted-foreground">xG {result.xg_home.toFixed(2)} — {result.xg_away.toFixed(2)}</p>}</div>
        <div className="flex min-w-0 flex-col items-center gap-3 text-center"><TeamCrest team={awayTeam} className="h-12 w-12 sm:h-20 sm:w-20" /><p className="text-xs font-bold sm:text-base">{awayTeam}</p></div>
      </div>
      <div className="border-t border-border bg-muted/20 px-5 py-5 sm:px-10">
        <p className="mb-4 text-center text-sm font-semibold">{outcome}</p>
        <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">{probabilities.map((item) => <div key={item.label} className={`rounded-xl border px-2 py-3 text-center ${!tied && item === favorite ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label === "Draw" ? "Draw" : `${item.label} win`}</p><p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl" style={{ color: item.color }}>{item.value.toFixed(1)}<span className="ml-0.5 text-xs">%</span></p></div>)}</div>
        <div aria-hidden="true" className="flex h-1.5 gap-1 overflow-hidden rounded-full">{probabilities.map((item) => <span key={item.label} className="rounded-full" style={{ width: `${item.value / total * 100}%`, background: item.color }} />)}</div>
      </div>
      {scorelines.length > 0 && <div className="border-t border-border px-5 py-5 sm:px-10"><div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><p className="eyebrow">Most likely scorelines</p><p className="text-[10px] text-muted-foreground">Each score is one possible outcome</p></div><div className="grid grid-cols-3 gap-3">{scorelines.map((item) => <div key={`${item.home}-${item.away}`} className="rounded-xl bg-muted/50 px-2 py-3 text-center"><p className="text-lg font-semibold tabular-nums">{item.home} – {item.away}</p><p className="mt-1 text-xs text-muted-foreground">{(item.probability * 100).toFixed(1)}%</p></div>)}</div>{score && <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">The projected score and the most likely individual score can differ.</p>}</div>}
    </motion.section>
  );
}
