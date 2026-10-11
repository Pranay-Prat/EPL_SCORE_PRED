"use client";

import { memo } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Github } from "lucide-react";

export default memo(function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-xl border-b border-border/40 transition-all">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        {/* Left: Logo + Brand */}
        <Link className="flex items-center gap-2.5 group" href="/">
          <div className="relative">
            <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo1.png" alt="Match Predictor Logo" className="h-full w-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-foreground">
                  Match Matrix
                </span>
                <span className="text-[0.55rem] bg-primary/15 text-primary font-extrabold tracking-widest px-1.5 py-0.5 rounded uppercase">
                  AI
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2.5 pl-2.5 border-l border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/epl_white.png" alt="Premier League" className="h-5 w-auto object-contain opacity-90 dark:block hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/epl_league.png" alt="Premier League" className="h-5 w-auto object-contain opacity-90 dark:hidden block" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/laliga_white.png" alt="La Liga" className="h-5 w-auto object-contain opacity-90 dark:block hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/laliga_league.png" alt="La Liga" className="h-5 w-auto object-contain opacity-90 dark:hidden block" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ucl_white.png" alt="Champions League" className="h-5 w-auto object-contain opacity-90 dark:block hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ucl_league.png" alt="Champions League" className="h-5 w-auto object-contain opacity-90 dark:hidden block" />
            </div>
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/mavnish604/EPL_SCORE_PRED"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors group/gh"
            title="View on GitHub"
          >
            <Github className="h-[0.95rem] w-[0.95rem] text-muted-foreground group-hover/gh:text-foreground transition-colors" />
          </a>
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
});

