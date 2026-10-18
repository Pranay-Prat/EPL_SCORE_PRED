import type { League } from "@/types/prediction";
import type { MatchweekSnapshot } from "@/types/standings";
import epl from "@/data/epl-standings.json";
import laliga from "@/data/laliga-standings.json";
import ucl from "@/data/ucl-standings.json";

export const competitions = {
  epl: { name: "Premier League", region: "England", logo: "/epl_league.png", whiteLogo: "/epl_white.png", code: "PL" },
  laliga: { name: "La Liga", region: "Spain", logo: "/laliga_league.png", whiteLogo: "/laliga_white.png", code: "LL" },
  ucl: { name: "Champions League", region: "Europe", logo: "/ucl_league.png", whiteLogo: "/ucl_white.png", code: "UCL" },
} satisfies Record<League, { name: string; region: string; logo: string; whiteLogo: string; code: string }>;

export const snapshots: Record<League, MatchweekSnapshot> = { epl, laliga, ucl };

export function formatSnapshotDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(value));
}
