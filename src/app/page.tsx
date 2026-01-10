"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, PieChart, Search, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Montblanc Capital</h1>
        <ThemeToggle />
      </header>

      <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4 max-w-full flex-wrap">
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat Advisor</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Portfolio Dashboard</span>
            <span className="sm:hidden">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="screening" className="gap-1.5">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">ESG Screening</span>
            <span className="sm:hidden">Screening</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Market Insights</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 p-4">
          <div data-testid="chat-content" className="h-full">
            <p className="text-muted-foreground">
              Chat with your AI ESG advisor
            </p>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="flex-1 p-4">
          <div data-testid="portfolio-content" className="h-full">
            <p className="text-muted-foreground">
              View your portfolio dashboard
            </p>
          </div>
        </TabsContent>

        <TabsContent value="screening" className="flex-1 p-4">
          <div data-testid="screening-content" className="h-full">
            <p className="text-muted-foreground">Screen ESG investments</p>
          </div>
        </TabsContent>

        <TabsContent value="market" className="flex-1 p-4">
          <div data-testid="market-content" className="h-full">
            <p className="text-muted-foreground">Market insights and trends</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
