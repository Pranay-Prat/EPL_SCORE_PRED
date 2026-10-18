"use client";

import { memo, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";
import { UCL_CURRENT_SEASON_TEAMS } from "@/lib/domesticLeagues";

interface Props {
  label: string;
  teams: string[];
  selected: string;
  onChange: (team: string) => void;
  isLoading: boolean;
  side: "home" | "away";
  disabledTeam?: string;
  isUcl?: boolean;
}

export default memo(function TeamSelector({
  label,
  teams,
  selected,
  onChange,
  isLoading,
  side,
  disabledTeam,
  isUcl = false,
}: Props) {
  const isHome = side === "home";
  const logoSrc = selected ? getTeamLogo(selected) : undefined;
  const [searchFilter, setSearchFilter] = useState("");

  // Filter and prioritize teams
  const { seasonTeams, otherTeams, filteredList } = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();

    if (!isUcl) {
      const list = teams.filter((t) => !q || t.toLowerCase().includes(q));
      return { seasonTeams: [], otherTeams: [], filteredList: list };
    }

    const currentSeasonSet = new Set(
      UCL_CURRENT_SEASON_TEAMS.map((name) => name.toLowerCase())
    );

    const sTeams: string[] = [];
    const oTeams: string[] = [];

    // Prioritize 2024/25 UCL clubs at the top
    for (const team of UCL_CURRENT_SEASON_TEAMS) {
      if (teams.includes(team) && (!q || team.toLowerCase().includes(q))) {
        sTeams.push(team);
      }
    }

    // Historical & other clubs
    for (const team of teams) {
      if (!currentSeasonSet.has(team.toLowerCase()) && (!q || team.toLowerCase().includes(q))) {
        oTeams.push(team);
      }
    }

    return {
      seasonTeams: sTeams,
      otherTeams: oTeams,
      filteredList: [...sTeams, ...oTeams],
    };
  }, [teams, searchFilter, isUcl]);

  const renderTeamItem = (t: string) => {
    const itemLogo = getTeamLogo(t);
    const isDisabled = t === disabledTeam;

    return (
      <SelectItem
        key={t}
        value={t}
        disabled={isDisabled}
        className="cursor-pointer text-sm py-2 focus:bg-primary/10 focus:text-foreground rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2.5 truncate min-w-0">
            {itemLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={itemLogo} alt="" className="h-5 w-5 object-contain shrink-0" />
            ) : (
              <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold shrink-0 text-muted-foreground">
                {t.charAt(0)}
              </span>
            )}
            <span className="truncate font-medium">{t}</span>
          </div>
          {isDisabled && (
            <span className="text-[0.6rem] text-muted-foreground/60 uppercase font-semibold shrink-0">
              Opponent
            </span>
          )}
        </div>
      </SelectItem>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isHome ? -15 : 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-3 w-full"
    >
      {/* Selected team logo preview */}
      <div className="h-20 flex items-center justify-center">
        {selected && logoSrc ? (
          <motion.div
            key={selected}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative group flex items-center justify-center"
          >
            <div className={`absolute inset-0 rounded-full blur-lg opacity-40 transition-opacity ${isHome ? "bg-chart-1/30" : "bg-chart-2/30"}`} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={`${selected} logo`}
              className="h-16 w-16 object-contain drop-shadow-md relative z-10"
            />
          </motion.div>
        ) : selected ? (
          <motion.div
            key={selected}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center font-black text-lg ${
              isHome ? "border-chart-1/40 text-chart-1" : "border-chart-2/40 text-chart-2"
            }`}
          >
            {selected.substring(0, 2).toUpperCase()}
          </motion.div>
        ) : (
          <div className="h-16 w-16 rounded-full border border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground/40 font-medium">
            Select
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`${side}-team`} className="text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
          {label}
        </Label>
      </div>

      {/* Search Filter for large team lists */}
      {teams.length > 25 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            aria-label={`Search ${side} teams`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search teams..."
            className="h-8 pl-8 text-xs bg-muted/40 border-border/60 rounded-lg placeholder:text-muted-foreground/60"
          />
          {searchFilter && (
            <button
              type="button"
              aria-label={`Clear ${side} team search`}
              onClick={() => setSearchFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Team Dropdown */}
      <Select value={selected} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger
          id={`${side}-team`}
          className={`w-full h-11 text-sm bg-background/60 backdrop-blur-sm border transition-all hover:border-primary/40 focus:ring-2 ring-primary/20 rounded-xl ${
            selected
              ? isHome ? "border-chart-1/40" : "border-chart-2/40"
              : ""
          }`}
        >
          <SelectValue placeholder={isLoading ? "Loading teams…" : "Select a team"} />
        </SelectTrigger>
        <SelectContent className="max-h-80 rounded-xl">
          {filteredList.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              No matching teams found
            </div>
          ) : isUcl ? (
            <>
              {seasonTeams.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[0.62rem] font-extrabold uppercase tracking-widest text-primary px-2.5 py-1.5 bg-primary/10 rounded-md mx-1 my-1">
                    Featured clubs
                  </SelectLabel>
                  {seasonTeams.map(renderTeamItem)}
                </SelectGroup>
              )}
              {otherTeams.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground/80 px-2.5 py-1.5 mt-2 mx-1 border-t border-border/40">
                    Other UCL Clubs ({otherTeams.length})
                  </SelectLabel>
                  {otherTeams.map(renderTeamItem)}
                </SelectGroup>
              )}
            </>
          ) : (
            filteredList.map(renderTeamItem)
          )}
        </SelectContent>
      </Select>
    </motion.div>
  );
});
