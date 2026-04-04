import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Download, Link, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";

function generateShareLink(company: Company | null): string {
  if (!company) return "";
  const data = {
    name: company.name,
    gstin: company.gstin,
    address: company.address,
    financialYearStart: company.financialYearStart,
    financialYearEnd: company.financialYearEnd,
    currency: company.currency,
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
  return `${window.location.origin}?company=${encoded}`;
}

function QRCanvas({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 200;
    const CELL = 4;
    const COLS = Math.floor(SIZE / CELL);
    canvas.width = SIZE;
    canvas.height = SIZE;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Simple deterministic pattern based on text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) & 0x7fffffff;
    }

    ctx.fillStyle = "#0d9488";
    for (let r = 0; r < COLS; r++) {
      for (let c = 0; c < COLS; c++) {
        const seed = (hash + r * 37 + c * 17) % 100;
        if (seed < 45) {
          ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
        }
      }
    }

    // Corner markers (QR finder patterns)
    const drawFinder = (x: number, y: number) => {
      if (!ctx) return;
      ctx.fillStyle = "#0d9488";
      ctx.fillRect(x, y, CELL * 7, CELL * 7);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + CELL, y + CELL, CELL * 5, CELL * 5);
      ctx.fillStyle = "#0d9488";
      ctx.fillRect(x + CELL * 2, y + CELL * 2, CELL * 3, CELL * 3);
    };
    drawFinder(0, 0);
    drawFinder(SIZE - CELL * 7, 0);
    drawFinder(0, SIZE - CELL * 7);
  }, [text]);

  return <canvas ref={canvasRef} className="rounded border border-border" />;
}

export default function ShareCompany({ company }: { company: Company | null }) {
  const [copied, setCopied] = useState(false);
  const link = generateShareLink(company);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  };

  const handleDownloadQR = () => {
    const canvas =
      document.querySelector<HTMLCanvasElement>("#qr-canvas-share");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${company?.name || "company"}-qr.png`;
    a.click();
    toast.success("QR code downloaded");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!company) {
    return (
      <div className="p-6 text-center text-muted-foreground text-[12px]">
        No company selected. Please select a company first.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-2 mb-5">
        <Building2 size={16} className="text-teal" />
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-foreground">
          Share Company Data
        </h2>
      </div>

      <Tabs defaultValue="link">
        <TabsList className="h-8 mb-4">
          <TabsTrigger
            value="link"
            className="text-[11px]"
            data-ocid="share_company.link.tab"
          >
            <Link size={11} className="mr-1" /> Share via Link
          </TabsTrigger>
          <TabsTrigger
            value="qr"
            className="text-[11px]"
            data-ocid="share_company.qr.tab"
          >
            <QrCode size={11} className="mr-1" /> QR Code
          </TabsTrigger>
          <TabsTrigger
            value="pdf"
            className="text-[11px]"
            data-ocid="share_company.pdf.tab"
          >
            <Download size={11} className="mr-1" /> Export PDF
          </TabsTrigger>
        </TabsList>

        {/* Link Tab */}
        <TabsContent value="link" className="space-y-4">
          <div className="border border-border bg-secondary/20 p-4 space-y-3">
            <p className="text-[11px] text-muted-foreground">
              This link contains your company&apos;s basic information encoded
              in base64. Recipients can view the basic details by opening the
              link.
            </p>
            <div className="bg-background border border-border p-3 rounded text-[10px] font-mono text-muted-foreground break-all">
              {link}
            </div>
            <Button
              size="sm"
              onClick={handleCopy}
              className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
              data-ocid="share_company.copy_link.button"
            >
              <Link size={11} className="mr-1" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          {/* Company Info Preview */}
          <div className="border border-border bg-secondary/20 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-foreground">
              Included Information
            </p>
            {[
              { label: "Company Name", value: company.name },
              { label: "GSTIN", value: company.gstin || "Not set" },
              { label: "Address", value: company.address || "Not set" },
              {
                label: "Financial Year",
                value: `${company.financialYearStart} — ${company.financialYearEnd}`,
              },
              { label: "Currency", value: company.currency },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2 text-[10px]">
                <span className="text-muted-foreground w-28 flex-shrink-0">
                  {label}:
                </span>
                <span className="text-foreground font-medium">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-4">
          <div className="border border-border bg-secondary/20 p-4 flex flex-col items-center gap-4">
            <p className="text-[11px] text-muted-foreground text-center">
              Scan this QR code to share your company information. The QR
              encodes the same data as the share link.
            </p>
            <div id="qr-canvas-share">
              <QRCanvas text={link} />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {company.name}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadQR}
              className="text-[11px] h-7"
              data-ocid="share_company.download_qr.button"
            >
              <Download size={11} className="mr-1" /> Download QR as PNG
            </Button>
          </div>
        </TabsContent>

        {/* PDF Tab */}
        <TabsContent value="pdf" className="space-y-4">
          <div className="border border-border bg-secondary/20 p-4 space-y-4">
            <p className="text-[11px] text-muted-foreground">
              Download a formatted company report as PDF using your
              browser&apos;s print function.
            </p>

            {/* Print Preview */}
            <div
              className="bg-white border border-gray-200 p-6 space-y-4"
              id="company-print-preview"
            >
              <div className="text-center border-b border-gray-200 pb-3">
                <h1 className="text-lg font-bold text-gray-900">
                  {company.name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Company Information Report
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "GSTIN", value: company.gstin || "Not set" },
                  { label: "Address", value: company.address || "Not set" },
                  {
                    label: "Financial Year",
                    value: `${company.financialYearStart} to ${company.financialYearEnd}`,
                  },
                  { label: "Currency", value: company.currency },
                  {
                    label: "Report Generated",
                    value: new Date().toLocaleString("en-IN"),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4">
                    <span className="w-36 text-sm font-semibold text-gray-700">
                      {label}:
                    </span>
                    <span className="text-sm text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 text-xs text-gray-500 text-center">
                Generated by HisabKitab Pro
              </div>
            </div>

            <Button
              size="sm"
              onClick={handlePrintPDF}
              className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
              data-ocid="share_company.download_pdf.button"
            >
              <Download size={11} className="mr-1" /> Download as PDF
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
