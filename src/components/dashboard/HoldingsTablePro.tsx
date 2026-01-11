"use client";

import { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface HoldingRow {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  avgCost?: number;
  esgScore: number;
  change?: number;
  sector: string;
}

type SortKey = "symbol" | "name" | "shares" | "value" | "esgScore" | "change";
type SortDirection = "asc" | "desc";

interface HoldingsTableProProps {
  holdings: HoldingRow[];
  currency?: string;
  onRemove?: (symbol: string) => void;
  highlightedSymbols?: string[];
}

function getESGColorClass(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function HoldingsTablePro({
  holdings,
  currency = "CHF",
  onRemove,
  highlightedSymbols = [],
}: HoldingsTableProProps) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [minEsgFilter, setMinEsgFilter] = useState<string>("");

  // Get unique sectors
  const sectors = useMemo(() => {
    const unique = new Set(holdings.map((h) => h.sector));
    return Array.from(unique).sort();
  }, [holdings]);

  // Filter and sort holdings
  const filteredHoldings = useMemo(() => {
    let result = [...holdings];

    // Apply sector filter
    if (sectorFilter !== "all") {
      result = result.filter((h) => h.sector === sectorFilter);
    }

    // Apply ESG filter
    if (minEsgFilter) {
      const minEsg = parseInt(minEsgFilter, 10);
      if (!isNaN(minEsg)) {
        result = result.filter((h) => h.esgScore >= minEsg);
      }
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [holdings, sortKey, sortDirection, sectorFilter, minEsgFilter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const totalValue = filteredHoldings.reduce((sum, h) => sum + h.value, 0);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="space-y-4" data-testid="holdings-table-pro">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[180px]" data-testid="sector-filter">
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Min ESG:</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={minEsgFilter}
            onChange={(e) => setMinEsgFilter(e.target.value)}
            className="w-20"
            placeholder="0"
            data-testid="esg-filter"
          />
        </div>

        <span className="ml-auto text-sm text-muted-foreground">
          {filteredHoldings.length} of {holdings.length} holdings
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("symbol")}
              >
                <div className="flex items-center">
                  Symbol
                  <SortIcon column="symbol" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon column="name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("shares")}
              >
                <div className="flex items-center justify-end">
                  Shares
                  <SortIcon column="shares" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center justify-end">
                  Value
                  <SortIcon column="value" />
                </div>
              </TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("esgScore")}
              >
                <div className="flex items-center justify-end">
                  ESG
                  <SortIcon column="esgScore" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHoldings.map((holding) => {
              const isHighlighted = highlightedSymbols.includes(holding.symbol);
              return (
                <TableRow
                  key={holding.symbol}
                  data-testid="holding-row"
                  className={cn(
                    isHighlighted && "bg-yellow-50 dark:bg-yellow-950/20",
                  )}
                >
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell className="font-data text-right">{holding.shares}</TableCell>
                  <TableCell className="font-data text-right">
                    {currency} {holding.value.toLocaleString("en-CH")}
                  </TableCell>
                  <TableCell className="font-data text-right">
                    {totalValue > 0
                      ? ((holding.value / totalValue) * 100).toFixed(1)
                      : 0}
                    %
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn("font-data font-medium", getESGColorClass(holding.esgScore))}
                      data-testid="holding-esg-score"
                    >
                      {holding.esgScore}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onRemove && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onRemove(holding.symbol)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
