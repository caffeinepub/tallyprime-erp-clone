import { Check, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TemplateKey = "classic" | "modern" | "gst";

const TEMPLATES: {
  key: TemplateKey;
  name: string;
  description: string;
}[] = [
  {
    key: "classic",
    name: "Classic",
    description:
      "Simple border-based layout. Clean, professional look suitable for all business types.",
  },
  {
    key: "modern",
    name: "Modern",
    description:
      "Colored header with teal branding. Contemporary look for modern businesses.",
  },
  {
    key: "gst",
    name: "GST-Compliant",
    description:
      "Extra GST columns (Taxable Value, GST %, HSN/SAC). Designed for GST-registered businesses.",
  },
];

function ClassicPreview() {
  return (
    <div className="border border-gray-400 p-2 text-[7px] text-gray-800 bg-white h-28 overflow-hidden">
      <div className="font-bold text-[9px] border-b border-gray-400 pb-1 mb-1">
        Company Name
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-semibold">TAX INVOICE</span>
        <span>No: 001</span>
      </div>
      <div className="border border-gray-300 mt-1">
        <div className="flex bg-gray-100 px-1">
          <span className="flex-1">Particulars</span>
          <span>Amount</span>
        </div>
        <div className="flex px-1">
          <span className="flex-1">Sales A/c</span>
          <span>25,000</span>
        </div>
        <div className="flex px-1">
          <span className="flex-1">Cash</span>
          <span>25,000</span>
        </div>
      </div>
      <div className="flex justify-end mt-1 font-bold">
        <span>Total: ₹29,500</span>
      </div>
    </div>
  );
}

function ModernPreview() {
  return (
    <div className="bg-white h-28 overflow-hidden text-[7px] text-gray-800">
      <div className="bg-teal-600 text-white p-2">
        <div className="font-bold text-[9px]">Company Name</div>
        <div className="opacity-70">GSTIN: 29XXXXX1234</div>
      </div>
      <div className="p-2">
        <div className="flex justify-between mb-1">
          <span className="font-semibold text-teal-700">TAX INVOICE</span>
          <span>No: 001</span>
        </div>
        <div className="border border-gray-200">
          <div className="flex bg-teal-50 px-1">
            <span className="flex-1">Particulars</span>
            <span>Amount</span>
          </div>
          <div className="flex px-1">
            <span className="flex-1">Sales A/c</span>
            <span>25,000</span>
          </div>
        </div>
        <div className="flex justify-end mt-1 font-bold text-teal-700">
          <span>Total: ₹29,500</span>
        </div>
      </div>
    </div>
  );
}

function GSTPreview() {
  return (
    <div className="border border-gray-400 p-2 text-[7px] text-gray-800 bg-white h-28 overflow-hidden">
      <div className="font-bold text-[9px] border-b-2 border-gray-800 pb-1 mb-1">
        Company Name | GST TAX INVOICE
      </div>
      <div className="border border-gray-300">
        <div className="flex bg-gray-100 px-1">
          <span className="flex-1">Item</span>
          <span className="w-8">Taxable</span>
          <span className="w-6">GST%</span>
          <span className="w-8">CGST</span>
          <span className="w-8">SGST</span>
          <span className="w-8">Total</span>
        </div>
        <div className="flex px-1">
          <span className="flex-1">Sales</span>
          <span className="w-8">25000</span>
          <span className="w-6">18%</span>
          <span className="w-8">2250</span>
          <span className="w-8">2250</span>
          <span className="w-8">29500</span>
        </div>
      </div>
    </div>
  );
}

const PREVIEWS: Record<TemplateKey, React.FC> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  gst: GSTPreview,
};

export default function InvoiceTemplates() {
  const [selected, setSelected] = useState<TemplateKey>(
    () =>
      (localStorage.getItem("hk-invoice-template") as TemplateKey) ?? "classic",
  );

  const handleSelect = (key: TemplateKey) => {
    setSelected(key);
    localStorage.setItem("hk-invoice-template", key);
    toast.success(`Template "${key}" selected`);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-teal" />
          <span className="text-[15px] font-bold uppercase tracking-wide text-foreground">
            Invoice Templates
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Choose a template for invoice printing. The selected template will be
          applied when printing invoices from Voucher Entry.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 max-w-3xl">
          {TEMPLATES.map((tpl) => {
            const Preview = PREVIEWS[tpl.key];
            const isActive = selected === tpl.key;
            return (
              <div
                key={tpl.key}
                data-ocid={`template.${tpl.key}.card`}
                className={`border-2 transition-colors bg-card ${
                  isActive
                    ? "border-teal"
                    : "border-border hover:border-teal/40"
                }`}
              >
                {/* Mini Preview */}
                <div className="p-3 border-b border-border">
                  <Preview />
                </div>

                {/* Card Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-bold text-foreground">
                      {tpl.name}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] text-teal font-semibold">
                        <Check size={11} /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    {tpl.description}
                  </p>
                  <button
                    type="button"
                    data-ocid={`template.${tpl.key}.button`}
                    onClick={() => handleSelect(tpl.key)}
                    className={`w-full py-1.5 text-[11px] font-semibold transition-colors ${
                      isActive
                        ? "bg-teal text-primary-foreground cursor-default"
                        : "bg-secondary border border-border text-foreground hover:bg-teal/20 hover:border-teal"
                    }`}
                  >
                    {isActive ? "Selected" : "Select Template"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
