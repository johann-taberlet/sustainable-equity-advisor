"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="dashboard-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {sidebar}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          data-testid="dashboard-header"
          className="flex h-14 items-center gap-4 border-b bg-card px-4"
        >
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {header}
        </header>

        {/* Main content */}
        <main
          data-testid="dashboard-main"
          className="flex-1 overflow-auto p-4"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
