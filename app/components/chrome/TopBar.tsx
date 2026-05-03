"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, Home as HomeIcon, History, Rss, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  /** Slot for the right-most cell. On screens 1-3 this is the Sign Up button; on grid-ready it's swapped for the cart icon. */
  rightSlot?: ReactNode;
  /** When true, render a small "MOCK" pill next to the brand mark. */
  mockMode?: boolean;
  /** Click handler for the Home menu icon. When omitted (e.g. on landing) the Home item is hidden. */
  onHome?: () => void;
}

const NAV_ITEMS = [
  { label: "History", Icon: History },
  { label: "Feed", Icon: Rss },
  { label: "Personalization", Icon: Sliders },
] as const;

export default function TopBar({ rightSlot, mockMode = false, onHome }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4">
      <div className="mx-auto max-w-[1700px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand mark — no-op */}
          <ClickPulseButton
            aria-label="Agent"
            className="flex items-center gap-2 text-text-primary font-semibold tracking-tight"
          >
            <Sparkles className="h-7 w-7 text-accent" strokeWidth={2.2} />
            <span className="text-base">Agent</span>
          </ClickPulseButton>
          {mockMode && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              MOCK
            </span>
          )}
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          {onHome && (
            <ClickPulseButton
              onClick={onHome}
              title="Back to home"
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg flex items-center gap-2"
            >
              <HomeIcon className="h-6 w-6" strokeWidth={2} />
              <span>Home</span>
            </ClickPulseButton>
          )}
          {NAV_ITEMS.map(({ label, Icon }) => (
            <ClickPulseButton
              key={label}
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg flex items-center gap-2"
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
              <span>{label}</span>
            </ClickPulseButton>
          ))}
        </nav>

        {/* Right slot: Log In + Sign Up | CartIcon */}
        <div className="flex items-center gap-3">
          <ClickPulseButton className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hidden sm:block">
            Log In
          </ClickPulseButton>
          {rightSlot ?? <SignUpButton />}
        </div>
      </div>
    </header>
  );
}

function SignUpButton() {
  return (
    <ClickPulseButton
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-semibold",
        "bg-accent text-white hover:bg-accent/90 transition-colors"
      )}
    >
      Sign Up
    </ClickPulseButton>
  );
}

function ClickPulseButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={className}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
