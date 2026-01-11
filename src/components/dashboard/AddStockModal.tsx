"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCuratedESGData } from "@/lib/esg/curated-data";

interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
}

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: StockInfo | null;
  onConfirm: (
    symbol: string,
    shares: number,
    price: number,
    name: string,
    sector: string,
  ) => void;
}

type PriceStatus = "loading" | "live" | "fallback" | "error";

export function AddStockModal({
  open,
  onOpenChange,
  stock,
  onConfirm,
}: AddStockModalProps) {
  const [quantity, setQuantity] = useState(10);
  const [price, setPrice] = useState<number | null>(null);
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("loading");

  // Fetch price when modal opens with a new stock
  useEffect(() => {
    if (!open || !stock) {
      setPrice(null);
      setPriceStatus("loading");
      setQuantity(10);
      return;
    }

    const fetchPrice = async () => {
      setPriceStatus("loading");

      try {
        const response = await fetch(
          `/api/stock?symbol=${encodeURIComponent(stock.symbol)}`,
        );

        if (response.ok) {
          const data = await response.json();
          setPrice(data.price);
          setPriceStatus("live");
          return;
        }

        // API failed - try curated fallback
        const curatedData = getCuratedESGData(stock.symbol);
        if (curatedData?.price) {
          setPrice(curatedData.price);
          setPriceStatus("fallback");
          return;
        }

        // No fallback available
        setPrice(null);
        setPriceStatus("error");
      } catch {
        // Network error - try curated fallback
        const curatedData = getCuratedESGData(stock.symbol);
        if (curatedData?.price) {
          setPrice(curatedData.price);
          setPriceStatus("fallback");
          return;
        }

        setPrice(null);
        setPriceStatus("error");
      }
    };

    fetchPrice();
  }, [open, stock]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleConfirm = () => {
    if (!stock || !price) return;
    onConfirm(stock.symbol, quantity, price, stock.name, stock.sector);
    onOpenChange(false);
  };

  const totalValue = price ? price * quantity : 0;
  const isLoading = priceStatus === "loading";
  const hasPrice = price !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
          <DialogDescription>
            {stock ? (
              <>
                <span className="font-mono font-semibold">{stock.symbol}</span>
                {" - "}
                {stock.name}
              </>
            ) : (
              "Select a stock to add"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price display */}
          <div className="flex items-center justify-between">
            <Label>Price per share</Label>
            <div className="text-right">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching price...</span>
                </div>
              ) : hasPrice ? (
                <span className="font-data text-lg font-semibold">
                  ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-muted-foreground">Unavailable</span>
              )}
            </div>
          </div>

          {/* Fallback warning */}
          {priceStatus === "fallback" && (
            <Alert
              variant="default"
              className="bg-yellow-50 dark:bg-yellow-950"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Using estimated price (live API unavailable)
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {priceStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to fetch price. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Quantity input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of shares</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={handleInputChange}
                className="w-24 text-center font-data"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total value */}
          {hasPrice && (
            <div className="flex items-center justify-between border-t pt-4">
              <Label>Total value</Label>
              <span className="font-data text-xl font-bold">
                $
                {totalValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || !hasPrice}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Add to Portfolio"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
