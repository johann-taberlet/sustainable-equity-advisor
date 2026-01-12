"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HoldingsListProps } from "@/lib/a2ui/types";
import { useCurrency } from "@/lib/currency";

export function HoldingsList({ holdings, currency: currencyProp, baseUSD = false }: HoldingsListProps) {
  // Use context for reactive currency conversion when baseUSD is true
  const { currency: contextCurrency, formatAmount, convertAmount } = useCurrency();

  // Determine which currency to use
  const displayCurrency = baseUSD ? contextCurrency : (currencyProp || "CHF");

  function formatValue(value: number): string {
    const displayValue = baseUSD ? convertAmount(value) : value;
    return new Intl.NumberFormat("en-CH", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(displayValue);
  }
  return (
    <Card data-a2ui="HoldingsList" data-testid="holdings-list">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Holdings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">ESG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.symbol} data-testid="holding-row">
                <TableCell className="font-medium">{holding.symbol}</TableCell>
                <TableCell>{holding.name}</TableCell>
                <TableCell className="text-right">{holding.shares}</TableCell>
                <TableCell className="text-right">
                  {formatValue(holding.value)}
                </TableCell>
                <TableCell className="text-right">
                  {holding.esgScore ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
