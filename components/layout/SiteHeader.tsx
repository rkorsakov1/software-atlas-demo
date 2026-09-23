"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Story" },
  { href: "/explore/", label: "Explore" },
  { href: "/emerging/", label: "Emerging" },
  { href: "/simulator/", label: "Simulator" },
  { href: "/methodology/", label: "Methodology" },
];

const isActiveHref = (pathname: string, href: string): boolean => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
};

export const SiteHeader = (): React.ReactElement => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-[15px] font-semibold tracking-tight"
        >
          The Software Atlas
        </Link>

        <nav aria-label="Primary" className="min-w-0 flex-1">
          <ul className="flex items-center gap-1 overflow-x-auto text-sm scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const active = isActiveHref(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-3",
                      { "bg-secondary text-foreground": active },
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
};
