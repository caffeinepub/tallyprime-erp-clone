import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const INVENTORY: Record<
  string,
  { name: string; price: number; stock: number; sku: string }
> = {
  "8901234567890": {
    name: "LED Bulb 9W",
    price: 45,
    stock: 420,
    sku: "LED-9W",
  },
  "8901234567891": {
    name: "USB Cable Pack",
    price: 35,
    stock: 280,
    sku: "USB-PKT",
  },
  "8901234567892": {
    name: "Water Bottle 1L",
    price: 90,
    stock: 90,
    sku: "WB-1L",
  },
};

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<(typeof INVENTORY)[string] | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);

  const lookup = (code: string) => {
    const p = INVENTORY[code];
    if (p) {
      setProduct(p);
      setNotFound(false);
    } else {
      setProduct(null);
      setNotFound(true);
    }
  };

  const addToCart = () => {
    if (!product) return;
    toast.success(`${product.name} added to POS cart`);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="mobile.barcode_scan.section">
      <h2 className="text-sm font-bold text-foreground">Barcode Scanner</h2>

      {/* Camera viewfinder placeholder */}
      <div className="border-2 border-dashed border-border rounded-lg bg-muted/20 flex items-center justify-center h-40 relative">
        <div className="absolute inset-4 border-2 border-teal/60 rounded" />
        <div className="text-center">
          <ScanLine size={32} className="mx-auto text-teal/60 mb-2" />
          <p className="text-xs text-muted-foreground">Camera viewfinder</p>
          <p className="text-[10px] text-muted-foreground">
            Point camera at barcode
          </p>
        </div>
        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-4 right-4 h-px bg-teal/40" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Manual Barcode Input</Label>
        <div className="flex gap-2">
          <Input
            className="h-7 text-xs flex-1 font-mono"
            placeholder="Enter barcode number..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup(barcode)}
            data-ocid="mobile.barcode.input"
          />
          <Button
            size="sm"
            className="text-xs h-7"
            onClick={() => lookup(barcode)}
            data-ocid="mobile.barcode_scan.button"
          >
            Scan
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Try: 8901234567890, 8901234567891, 8901234567892
        </p>
      </div>

      {notFound && (
        <div
          className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded"
          data-ocid="mobile.barcode.error_state"
        >
          Product not found for barcode: {barcode}
        </div>
      )}

      {product && (
        <Card data-ocid="mobile.product_found.card">
          <CardContent className="pt-3 pb-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {product.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  SKU: {product.sku}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-teal">
                  ₹{product.price}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Stock: {product.stock}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="text-xs h-7 w-full"
              onClick={addToCart}
              data-ocid="mobile.add_to_cart.button"
            >
              <ShoppingCart size={12} className="mr-1" /> Add to POS Cart
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
