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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-card border border-border rounded-xl p-5 shadow-sm"
    >
      <div className="flex flex-col items-center justify-center gap-1 mb-4">
        <h3 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Form used by the model
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
          <StatCard
            label="Avg Scored"
            value={home.scored.toFixed(2)}
            sub="goals per game"
            icon={<TrendingUp className="h-4 w-4 text-chart-1" />}
            delay={0.6}
          />
          <StatCard
            label="Avg Conceded"
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
          <StatCard
            label="Avg Scored"
            value={away.scored.toFixed(2)}
            sub="goals per game"
            icon={<TrendingUp className="h-4 w-4 text-chart-1" />}
            delay={0.8}
          />
          <StatCard
            label="Avg Conceded"
            value={away.conceded.toFixed(2)}
            sub="goals per game"
            icon={<Shield className="h-4 w-4 text-chart-2" />}
            delay={0.9}
          />
        </div>
      </div>

      <p className="text-center text-[0.55rem] text-muted-foreground/50 mt-4 uppercase tracking-wider">
        {result.domestic_form ? "Recent domestic form · Scoring inputs adjusted for league strength" : "Recent domestic fixtures · Goals per game"}
      </p>
    </motion.div>
  );
});
