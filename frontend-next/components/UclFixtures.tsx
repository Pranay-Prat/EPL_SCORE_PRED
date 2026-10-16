import snapshot from "@/data/ucl-standings.json";
import { getTeamLogo } from "@/lib/teamLogos";

function Club({ name, winner }: { name: string; winner: boolean }) {
  const logo = getTeamLogo(name);
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background/60 sm:h-20 sm:w-20">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" loading="lazy" className="h-11 w-11 object-contain sm:h-14 sm:w-14" />
        ) : (
          <span aria-hidden="true" className="text-xl font-black text-muted-foreground">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className={`text-xs leading-snug sm:text-sm ${winner ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>{name}</span>
    </div>
  );
}

export default function UclFixtures() {
  if (snapshot.fixtures.length === 0) {
    return <p role="status" className="p-10 text-center text-sm text-muted-foreground">No upcoming fixtures.</p>;
  }
  return (
    <div className="p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>{snapshot.fixtures.length} matches</span>
        <span>Predicted scores · Home / Away</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {snapshot.fixtures.map((fixture) => {
          const { homeTeam, awayTeam, homeGoals, awayGoals } = fixture;
          const isDraw = homeGoals === awayGoals;
          return (
            <article key={`${homeTeam}-${awayTeam}`} aria-label={`${homeTeam} versus ${awayTeam}, predicted score ${homeGoals} to ${awayGoals}`} className="relative overflow-hidden rounded-2xl border border-border bg-background/40 transition-colors hover:border-primary/30">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chart-3/50 to-transparent" />
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 px-3 pb-5 pt-6 sm:px-4">
                <Club name={homeTeam} winner={homeGoals > awayGoals} />
                <div className="flex flex-col items-center gap-2 pt-3 sm:pt-5">
                  <div aria-hidden="true" className="flex items-center gap-2 text-3xl font-black tabular-nums sm:text-4xl">
                    <span className={homeGoals >= awayGoals ? "text-foreground" : "text-muted-foreground"}>{homeGoals}</span>
                    <span className="text-lg font-normal text-muted-foreground/50">:</span>
                    <span className={awayGoals >= homeGoals ? "text-foreground" : "text-muted-foreground"}>{awayGoals}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${isDraw ? "text-muted-foreground" : "text-chart-3 dark:text-chart-1"}`}>
                    {isDraw ? "Draw" : homeGoals > awayGoals ? "Home win" : "Away win"}
                  </span>
                </div>
                <Club name={awayTeam} winner={awayGoals > homeGoals} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
