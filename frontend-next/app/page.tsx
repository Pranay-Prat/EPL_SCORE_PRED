"use client";

import { lazy, Suspense, useState } from "react";
import { ArrowRight, ArrowUpRight, FlaskConical, LayoutGrid, Loader2 } from "lucide-react";
import { usePrediction } from "@/hooks/usePrediction";
import Navbar from "@/components/Navbar";
import HeroHeader from "@/components/HeroHeader";
import CompetitionSwitcher from "@/components/CompetitionSwitcher";
import MatchweekDashboard from "@/components/MatchweekDashboard";
import TeamSelector from "@/components/TeamSelector";
import Footer from "@/components/Footer";
import { DOMESTIC_LEAGUES } from "@/lib/domesticLeagues";
import { competitions } from "@/lib/competitions";
import { Skeleton } from "@/components/ui/skeleton";

const Scoreboard = lazy(() => import("@/components/Scoreboard"));
const ProbabilityBar = lazy(() => import("@/components/ProbabilityBar"));
const PoissonHeatmap = lazy(() => import("@/components/PoissonHeatmap"));
const WinProbabilityDonut = lazy(() => import("@/components/WinProbabilityDonut"));
const XgComparisonBar = lazy(() => import("@/components/XgComparisonBar"));
const GoalDistributionChart = lazy(() => import("@/components/GoalDistributionChart"));
const RecentForm = lazy(() => import("@/components/RecentForm"));

export default function Home() {
  const [workspace, setWorkspace] = useState<"matchweek" | "lab">("matchweek");
  const { league, setLeague, teams, teamsLoading, homeTeam, setHomeTeam, awayTeam, setAwayTeam,
    homeLeague, setHomeLeague, awayLeague, setAwayLeague, result, loading, error, predict } = usePrediction();
  const isUcl = league === "ucl";
  const home = result?.home_team ?? homeTeam;
  const away = result?.away_team ?? awayTeam;

  function domesticLeagueSelect(side: "home" | "away") {
    return <label className="block space-y-2 text-xs text-muted-foreground"><span>Domestic league</span><select aria-label={`${side === "home" ? "Home" : "Away"} domestic league`} value={side === "home" ? homeLeague : awayLeague} onChange={(event) => (side === "home" ? setHomeLeague : setAwayLeague)(event.target.value)} disabled={loading} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-foreground">{DOMESTIC_LEAGUES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
  }

  return (
    <div className="grid-bg min-h-screen bg-background font-sans antialiased">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-primary-foreground">Skip to content</a>
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <HeroHeader />
        <CompetitionSwitcher league={league} onChange={setLeague} />
        <div role="group" aria-label="Workspace" className="my-7 flex items-center justify-between gap-3 border-b border-border sm:my-9">
          <div className="flex gap-6 sm:gap-8">
            {([{ key: "matchweek", label: "Matchweek", icon: LayoutGrid }, { key: "lab", label: "Match lab", icon: FlaskConical }] as const).map((item) => <button type="button" key={item.key} aria-pressed={workspace === item.key} onClick={() => setWorkspace(item.key)} className={`relative flex items-center gap-2 pb-4 text-xs font-semibold transition-colors sm:text-sm ${workspace === item.key ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-foreground"}`}><item.icon aria-hidden="true" className="h-4 w-4" />{item.label}</button>)}
          </div>
          <span className="hidden pb-4 text-[10px] uppercase tracking-widest text-muted-foreground sm:block">{competitions[league].region} / {competitions[league].code}</span>
        </div>

        {workspace === "matchweek" ? <MatchweekDashboard key={league} league={league} onOpenLab={() => setWorkspace("lab")} /> : (
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4"><div><p className="eyebrow mb-2">Your teams. Your fixture.</p><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Build the matchup.</h2></div><ArrowUpRight aria-hidden="true" className="h-7 w-7 text-primary" /></div>
            <section aria-label="Match setup" className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="grid items-start gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-4"><TeamSelector key={league + "-home"} label="Home team" teams={teams} selected={homeTeam} onChange={setHomeTeam} isLoading={teamsLoading || loading} side="home" disabledTeam={awayTeam} isUcl={isUcl} />{isUcl && domesticLeagueSelect("home")}</div>
                <span aria-hidden="true" className="self-center text-center text-xs font-semibold text-muted-foreground/60">VS</span>
                <div className="space-y-4"><TeamSelector key={league + "-away"} label="Away team" teams={teams} selected={awayTeam} onChange={setAwayTeam} isLoading={teamsLoading || loading} side="away" disabledTeam={homeTeam} isUcl={isUcl} />{isUcl && domesticLeagueSelect("away")}</div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/30 px-6 py-5 sm:px-8"><p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{isUcl ? "Powered by each club’s recent domestic form." : "A fresh forecast from recent form and expected goals."}</p><button type="button" onClick={predict} disabled={loading || teamsLoading || !homeTeam || !awayTeam || homeTeam === awayTeam} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-7 text-xs font-bold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Predicting…</> : <>Predict match<ArrowRight className="h-4 w-4" /></>}</button></div>
            </section>
            {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
            {loading && <div role="status" aria-label="Calculating match prediction" className="space-y-4"><Skeleton className="h-52 w-full rounded-2xl" /><div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div></div>}
            {result && <Suspense fallback={<Skeleton className="h-52 w-full rounded-2xl" />}><div className="space-y-4"><Scoreboard result={result} homeTeam={home} awayTeam={away} />{(result.form.home.is_fallback || result.form.away.is_fallback) && <p className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">Limited domestic form data for {result.form.home.is_fallback && result.form.away.is_fallback ? "both clubs" : result.form.home.is_fallback ? home : away}; this forecast uses fallback values.</p>}<div className="grid gap-4 md:grid-cols-2"><WinProbabilityDonut result={result} homeTeam={home} awayTeam={away} /><XgComparisonBar result={result} homeTeam={home} awayTeam={away} /></div><details className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Explore the full analysis</summary><div className="mt-5 space-y-4"><ProbabilityBar result={result} /><RecentForm result={result} homeTeam={home} awayTeam={away} /><div className="grid gap-4 md:grid-cols-2"><PoissonHeatmap matrix={result.poisson_matrix} /><GoalDistributionChart matrix={result.poisson_matrix} homeTeam={home} awayTeam={away} /></div></div></details></div></Suspense>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
