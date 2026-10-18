import { Check } from "lucide-react";
import { competitions } from "@/lib/competitions";
import type { League } from "@/types/prediction";

export default function CompetitionSwitcher({ league, onChange }: { league: League; onChange: (league: League) => void }) {
  return (
    <div role="group" aria-label="Competition" className="grid grid-cols-3 gap-2 sm:gap-4">
      {(Object.keys(competitions) as League[]).map((key) => {
        const competition = competitions[key];
        const selected = league === key;
        return (
          <button key={key} type="button" aria-pressed={selected} onClick={() => onChange(key)} className={`competition-button relative flex min-w-0 flex-col items-center gap-3 rounded-2xl border px-2 py-4 text-center transition-all sm:flex-row sm:gap-4 sm:p-5 sm:text-left ${selected ? "border-primary/60 bg-card shadow-sm" : "border-border bg-card/40 text-muted-foreground hover:border-primary/30 hover:bg-card"}`}>
            <div className="flex h-10 w-12 shrink-0 items-center justify-center sm:h-12 sm:w-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={competition.logo} alt="" className="max-h-full max-w-full object-contain dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={competition.whiteLogo} alt="" className="hidden max-h-full max-w-full object-contain dark:block" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-tight text-foreground sm:text-sm">{competition.name}</p>
              <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{competition.region}</p>
            </div>
            {selected && <Check aria-hidden="true" className="absolute right-2 top-2 h-3.5 w-3.5 text-primary sm:right-4 sm:top-4" />}
            {selected && <span aria-hidden="true" className="absolute inset-x-5 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
