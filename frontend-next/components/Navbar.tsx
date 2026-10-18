import Link from "next/link";
import { Github } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navbar() {
  return (
    <nav aria-label="Main navigation" className="border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3"><span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M3 18V6l9 9 9-9v12" /></svg></span><span className="text-base font-extrabold tracking-tight">match<span className="font-medium text-muted-foreground">matrix</span><span className="text-primary">.</span></span></Link>
        <div className="flex items-center gap-3 sm:gap-5"><span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">Your matchday advantage</span><a href="https://github.com/mavnish604/EPL_SCORE_PRED" target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub" className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"><Github className="h-4 w-4" /></a><ModeToggle /></div>
      </div>
    </nav>
  );
}
