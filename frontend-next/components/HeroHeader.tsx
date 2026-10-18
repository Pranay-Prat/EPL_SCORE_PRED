export default function HeroHeader() {
  return (
    <header className="relative flex items-center justify-between gap-8 overflow-hidden py-10 sm:py-14">
      <div className="relative z-10">
        <p className="eyebrow mb-4">A clearer view of the beautiful game</p>
        <h1 className="text-[clamp(2.8rem,6.5vw,5rem)] font-semibold leading-[1.04] tracking-[-0.065em]">Football,<br /><span className="text-primary">with foresight.</span></h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">The fixtures. The forecasts. The bigger picture.</p>
      </div>
      <div aria-hidden="true" className="pitch-art hidden w-[38%] max-w-[380px] shrink-0 rotate-[-8deg] md:block">
        <svg viewBox="0 0 360 240" fill="none" className="w-full text-primary">
          <rect x="20" y="20" width="320" height="200" rx="12" fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeOpacity=".25" />
          <path d="M180 20v200M20 70h55v100H20m320-100h-55v100h55M20 95h25v50H20m320-50h-25v50h25" stroke="currentColor" strokeOpacity=".25" />
          <circle cx="180" cy="120" r="33" stroke="currentColor" strokeOpacity=".25" /><circle cx="180" cy="120" r="3" fill="currentColor" />
          <path d="m85 155 60-73 62 70 55-71" stroke="currentColor" strokeOpacity=".4" strokeDasharray="5 6" />
          {[[85,155],[145,82],[207,152],[262,81]].map(([x,y],i) => <g key={i}><circle cx={x} cy={y} r="17" fill="var(--background)" /><circle cx={x} cy={y} r="10" fill="currentColor" fillOpacity={i===3?1:.2} /><circle cx={x} cy={y} r="3" fill={i===3?"var(--background)":"currentColor"} /></g>)}
        </svg>
      </div>
    </header>
  );
}
