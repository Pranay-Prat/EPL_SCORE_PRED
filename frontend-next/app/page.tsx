"use client";

import { lazy, Suspense } from "react";
import { usePrediction } from "@/hooks/usePrediction";

import Navbar from "@/components/Navbar";
import HeroHeader from "@/components/HeroHeader";
import TeamSelector from "@/components/TeamSelector";
import Footer from "@/components/Footer";
import UclStandings from "@/components/UclStandings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Lazy-load analytics components
const Scoreboard = lazy(() => import("@/components/Scoreboard"));
const ProbabilityBar = lazy(() => import("@/components/ProbabilityBar"));
const PoissonHeatmap = lazy(() => import("@/components/PoissonHeatmap"));
const WinProbabilityDonut = lazy(() => import("@/components/WinProbabilityDonut"));
const XgComparisonBar = lazy(() => import("@/components/XgComparisonBar"));
const GoalDistributionChart = lazy(() => import("@/components/GoalDistributionChart"));
const RecentForm = lazy(() => import("@/components/RecentForm"));

function ResultSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function Home() {
  const {
    league,
    setLeague,
    teams,
    teamsLoading,
    homeTeam,
    setHomeTeam,
    awayTeam,
    setAwayTeam,
    result,
    loading,
    error,
    predict,
  } = usePrediction();

  return (
    <div className="min-h-screen bg-background font-sans antialiased grid-bg">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <HeroHeader />

        {/* Match Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <h2 className="text-center text-[0.65rem] font-extrabold uppercase tracking-[0.25em] text-muted-foreground/80 mb-5">
              Build your match
            </h2>

            {/* League Selection Switcher */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex flex-wrap justify-center p-1.5 rounded-2xl bg-muted/70 border border-border/80 shadow-inner gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setLeague("epl")}
                  title="Premier League"
                  aria-label="Premier League"
                  className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
                    league === "epl"
                      ? "bg-background shadow-md border border-primary/30 scale-[1.04] ring-2 ring-primary/20"
                      : "opacity-60 hover:opacity-100 hover:bg-background/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/epl_white.png"
                    alt="Premier League"
                    className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[130px] drop-shadow-md dark:block hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/epl_league.png"
                    alt="Premier League"
                    className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[130px] drop-shadow-md dark:hidden block"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setLeague("laliga")}
                  title="La Liga"
                  aria-label="La Liga"
                  className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
                    league === "laliga"
                      ? "bg-background shadow-md border border-primary/30 scale-[1.04] ring-2 ring-primary/20"
                      : "opacity-60 hover:opacity-100 hover:bg-background/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/laliga_white.png"
                    alt="La Liga"
                    className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[130px] drop-shadow-md dark:block hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/laliga_league.png"
                    alt="La Liga"
                    className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[130px] drop-shadow-md dark:hidden block"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setLeague("ucl")}
                  title="UEFA Champions League"
                  aria-label="UEFA Champions League"
                  className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
                    league === "ucl"
                      ? "bg-background shadow-md border border-primary/30 scale-[1.04] ring-2 ring-primary/20"
                      : "opacity-60 hover:opacity-100 hover:bg-background/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ucl_white.png"
                    alt="UEFA Champions League"
                    className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[130px] drop-shadow-md dark:block hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ucl_league.png"
                    alt="UEFA Champions League"
                    className="h-8 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[130px] drop-shadow-md dark:hidden block"
                  />
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-center">
              <TeamSelector
                label="Home Team"
                teams={teams}
                selected={homeTeam}
                onChange={setHomeTeam}
                isLoading={teamsLoading}
                side="home"
                disabledTeam={awayTeam}
                isUcl={league === "ucl"}
              />

              <div className="flex flex-col items-center justify-center py-2 md:py-6">
                <div className="h-10 w-10 rounded-full bg-muted/60 border border-border/80 flex items-center justify-center shadow-inner">
                  <span className="text-xs font-black text-muted-foreground">VS</span>
                </div>
              </div>

              <TeamSelector
                label="Away Team"
                teams={teams}
                selected={awayTeam}
                onChange={setAwayTeam}
                isLoading={teamsLoading}
                side="away"
                disabledTeam={homeTeam}
                isUcl={league === "ucl"}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={predict}
                disabled={loading || teamsLoading || !homeTeam || !awayTeam || homeTeam === awayTeam}
                className="w-full sm:w-auto px-10 sm:px-16 py-6 text-xs sm:text-sm tracking-[0.15em] uppercase font-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground border-none cursor-pointer rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    Predict match
                    <ArrowRight className="ml-2.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Dashboard */}
        {result && (
          <Suspense fallback={
            <div className="mt-8">
              <ResultSkeleton />
            </div>
          }>
            <div className="mt-8 space-y-4 pb-8">
              {/* Section divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">
                  Analytics
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
              </motion.div>

              {/* Scoreboard */}
              <Scoreboard
                result={result}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />

              {/* Row 2: Donut + xG Bars */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <WinProbabilityDonut
                  result={result}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                />
                <XgComparisonBar
                  result={result}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                />
              </div>

              <details className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Explore match details</summary>
                <div className="mt-5 space-y-4">
                  <ProbabilityBar result={result} />
                  <RecentForm result={result} homeTeam={homeTeam} awayTeam={awayTeam} />
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <PoissonHeatmap matrix={result.poisson_matrix} />
                    <GoalDistributionChart matrix={result.poisson_matrix} homeTeam={homeTeam} awayTeam={awayTeam} />
                  </div>
                </div>
              </details>
            </div>
          </Suspense>
        )}
        {league === "ucl" && <UclStandings />}
      </main>

      <Footer />
    </div>
  );
}
