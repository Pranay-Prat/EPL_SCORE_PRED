"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus, Trophy } from "lucide-react";
import snapshot from "@/data/ucl-standings.json";
import { getTeamLogo } from "@/lib/teamLogos";

const columns = [
  ["played", "P", "Played"],
  ["won", "W", "Won"],
  ["drawn", "D", "Drawn"],
  ["lost", "L", "Lost"],
  ["goals_for", "GF", "Goals for"],
  ["goals_against", "GA", "Goals against"],
  ["goal_difference", "GD", "Goal difference"],
  ["points", "Pts", "Points"],
] as const;

const capturedDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
}).format(new Date(snapshot.capturedAt));

export default function UclStandings() {
  const [view, setView] = useState<"current" | "predicted">("current");
  const rows = snapshot[view];
  const currentRanks = new Map(snapshot.current.map((row) => [row.team, row.rank]));

  return (
    <section aria-labelledby="ucl-standings-heading" className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="space-y-4 border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              <Trophy aria-hidden="true" className="h-3.5 w-3.5" /> UEFA Champions League
            </p>
            <h2 id="ucl-standings-heading" className="text-xl font-bold sm:text-2xl">League phase standings</h2>
          </div>
          <p className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            Snapshot · <time dateTime={snapshot.capturedAt}>{capturedDate}</time>
          </p>
        </div>
        <div role="group" aria-label="Standings view" className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1">
          {(["current", "predicted"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${view === option ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}
            >
              {option === "current" ? "Current standings" : "Predicted standings"}
            </button>
          ))}
        </div>
        <p id="ucl-standings-description" className="text-sm text-muted-foreground">
          {view === "current"
            ? "Saved standings for this matchweek. Switch to predicted standings to see the projected table after the upcoming fixtures."
            : "Projected standings after the upcoming fixture window. Arrows show position changes from the saved current table."}
        </p>
      </div>

      {rows.length === 0 ? (
        <p role="status" className="p-8 text-center text-sm text-muted-foreground">
          No {view === "predicted" ? "predicted" : "current"} standings were available when this snapshot was saved.
        </p>
      ) : (
        <div role="region" aria-label={`${view === "current" ? "Current" : "Predicted"} UCL standings, scroll horizontally for all columns`} tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring">
          <table aria-describedby="ucl-standings-description" className="w-full min-w-[700px] border-collapse text-sm tabular-nums">
            <caption className="sr-only">{view === "current" ? "Current standings" : "Predicted standings"}, saved {capturedDate}</caption>
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 text-center">Rank</th>
                <th scope="col" className="sticky left-0 z-10 bg-card px-3 py-3 text-left">Club</th>
                {view === "predicted" && <th scope="col" className="px-3 py-3 text-center">Change</th>}
                {columns.map(([key, label, fullLabel]) => (
                  <th scope="col" key={key} className="px-3 py-3 text-center"><abbr title={fullLabel} className="no-underline">{label}</abbr></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const logo = getTeamLogo(row.team);
                const previousRank = currentRanks.get(row.team);
                const change = previousRank === undefined ? null : previousRank - row.rank;
                return (
                  <tr key={row.team} className="group border-t border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-3 text-center font-semibold text-muted-foreground">{row.rank}</td>
                    <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-3 text-left font-semibold group-hover:bg-muted">
                      <div className="flex items-center gap-2.5 whitespace-nowrap">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt="" loading="lazy" className="h-6 w-6 shrink-0 object-contain" />
                        ) : (
                          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px]">{row.team.slice(0, 2).toUpperCase()}</span>
                        )}
                        {row.team}
                      </div>
                    </th>
                    {view === "predicted" && (
                      <td className="px-3 py-3 text-center">
                        <span aria-label={change === null ? "No current rank available" : change === 0 ? "No position change" : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} positions`} className={`inline-flex items-center gap-1 text-xs font-semibold ${change !== null && change > 0 ? "text-emerald-700 dark:text-emerald-400" : change !== null && change < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                          {change === null || change === 0 ? <Minus aria-hidden="true" className="h-3 w-3" /> : <>{change > 0 ? <ArrowUp aria-hidden="true" className="h-3 w-3" /> : <ArrowDown aria-hidden="true" className="h-3 w-3" />}{Math.abs(change)}</>}
                        </span>
                      </td>
                    )}
                    {columns.map(([key]) => (
                      <td key={key} className={`px-3 py-3 text-center ${key === "points" ? "bg-primary/5 font-extrabold" : "text-muted-foreground"}`}>
                        {key === "goal_difference" && row[key] > 0 ? "+" : ""}{row[key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:px-6">
        Saved for this matchweek; updates when a new snapshot is published. Predictions are sorted by points, goal difference, then goals scored; full UEFA tiebreak rules are not applied.
      </p>
    </section>
  );
}
