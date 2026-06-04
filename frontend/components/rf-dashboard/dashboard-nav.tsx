"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "RF Systems" },
  { href: "/wireless-dsp", label: "Wireless/DSP" },
  { href: "/link-budget", label: "Link Budget" },
  { href: "/coverage", label: "Coverage" },
  { href: "/ml-signal-intelligence", label: "ML Signal Intelligence" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex justify-center">
      <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/35 p-1.5 backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-card text-foreground border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
