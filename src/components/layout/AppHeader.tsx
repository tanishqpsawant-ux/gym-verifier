import { Link } from "@tanstack/react-router";
import { Dumbbell, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/WalletButton";
import { midnightConfig } from "@/config/midnight";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workouts", label: "Workouts" },
  { to: "/challenges", label: "Challenges" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
] as const;

export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">GYMPROOF</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-accent/40 px-3 py-1 font-mono text-[11px] text-accent lg:inline">
            {midnightConfig.networkLabel}
          </span>
          <WalletButton />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <div className={cn("border-t border-border/70 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto grid w-full max-w-7xl gap-1 px-4 py-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
