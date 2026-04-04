import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface DocEntry {
  id: string;
  uploadDate: string;
  vendor: string;
  invoiceNumber: string;
  amount: string;
  gst: string;
  status: "Pending" | "Linked" | "Rejected";
  extractedData?: Record<string, string>;
  linkedVoucherId?: string;
}

const REG_KEY = "hkp_document_register";

const SAMPLE_DOCS: DocEntry[] = [
  {
    id: "DOC-001",
    uploadDate: "2026-03-01T09:00:00",
    vendor: "Sharma Traders",
    invoiceNumber: "ST/2026/101",
    amount: "25,000",
    gst: "3,814",
    status: "Linked",
    linkedVoucherId: "SALE-001",
    extractedData: {
      vendor: "Sharma Traders",
      invoiceNumber: "ST/2026/101",
      date: "01/03/2026",
      totalAmount: "25,000",
      gstAmount: "3,814",
      gstin: "07AABCS1234A1ZX",
    },
  },
  {
    id: "DOC-002",
    uploadDate: "2026-03-03T11:00:00",
    vendor: "Gupta Wholesale",
    invoiceNumber: "GW/26/450",
    amount: "18,500",
    gst: "2,822",
    status: "Pending",
    extractedData: {
      vendor: "Gupta Wholesale",
      invoiceNumber: "GW/26/450",
      date: "03/03/2026",
      totalAmount: "18,500",
      gstAmount: "2,822",
      gstin: "27AABCG5678B2YX",
    },
  },
  {
    id: "DOC-003",
    uploadDate: "2026-03-05T14:00:00",
    vendor: "Mehta Enterprises",
    invoiceNumber: "ME/001/26",
    amount: "45,000",
    gst: "6,864",
    status: "Pending",
    extractedData: {
      vendor: "Mehta Enterprises",
      invoiceNumber: "ME/001/26",
      date: "05/03/2026",
      totalAmount: "45,000",
      gstAmount: "6,864",
      gstin: "29AABCM9012C3ZX",
    },
  },
  {
    id: "DOC-004",
    uploadDate: "2026-03-07T16:00:00",
    vendor: "Raj Suppliers",
    invoiceNumber: "RS/2026/789",
    amount: "8,200",
    gst: "1,251",
    status: "Rejected",
    extractedData: {
      vendor: "Raj Suppliers",
      invoiceNumber: "RS/2026/789",
      date: "07/03/2026",
      totalAmount: "8,200",
      gstAmount: "1,251",
      gstin: "06AABCR3456D4WX",
    },
  },
];

function loadDocs(): DocEntry[] {
  try {
    return JSON.parse(localStorage.getItem(REG_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveDocs(docs: DocEntry[]) {
  localStorage.setItem(REG_KEY, JSON.stringify(docs));
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-700 text-white",
  Linked: "bg-green-700 text-white",
  Rejected: "bg-red-700 text-white",
};

export default function DocumentRegister() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewDoc, setViewDoc] = useState<DocEntry | null>(null);
  const [linkId, setLinkId] = useState("");
  const [linkTarget, setLinkTarget] = useState("");

  const reload = useCallback(() => {
    setDocs(loadDocs());
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  const handleSeedSamples = () => {
    const existing = loadDocs();
    const ids = new Set(existing.map((d) => d.id));
    const toAdd = SAMPLE_DOCS.filter((d) => !ids.has(d.id));
    const merged = [...existing, ...toAdd];
    saveDocs(merged);
    setDocs(merged);
    toast.success(`Added ${toAdd.length} sample documents`);
  };

  const handleLink = (docId: string) => {
    if (!linkId.trim()) {
      toast.error("Enter a voucher ID");
      return;
    }
    const updated = docs.map((d) =>
      d.id === docId
        ? { ...d, status: "Linked" as const, linkedVoucherId: linkId }
        : d,
    );
    saveDocs(updated);
    setDocs(updated);
    setLinkTarget("");
    setLinkId("");
    toast.success("Document linked to voucher");
  };

  const handleReject = (docId: string) => {
    const updated = docs.map((d) =>
      d.id === docId ? { ...d, status: "Rejected" as const } : d,
    );
    saveDocs(updated);
    setDocs(updated);
    toast.success("Document rejected");
  };

  const filtered =
    filterStatus === "all"
      ? docs
      : docs.filter((d) => d.status === filterStatus);
  const stats = {
    total: docs.length,
    pending: docs.filter((d) => d.status === "Pending").length,
    linked: docs.filter((d) => d.status === "Linked").length,
    rejected: docs.filter((d) => d.status === "Rejected").length,
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-semibold text-foreground">
            Document Register
          </h2>
        </div>
        <Button
          size="sm"
          onClick={handleSeedSamples}
          className="bg-teal-600 hover:bg-teal-700 text-white"
          data-ocid="docregister.primary_button"
        >
          Add Sample Documents
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            ["Total", stats.total, "bg-teal-900/30 border-teal-700"],
            ["Pending", stats.pending, "bg-yellow-900/30 border-yellow-700"],
            ["Linked", stats.linked, "bg-green-900/30 border-green-700"],
            ["Rejected", stats.rejected, "bg-red-900/30 border-red-700"],
          ] as [string, number, string][]
        ).map(([label, val, cls]) => (
          <Card key={label} className={`border ${cls}`}>
            <CardContent className="pt-3 pb-2 text-center">
              <p className="text-lg font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Documents</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Linked">Linked</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Doc ID</TableHead>
                  <TableHead className="text-xs">Upload Date</TableHead>
                  <TableHead className="text-xs">Vendor</TableHead>
                  <TableHead className="text-xs">Invoice #</TableHead>
                  <TableHead className="text-xs text-right">
                    Amount (₹)
                  </TableHead>
                  <TableHead className="text-xs text-right">GST (₹)</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-xs text-muted-foreground py-6"
                    >
                      No documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="text-xs font-mono">
                        {doc.id}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(doc.uploadDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs">{doc.vendor}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {doc.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {doc.amount}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {doc.gst}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${STATUS_COLORS[doc.status]}`}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                            onClick={() => setViewDoc(doc)}
                          >
                            View
                          </Button>
                          {doc.status === "Pending" &&
                            (linkTarget === doc.id ? (
                              <div className="flex gap-1">
                                <Input
                                  value={linkId}
                                  onChange={(e) => setLinkId(e.target.value)}
                                  placeholder="Voucher ID"
                                  className="h-6 text-xs w-24"
                                />
                                <Button
                                  size="sm"
                                  className="h-6 text-xs bg-green-700 text-white"
                                  onClick={() => handleLink(doc.id)}
                                >
                                  Link
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs"
                                  onClick={() => setLinkTarget("")}
                                >
                                  &#x2715;
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={() => setLinkTarget(doc.id)}
                              >
                                Link
                              </Button>
                            ))}
                          {doc.status === "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs border-red-500 text-red-400"
                              onClick={() => handleReject(doc.id)}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewDoc} onOpenChange={(o) => !o && setViewDoc(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Document Details — {viewDoc?.id}
            </DialogTitle>
          </DialogHeader>
          {viewDoc && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(viewDoc.extractedData ?? {}).map(([k, v]) => (
                <div key={k}>
                  <span className="text-muted-foreground capitalize">
                    {k.replace(/([A-Z])/g, " $1")}:
                  </span>{" "}
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <Badge className={`text-xs ${STATUS_COLORS[viewDoc.status]}`}>
                  {viewDoc.status}
                </Badge>
              </div>
              {viewDoc.linkedVoucherId && (
                <div>
                  <span className="text-muted-foreground">Linked Voucher:</span>{" "}
                  <span className="font-mono">{viewDoc.linkedVoucherId}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
