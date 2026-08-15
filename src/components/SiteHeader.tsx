import { Link } from "@tanstack/react-router";
import { ReadingControls } from "./ReadingControls";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur transition-colors duration-300">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight">Daily Reading</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            one piece a day
          </span>
        </Link>
        <ReadingControls />
      </div>
    </header>
  );
}