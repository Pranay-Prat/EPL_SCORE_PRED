import { getTeamLogo } from "@/lib/teamLogos";

export default function TeamCrest({ team, className = "h-10 w-10" }: { team: string; className?: string }) {
  const logo = getTeamLogo(team);
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt="" loading="lazy" className={`shrink-0 object-contain ${className}`} />
  ) : (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground ${className}`}>
      {team.split(" ").map((word) => word[0]).slice(0, 2).join("")}
    </span>
  );
}
