"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CURATED_ESG_DATA,
  type CuratedESGData,
  getAvailableSectors,
} from "@/lib/esg/curated-data";
import { AddStockModal } from "./AddStockModal";

interface ESGScreeningProps {
  onAddToPortfolio?: (
    symbol: string,
    shares: number,
    price: number,
    name: string,
    sector: string,
  ) => void;
}

function getESGBadgeVariant(
  score: number,
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function ESGScreening({ onAddToPortfolio }: ESGScreeningProps) {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [minESGScore, setMinESGScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<
    "esg" | "environmental" | "social" | "governance"
  >("esg");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    name: string;
    sector: string;
  } | null>(null);

  const sectors = useMemo(() => getAvailableSectors(), []);

  const handleAddClick = (stock: CuratedESGData) => {
    setSelectedStock({
      symbol: stock.symbol,
      name: stock.companyName,
      sector: stock.sector,
    });
    setModalOpen(true);
  };

  const handleConfirmAdd = (
    symbol: string,
    shares: number,
    price: number,
    name: string,
    sector: string,
  ) => {
    onAddToPortfolio?.(symbol, shares, price, name, sector);
  };

  const filteredStocks = useMemo(() => {
    let stocks = Object.values(CURATED_ESG_DATA);

    // Filter by sector
    if (selectedSector !== "all") {
      stocks = stocks.filter((s) => s.sector === selectedSector);
    }

    // Filter by minimum ESG score
    stocks = stocks.filter((s) => s.esgScore >= minESGScore);

    // Sort
    switch (sortBy) {
      case "environmental":
        stocks.sort((a, b) => b.environmentalScore - a.environmentalScore);
        break;
      case "social":
        stocks.sort((a, b) => b.socialScore - a.socialScore);
        break;
      case "governance":
        stocks.sort((a, b) => b.governanceScore - a.governanceScore);
        break;
      default:
        stocks.sort((a, b) => b.esgScore - a.esgScore);
    }

    return stocks;
  }, [selectedSector, minESGScore, sortBy]);

  const totalStocks = Object.keys(CURATED_ESG_DATA).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ESG Screening</CardTitle>
          <p className="text-sm text-muted-foreground">
            Filter {totalStocks} stocks by ESG criteria
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
              >
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esg">Overall ESG Score</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum ESG Score: {minESGScore}</Label>
              <Slider
                value={[minESGScore]}
                onValueChange={(v) => setMinESGScore(v[0])}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Results</span>
            <Badge variant="outline">{filteredStocks.length} stocks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStocks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No stocks match your criteria. Try adjusting the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">ESG</TableHead>
                    <TableHead className="text-right">E</TableHead>
                    <TableHead className="text-right">S</TableHead>
                    <TableHead className="text-right">G</TableHead>
                    {onAddToPortfolio && (
                      <TableHead className="text-right">Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.slice(0, 50).map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-mono font-medium">
                        {stock.symbol}
                      </TableCell>
                      <TableCell>{stock.companyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {stock.sector}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getESGBadgeVariant(stock.esgScore)}>
                          {stock.esgScore}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${getScoreColor(stock.environmentalScore)}`}
                      >
                        {stock.environmentalScore}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${getScoreColor(stock.socialScore)}`}
                      >
                        {stock.socialScore}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${getScoreColor(stock.governanceScore)}`}
                      >
                        {stock.governanceScore}
                      </TableCell>
                      {onAddToPortfolio && (
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddClick(stock)}
                          >
                            Add
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStocks.length > 50 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing top 50 of {filteredStocks.length} results
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            ESG data sourced from Sustainalytics. Scores are converted to a
            0-100 scale where higher is better. Last updated: January 2026.
          </p>
        </CardContent>
      </Card>

      <AddStockModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        stock={selectedStock}
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
}
