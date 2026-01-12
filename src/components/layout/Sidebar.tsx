"use client";

import {
  Briefcase,
  ExternalLink,
  Filter,
  Github,
  LayoutDashboard,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavigationSection = "dashboard" | "holdings" | "esg" | "screening";

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
      <div className="border-t p-2">
        <Button variant="ghost" className="w-full justify-start gap-3" asChild>
          <a
            href="https://github.com/johann-taberlet/sustainable-equity-advisor"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5" />
            <span className="flex-1 text-left">Source Code</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          &copy; 2026 Montblanc Capital
        </p>
      </div>
    </div>
  );
}
