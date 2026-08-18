"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UtensilsCrossed, X } from "lucide-react";
import { useState } from "react";

import { navigationItems } from "@/features/core/navigation";
import { cn } from "@/lib/utils";

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1 px-3">
      {navigationItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            href={href}
            key={href}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <Link className="flex items-center gap-2 px-5 py-5" href="/dashboard">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <UtensilsCrossed aria-hidden="true" className="size-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">Saswati&apos;s Kitchen</span>
        <span className="block text-xs text-muted-foreground">Admin Control</span>
      </span>
    </Link>
  );
}

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen border-r bg-sidebar lg:block">
        <SidebarBrand />
        <NavigationLinks />
      </aside>

      <div className="border-b bg-sidebar px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <SidebarBrand />
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            {isOpen ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
          </button>
        </div>
        {isOpen ? (
          <div className="border-t pt-3" id="mobile-navigation">
            <NavigationLinks onNavigate={() => setIsOpen(false)} />
          </div>
        ) : null}
      </div>
    </>
  );
}
