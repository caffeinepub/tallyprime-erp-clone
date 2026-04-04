import { Printer, X } from "lucide-react";
import { useEffect } from "react";
import type { Company } from "../backend.d";

interface InvoicePrintProps {
  company: Company;
  voucherType: string;
  entries: { ledgerName: string; entryType: string; amount: number }[];
  voucherDate: string;
  voucherNumber: string;
  onClose: () => void;
}

export default function InvoicePrint({
  company,
  voucherType,
  entries,
  voucherDate,
  voucherNumber,
  onClose,
}: InvoicePrintProps) {
  const template =
    (localStorage.getItem("hk-invoice-template") as
      | "classic"
      | "modern"
      | "gst") ?? "classic";

  const invoiceTitle =
    voucherType === "Sales"
      ? "Tax Invoice"
      : voucherType === "Purchase"
        ? "Purchase Invoice"
        : `${voucherType} Voucher`;

  const drEntries = entries.filter((e) => e.entryType === "Dr");
  const crEntries = entries.filter((e) => e.entryType === "Cr");
  const subtotal = entries.reduce((s, e) => s + e.amount, 0) / 2;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const igst = 0;
  const total = subtotal + cgst + sgst + igst;

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-area { position: fixed; inset: 0; z-index: 9999; background: white; }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/60 no-print" />

      {/* Invoice Container */}
      <div className="print-area fixed inset-0 z-50 flex items-center justify-center p-8">
        <div
          className="bg-white text-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Actions Bar - no print */}
          <div className="no-print flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-600">
              Invoice Preview — {template.toUpperCase()} template
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="invoice.print.button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-600 text-white hover:bg-teal-700 rounded transition-colors"
              >
                <Printer size={14} /> Print
              </button>
              <button
                type="button"
                data-ocid="invoice.close.button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded transition-colors"
              >
                <X size={14} /> Close
              </button>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-8">
            {/* Header */}
            {template === "modern" ? (
              <div className="mb-6 p-4 bg-teal-600 text-white rounded">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-sm opacity-80 mt-1">
                  {(company as any).address || ""}
                </p>
                <p className="text-sm opacity-80">
                  GSTIN: {(company as any).gstin || "N/A"}
                </p>
              </div>
            ) : (
              <div className="mb-6 border-b-2 border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {(company as any).address || ""}
                </p>
                <p className="text-sm text-gray-600">
                  GSTIN: {(company as any).gstin || "N/A"}
                </p>
              </div>
            )}

            {/* Invoice Title & Meta */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {invoiceTitle}
                </h2>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>
                  <span className="font-semibold">Invoice No: </span>
                  {voucherNumber}
                </div>
                <div>
                  <span className="font-semibold">Date: </span>
                  {new Date(voucherDate).toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table
              className="w-full border-collapse text-sm mb-6"
              style={{ border: "1px solid #d1d5db" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th
                    className="text-left px-3 py-2 font-semibold"
                    style={{ border: "1px solid #d1d5db" }}
                  >
                    #
                  </th>
                  <th
                    className="text-left px-3 py-2 font-semibold"
                    style={{ border: "1px solid #d1d5db" }}
                  >
                    Particulars
                  </th>
                  <th
                    className="text-center px-3 py-2 font-semibold"
                    style={{ border: "1px solid #d1d5db" }}
                  >
                    Dr/Cr
                  </th>
                  {template === "gst" && (
                    <>
                      <th
                        className="text-right px-3 py-2 font-semibold"
                        style={{ border: "1px solid #d1d5db" }}
                      >
                        Taxable
                      </th>
                      <th
                        className="text-right px-3 py-2 font-semibold"
                        style={{ border: "1px solid #d1d5db" }}
                      >
                        GST%
                      </th>
                    </>
                  )}
                  <th
                    className="text-right px-3 py-2 font-semibold"
                    style={{ border: "1px solid #d1d5db" }}
                  >
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...drEntries, ...crEntries].map((e, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: invoice rows by position
                  <tr key={i}>
                    <td
                      className="px-3 py-2 text-center"
                      style={{ border: "1px solid #d1d5db" }}
                    >
                      {i + 1}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ border: "1px solid #d1d5db" }}
                    >
                      {e.ledgerName}
                    </td>
                    <td
                      className="px-3 py-2 text-center"
                      style={{ border: "1px solid #d1d5db" }}
                    >
                      {e.entryType}
                    </td>
                    {template === "gst" && (
                      <>
                        <td
                          className="px-3 py-2 text-right"
                          style={{ border: "1px solid #d1d5db" }}
                        >
                          {fmt(e.amount)}
                        </td>
                        <td
                          className="px-3 py-2 text-right"
                          style={{ border: "1px solid #d1d5db" }}
                        >
                          18%
                        </td>
                      </>
                    )}
                    <td
                      className="px-3 py-2 text-right font-mono"
                      style={{ border: "1px solid #d1d5db" }}
                    >
                      {fmt(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GST Summary */}
            <div className="flex justify-end">
              <table className="text-sm w-64">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-600">Subtotal</td>
                    <td className="py-1 text-right font-mono">
                      {fmt(subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">CGST (9%)</td>
                    <td className="py-1 text-right font-mono">{fmt(cgst)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">SGST (9%)</td>
                    <td className="py-1 text-right font-mono">{fmt(sgst)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">IGST (0%)</td>
                    <td className="py-1 text-right font-mono">{fmt(igst)}</td>
                  </tr>
                  <tr
                    style={{
                      borderTop: "2px solid #374151",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    <td className="pt-2 text-gray-900">Total</td>
                    <td className="pt-2 text-right font-mono text-gray-900">
                      ₹{fmt(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              This is a computer-generated document. No signature required.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
