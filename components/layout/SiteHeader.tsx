"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Story" },
  { href: "/explore/", label: "Explore" },
  { href: "/emerging/", label: "Emerging" },
  { href: "/simulator/", label: "Simulator" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/contribute/", label: "Contribute" },
];

const isActiveHref = (pathname: string, href: string): boolean => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
};

export const SiteHeader = (): React.ReactElement => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleToggleMenu = (): void => setMenuOpen((open) => !open);
  const handleNavigate = (): void => setMenuOpen(false);

  const renderLinks = (className: string): React.ReactElement[] =>
    NAV_ITEMS.map((item) => {
      const active = isActiveHref(pathname, item.href);
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={handleNavigate}
            className={cn(className, { "font-semibold text-foreground": active })}
          >
            {item.label}
          </Link>
        </li>
      );
    });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-[15px] font-semibold tracking-tight">
          The Software Atlas
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 md:block">
          <ul className="flex items-center gap-1 text-sm">
            {renderLinks(
              "whitespace-nowrap px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:px-3",
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={handleToggleMenu}
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-secondary md:hidden"
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        hidden={!menuOpen}
        className="border-t border-border bg-background px-4 py-2 md:hidden"
      >
        <ul className="flex flex-col text-base">
          {renderLinks("block py-2.5 text-muted-foreground hover:text-foreground")}
        </ul>
      </nav>
    </header>
  );
};
