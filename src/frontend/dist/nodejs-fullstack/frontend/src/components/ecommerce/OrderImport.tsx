import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ImportedOrder = {
  order_id: string;
  customer: string;
  product: string;
  qty: string;
  price: string;
  date: string;
  status: string;
};

const SAMPLE_CSV = `order_id,customer,product,qty,price,date,status
ORD-2001,Amit Kumar,LED Bulb 9W,10,450,2026-03-30,Pending
ORD-2002,Sunita Joshi,USB Cable Pack,5,175,2026-03-30,Pending`;

export default function OrderImport() {
  const [previewData, setPreviewData] = useState<ImportedOrder[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    order_id: "",
    customer: "",
    product: "",
    qty: "",
    price: "",
    date: "",
  });

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] ?? "";
      });
      return obj as ImportedOrder;
    });
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        setPreviewData(data);
        toast.success(`Parsed ${data.length} orders from file`);
      } catch {
        toast.error("Failed to parse file");
      }
    };
    reader.readAsText(file);
  };

  const importOrders = () => {
    const existing = JSON.parse(localStorage.getItem("hk_ecom_orders") || "[]");
    const merged = [
      ...existing,
      ...previewData.map((o) => ({
        ...o,
        status: "Pending",
        importedAt: new Date().toISOString(),
      })),
    ];
    localStorage.setItem("hk_ecom_orders", JSON.stringify(merged));
    toast.success(`${previewData.length} orders imported as Sales Vouchers`);
    setPreviewData([]);
  };

  const addManual = () => {
    if (!form.order_id || !form.customer || !form.product) {
      toast.error("Fill all required fields");
      return;
    }
    const existing = JSON.parse(localStorage.getItem("hk_ecom_orders") || "[]");
    existing.push({
      ...form,
      status: "Pending",
      importedAt: new Date().toISOString(),
    });
    localStorage.setItem("hk_ecom_orders", JSON.stringify(existing));
    toast.success("Order added successfully");
    setForm({
      order_id: "",
      customer: "",
      product: "",
      qty: "",
      price: "",
      date: "",
    });
  };

  return (
    <div className="p-4 space-y-4" data-ocid="ecommerce.order_import.section">
      <h2 className="text-sm font-bold text-foreground">Order Import</h2>
      <Tabs defaultValue="upload">
        <TabsList className="h-8">
          <TabsTrigger
            value="upload"
            className="text-xs"
            data-ocid="ecommerce.upload_file.tab"
          >
            Upload File
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="text-xs"
            data-ocid="ecommerce.manual_entry.tab"
          >
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3 mt-3">
          <button
            type="button"
            data-ocid="ecommerce.file.dropzone"
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-teal bg-teal/10"
                : "border-border hover:border-teal/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Drag & drop CSV/JSON file here, or click to browse
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              data-ocid="ecommerce.upload_button"
            />
          </button>

          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Sample CSV Format</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <pre className="text-[10px] font-mono bg-muted/40 p-2 rounded overflow-x-auto">
                {SAMPLE_CSV}
              </pre>
            </CardContent>
          </Card>

          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {previewData.length} orders ready to import
                </span>
                <Button
                  size="sm"
                  className="text-xs h-7"
                  onClick={importOrders}
                  data-ocid="ecommerce.import_as_sales.button"
                >
                  Import as Sales Voucher
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        "Order ID",
                        "Customer",
                        "Product",
                        "Qty",
                        "Price",
                        "Date",
                      ].map((h) => (
                        <TableHead key={h} className="text-xs">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={`${row.order_id}-${row.customer}`}>
                        <TableCell className="text-xs">
                          {row.order_id}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.customer}
                        </TableCell>
                        <TableCell className="text-xs">{row.product}</TableCell>
                        <TableCell className="text-xs">{row.qty}</TableCell>
                        <TableCell className="text-xs">{row.price}</TableCell>
                        <TableCell className="text-xs">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-3 mt-3">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["order_id", "Order ID *"],
                    ["customer", "Customer Name *"],
                    ["product", "Product *"],
                    ["qty", "Quantity"],
                    ["price", "Unit Price"],
                    ["date", "Date"],
                  ] as [keyof typeof form, string][]
                ).map(([field, label]) => (
                  <div key={field}>
                    <Label className="text-xs">{label}</Label>
                    <Input
                      className="h-7 text-xs mt-1"
                      value={form[field]}
                      type={
                        field === "date"
                          ? "date"
                          : field === "qty" || field === "price"
                            ? "number"
                            : "text"
                      }
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [field]: e.target.value }))
                      }
                      data-ocid={`ecommerce.${field}.input`}
                    />
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={addManual}
                data-ocid="ecommerce.add_order.submit_button"
              >
                Add Order
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
