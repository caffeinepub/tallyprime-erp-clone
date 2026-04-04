import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../../backend.d";

interface Props {
  company?: Company;
}

interface StockItem {
  id: string;
  name: string;
  rate: number;
  gstRate: number;
  unit: string;
}

interface CartItem extends StockItem {
  qty: number;
}

function getStockItems(): StockItem[] {
  const items = JSON.parse(localStorage.getItem("hk_stock_items") || "[]");
  if (items.length === 0) {
    return [
      { id: "1", name: "Rice (5kg)", rate: 350, gstRate: 5, unit: "Bag" },
      {
        id: "2",
        name: "Cooking Oil (1L)",
        rate: 150,
        gstRate: 5,
        unit: "Bottle",
      },
      { id: "3", name: "Sugar (1kg)", rate: 45, gstRate: 5, unit: "Kg" },
      {
        id: "4",
        name: "Wheat Flour (5kg)",
        rate: 220,
        gstRate: 0,
        unit: "Bag",
      },
      { id: "5", name: "Dal (1kg)", rate: 120, gstRate: 5, unit: "Kg" },
      { id: "6", name: "Tea (250g)", rate: 85, gstRate: 5, unit: "Pack" },
    ];
  }
  return items.map(
    (
      it: {
        id?: string;
        name: string;
        salePrice?: number;
        rate?: number;
        gstRate?: number;
        unit?: string;
      },
      idx: number,
    ) => ({
      id: it.id || String(idx),
      name: it.name,
      rate: it.salePrice || it.rate || 0,
      gstRate: it.gstRate || 0,
      unit: it.unit || "Nos",
    }),
  );
}

let billCounter = Number.parseInt(
  localStorage.getItem("hk_pos_bill_counter") || "1000",
  10,
);

export default function POSTerminal({ company }: Props) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payMode, setPayMode] = useState<"Cash" | "Card" | "UPI">("Cash");
  const [tendered, setTendered] = useState("");

  const allItems = getStockItems();
  const filtered = allItems.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (item: StockItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing)
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c,
        )
        .filter((c) => c.qty > 0),
    );
  };

  const subtotal = cart.reduce((s, c) => s + c.qty * c.rate, 0);
  const discountAmt = Math.round((subtotal * discount) / 100);
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = cart.reduce(
    (s, c) => s + Math.round((c.qty * c.rate * c.gstRate) / 100),
    0,
  );
  const total = afterDiscount + gstAmt;
  const change = Math.max(0, Number.parseFloat(tendered || "0") - total);

  const completeSale = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    billCounter += 1;
    localStorage.setItem("hk_pos_bill_counter", String(billCounter));
    const sale = {
      id: String(billCounter),
      billNo: `POS-${billCounter}`,
      date: new Date().toISOString(),
      items: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        rate: c.rate,
        amount: c.qty * c.rate,
      })),
      subtotal,
      discount: discountAmt,
      gst: gstAmt,
      total,
      payMode,
      company: company?.name || "",
    };
    const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
    sales.unshift(sale);
    localStorage.setItem("pos_sales", JSON.stringify(sales));
    toast.success(
      `Sale ${sale.billNo} completed! Total: ₹${total.toLocaleString("en-IN")}`,
    );
    setCart([]);
    setDiscount(0);
    setTendered("");
  };

  return (
    <div className="p-3 h-full flex flex-col md:flex-row gap-3">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-8 text-xs"
            data-ocid="pos.search_input"
          />
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {filtered.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-card border border-border rounded p-2 text-left hover:border-teal transition-colors cursor-pointer"
            >
              <p className="text-xs font-medium text-foreground truncate">
                {item.name}
              </p>
              <p className="text-sm font-bold text-teal mt-0.5">₹{item.rate}</p>
              <p className="text-xs text-muted-foreground">
                {item.unit} | GST {item.gstRate}%
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-80 flex flex-col gap-2 shrink-0">
        <Card className="bg-card border-border flex-1">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Cart ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent
            className="p-2 space-y-1"
            style={{ maxHeight: 200, overflowY: "auto" }}
          >
            {cart.length === 0 && (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="pos.empty_state"
              >
                No items in cart
              </p>
            )}
            {cart.map((c) => (
              <div key={c.id} className="flex items-center gap-1 text-xs">
                <span className="flex-1 truncate">{c.name}</span>
                <button
                  type="button"
                  onClick={() => updateQty(c.id, -1)}
                  className="p-0.5 rounded hover:bg-secondary"
                >
                  <Minus size={10} />
                </button>
                <span className="w-5 text-center font-medium">{c.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(c.id, 1)}
                  className="p-0.5 rounded hover:bg-secondary"
                >
                  <Plus size={10} />
                </button>
                <span className="w-14 text-right font-medium">
                  ₹{(c.qty * c.rate).toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  onClick={() => setCart((p) => p.filter((x) => x.id !== c.id))}
                  className="text-red-400 p-0.5"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground flex-1">Discount (%)</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number.parseFloat(e.target.value) || 0)
                }
                className="h-6 w-16 text-xs"
                min={0}
                max={100}
              />
              <span>-₹{discountAmt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span>₹{gstAmt.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-border pt-1">
              <span>TOTAL</span>
              <span className="text-teal">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-2 space-y-2">
            <div className="flex gap-1">
              {(["Cash", "Card", "UPI"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPayMode(m)}
                  className={`flex-1 text-xs py-1 rounded border transition-colors ${
                    payMode === m
                      ? "border-teal bg-teal/10 text-teal font-medium"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {payMode === "Cash" && (
              <>
                <Input
                  value={tendered}
                  onChange={(e) => setTendered(e.target.value)}
                  placeholder="Amount tendered"
                  className="h-7 text-xs"
                  type="number"
                  data-ocid="pos.input"
                />
                {Number.parseFloat(tendered) > 0 && (
                  <p className="text-xs text-green-400">
                    Change: ₹{change.toLocaleString("en-IN")}
                  </p>
                )}
              </>
            )}
            <div className="flex gap-2">
              <Button
                onClick={completeSale}
                className="flex-1 h-8 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
                data-ocid="pos.primary_button"
              >
                Complete Sale
              </Button>
              <Button
                onClick={() => {
                  setCart([]);
                  setDiscount(0);
                  setTendered("");
                }}
                variant="outline"
                className="h-8 text-xs"
                data-ocid="pos.secondary_button"
              >
                New Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
