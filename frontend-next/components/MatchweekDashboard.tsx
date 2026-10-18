"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, ChevronDown, ChevronUp, Clock3, Minus, Search, Trophy } from "lucide-react";
import { competitions, formatSnapshotDate, snapshots } from "@/lib/competitions";
import type { League } from "@/types/prediction";
import type { SavedFixture } from "@/types/standings";
import TeamCrest from "@/components/TeamCrest";

const columns = [["played", "P", "Played"], ["won", "W", "Won"], ["drawn", "D", "Drawn"], ["lost", "L", "Lost"], ["goals_for", "GF", "Goals for"], ["goals_against", "GA", "Goals against"], ["goal_difference", "GD", "Goal difference"], ["points", "Pts", "Points"]] as const;

function MatchCard({ fixture, index }: { fixture: SavedFixture; index: number }) {
  const { homeTeam, awayTeam, homeGoals, awayGoals, kickoffTime } = fixture;
  const drawn = homeGoals === awayGoals;
  return (
    <article className="match-card relative overflow-hidden rounded-2xl border border-border bg-card" aria-label={`${homeTeam} versus ${awayTeam}, predicted score ${homeGoals} to ${awayGoals}`}>
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="h-3 w-3" />{kickoffTime ? <time dateTime={kickoffTime}>{new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(kickoffTime))} UTC</time> : `Fixture ${String(index + 1).padStart(2, "0")}`}</span>
        <span className="text-primary">Prediction</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 px-4 pb-6 pt-7">
        {[homeTeam, awayTeam].map((team, side) => (
          <div key={side} className={`flex min-w-0 flex-col items-center gap-3 text-center ${side === 1 ? "col-start-3 row-start-1" : ""}`}>
            <div className="crest-plinth flex h-20 w-20 items-center justify-center rounded-full"><TeamCrest team={team} className="h-12 w-12" /></div>
            <p className={`max-w-[140px] text-xs leading-snug sm:text-sm ${side === 0 ? homeGoals >= awayGoals ? "font-bold" : "text-muted-foreground" : awayGoals >= homeGoals ? "font-bold" : "text-muted-foreground"}`}>{team}</p>
          </div>
        ))}
        <div className="col-start-2 row-start-1 flex flex-col items-center gap-2 pt-5">
          <p aria-hidden="true" className="flex items-center gap-2 text-4xl font-bold tracking-tighter tabular-nums"><span>{homeGoals}</span><span className="text-lg font-normal text-muted-foreground/40">—</span><span>{awayGoals}</span></p>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{drawn ? "Draw" : homeGoals > awayGoals ? "Home win" : "Away win"}</span>
        </div>
      </div>
      <div aria-hidden="true" className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/10 to-transparent" />
    </article>
  );
}

export default function MatchweekDashboard({ league, onOpenLab }: { league: League; onOpenLab: () => void }) {
  const [view, setView] = useState<"fixtures" | "current" | "predicted">("fixtures");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const snapshot = snapshots[league];
  const competition = competitions[league];
  const query = search.trim().toLowerCase();
  const fixtures = snapshot.fixtures.filter((fixture) => `${fixture.homeTeam} ${fixture.awayTeam}`.toLowerCase().includes(query));
  const visible = expanded || query ? fixtures : fixtures.slice(0, 6);
  const currentRanks = new Map(snapshot.current.map((row) => [row.team, row.rank]));
  const rows = (view === "predicted" ? snapshot.predicted : snapshot.current).filter((row) => row.team.toLowerCase().includes(query));
  const leader = snapshot.predicted[0];
  const movers = snapshot.predicted.filter((row) => (currentRanks.get(row.team) ?? row.rank) > row.rank).length;
  const totals = snapshot.fixtures.reduce((acc, match) => ({ goals: acc.goals + match.homeGoals + match.awayGoals, draws: acc.draws + Number(match.homeGoals === match.awayGoals) }), { goals: 0, draws: 0 });

  return (
    <section aria-labelledby="matchweek-title" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "In the fixture window", value: String(snapshot.fixtures.length).padStart(2, "0"), detail: "matches", icon: CalendarDays },
          { label: "Projected goals", value: String(totals.goals).padStart(2, "0"), detail: `${totals.draws} predicted ${totals.draws === 1 ? "draw" : "draws"}`, icon: Trophy },
          { label: "Climbing the table", value: String(movers).padStart(2, "0"), detail: "clubs projected to rise", icon: ArrowUp },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 px-5 py-4">
            <stat.icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{stat.label}</p><div className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</span><span className="text-[11px] text-muted-foreground">{stat.detail}</span></div></div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-2">{competition.name}</p><h2 id="matchweek-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">The matchweek, mapped.</h2></div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3 aria-hidden="true" className="h-3 w-3" /> Saved <time dateTime={snapshot.capturedAt}>{formatSnapshotDate(snapshot.capturedAt)}</time></p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div role="group" aria-label="Matchweek view" className="flex w-full min-w-0 rounded-xl bg-muted/70 p-1 sm:w-auto">
          {(["fixtures", "current", "predicted"] as const).map((option) => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)} className={`min-w-0 flex-1 rounded-lg px-2 py-2.5 text-[11px] sm:flex-none font-semibold transition-colors sm:px-4 sm:text-xs ${view === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{option === "fixtures" ? "Fixtures" : option === "current" ? "Current standings" : "Predicted standings"}</button>)}
        </div>
        <label className="relative block w-full sm:w-52"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search clubs</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a club…" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
      </div>

      {view === "fixtures" ? (
        <>
          {visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((fixture, index) => <MatchCard key={`${fixture.homeTeam}-${fixture.awayTeam}`} fixture={fixture} index={index} />)}</div> : <p role="status" className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">{query ? "No matches for that club." : "No upcoming fixtures in this snapshot."}</p>}
          {!query && fixtures.length > 6 && <div className="text-center"><button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-xs font-semibold hover:bg-card">{expanded ? "Show fewer matches" : `View all ${fixtures.length} matches`}{expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button></div>}
        </>
      ) : (
        <div role="region" aria-label={`${view} ${competition.name} standings. Scroll horizontally for all columns.`} tabIndex={0} className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm tabular-nums"><caption className="sr-only">{view === "current" ? "Current standings" : "Predicted standings"} · {competition.name}</caption>
            <thead><tr className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground"><th scope="col" className="px-4 py-4 text-center">#</th><th scope="col" className="sticky left-0 z-10 bg-card px-4 py-4 text-left">Club</th>{view === "predicted" && <th scope="col" className="px-3 py-4 text-center">Move</th>}{columns.map(([key, label, full]) => <th scope="col" key={key} className="px-3 py-4 text-center"><abbr title={full} className="no-underline">{label}</abbr></th>)}</tr></thead>
            <tbody>{rows.map((row) => {
              const change = (currentRanks.get(row.team) ?? row.rank) - row.rank;
              return <tr key={row.team} className="group border-b border-border/50 last:border-0 hover:bg-muted/30"><td className="px-4 py-3.5 text-center text-xs text-muted-foreground">{String(row.rank).padStart(2, "0")}</td><th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3.5 text-left group-hover:bg-muted"><span className="flex items-center gap-3 whitespace-nowrap text-xs font-semibold"><TeamCrest team={row.team} className="h-6 w-6" />{row.team}</span></th>{view === "predicted" && <td className="px-3 text-center"><span aria-label={change ? `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} positions` : "Unchanged"} className={`inline-flex items-center gap-1 text-[11px] ${change > 0 ? "text-emerald-700 dark:text-emerald-400" : change < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>{change > 0 ? <ArrowUp aria-hidden="true" className="h-3 w-3" /> : change < 0 ? <ArrowDown aria-hidden="true" className="h-3 w-3" /> : <Minus aria-hidden="true" className="h-3 w-3" />}{change !== 0 && Math.abs(change)}</span></td>}{columns.map(([key]) => <td key={key} className={`px-3 py-3.5 text-center text-xs ${key === "points" ? "bg-primary/5 font-bold text-foreground" : "text-muted-foreground"}`}>{key === "goal_difference" && row[key] > 0 ? "+" : ""}{row[key]}</td>)}</tr>;
            })}</tbody>
          </table>
          {!rows.length && <p role="status" className="p-10 text-center text-sm text-muted-foreground">{query ? "No clubs found." : "No standings available."}</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="max-w-lg text-[11px] leading-relaxed text-muted-foreground">{view === "fixtures" ? "Saved model projections for the upcoming fixture window. Kickoff times, where available, are UTC." : "Sorted by points, goal difference, then goals scored. Full competition tiebreaks are excluded."}</p>
        <button onClick={onOpenLab} className="flex items-center gap-2 text-xs font-semibold text-primary">Build your own matchup <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
      </div>

      {leader && <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-border bg-card/60 px-6 py-5"><div className="flex items-center gap-4"><TeamCrest team={leader.team} className="h-11 w-11" /><div><p className="eyebrow mb-1">Projected leader</p><p className="text-base font-semibold">{leader.team}</p></div></div><p className="flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight">{leader.points}</span><span className="text-xs text-muted-foreground">points after this window</span></p></div>}
    </section>
  );
}
