"use client";

import { cn } from "@/lib/utils";
import {
  Briefcase,
  Filter,
  LayoutDashboard,
  Leaf,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavigationSection =
  | "dashboard"
  | "holdings"
  | "esg"
  | "screening"
  | "settings";

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "holdings", label: "Holdings", icon: Briefcase },
  { id: "esg", label: "ESG Analysis", icon: Leaf },
  { id: "screening", label: "Screening", icon: Filter },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Logo area */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold">Montblanc</span>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 p-2"
        data-testid="sidebar-nav"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-secondary font-medium",
              )}
              onClick={() => onNavigate(item.id)}
              data-testid={`nav-${item.id}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 Montblanc Capital
        </p>
      </div>
    </div>
  );
}
