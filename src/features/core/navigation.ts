import type { LucideIcon } from "lucide-react";
import { Bike, LayoutDashboard, PackageSearch, Settings, ShoppingBag, Utensils } from "lucide-react";

export type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/menu", icon: Utensils, label: "Menu" },
  { href: "/delivery", icon: PackageSearch, label: "Delivery" },
  { href: "/riders", icon: Bike, label: "Riders" },
  { href: "/settings", icon: Settings, label: "Settings" },
];
