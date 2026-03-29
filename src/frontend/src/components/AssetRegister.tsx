import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import {
  useGetAllFixedAssets,
  useGetDepreciationHistory,
} from "../hooks/useQueries";

const timeToDate = (t: bigint) =>
  new Date(Number(t / 1000000n)).toISOString().split("T")[0];

interface Props {
  company: Company;
}

function DepreciationHistory({ assetId }: { assetId: bigint }) {
  const { data: entries = [], isLoading } = useGetDepreciationHistory(assetId);
  if (isLoading)
    return (
      <tr>
        <td colSpan={11} className="px-4 py-2 text-center">
          <Loader2 size={14} className="animate-spin text-teal inline" />
        </td>
      </tr>
    );
  return (
    <>
      {entries.map((e) => (
        <tr key={e.id.toString()} className="bg-secondary/20">
          <td
            colSpan={3}
            className="px-4 py-1 text-[10px] text-muted-foreground italic"
          />
          <td className="px-2 py-1 text-[10px] text-muted-foreground">
            {timeToDate(e.date)}
          </td>
          <td
            colSpan={2}
            className="px-2 py-1 text-[10px] text-muted-foreground"
          >
            {e.narration}
          </td>
          <td className="px-2 py-1 text-[10px] text-right text-amber-500">
            ₹{e.amount.toLocaleString("en-IN")}
          </td>
          <td colSpan={4} />
        </tr>
      ))}
      {entries.length === 0 && (
        <tr className="bg-secondary/20">
          <td
            colSpan={11}
            className="px-4 py-1 text-[10px] text-muted-foreground italic"
          >
            No depreciation entries recorded.
          </td>
        </tr>
      )}
    </>
  );
}

export default function AssetRegister({ company }: Props) {
  const { data: assets = [], isLoading } = useGetAllFixedAssets(company.id);
  const [expandedId, setExpandedId] = useState<bigint | null>(null);

  const totalCost = assets.reduce((s, a) => s + a.cost, 0);
  const totalSalvage = assets.reduce((s, a) => s + a.salvageValue, 0);
  const totalAccumDep = assets.reduce(
    (s, a) => s + a.accumulatedDepreciation,
    0,
  );
  const totalBookValue = assets.reduce(
    (s, a) => s + Math.max(0, a.cost - a.accumulatedDepreciation),
    0,
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-foreground">
          Asset Register
        </h2>
        <p className="text-[10px] text-muted-foreground">
          {company.name} — All Fixed Assets
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div
            className="flex justify-center py-10"
            data-ocid="assetregister.loading_state"
          >
            <Loader2 size={18} className="animate-spin text-teal" />
          </div>
        )}

        {!isLoading && assets.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="assetregister.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              No assets found. Add assets via Fixed Asset Master.
            </p>
          </div>
        )}

        {!isLoading && assets.length > 0 && (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                {[
                  "Asset Name",
                  "Category",
                  "Purchase Date",
                  "Cost",
                  "Salvage Val.",
                  "Life (Yrs)",
                  "Method",
                  "Accum. Dep.",
                  "Book Value",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="tally-key-badge text-left px-2 py-1.5 font-semibold border border-border/40 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((a, i) => (
                <>
                  <tr
                    key={a.id.toString()}
                    data-ocid={`assetregister.item.${i + 1}`}
                    className="border-b border-border/30 hover:bg-secondary/30"
                  >
                    <td className="px-2 py-1.5 font-medium text-foreground">
                      {a.name}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {a.category}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {timeToDate(a.purchaseDate)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      ₹{a.cost.toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      ₹{a.salvageValue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {a.usefulLifeYears.toString()}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {a.depreciationMethod}
                    </td>
                    <td className="px-2 py-1.5 text-right text-amber-500">
                      ₹{a.accumulatedDepreciation.toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-1.5 text-right text-teal font-semibold">
                      ₹
                      {Math.max(
                        0,
                        a.cost - a.accumulatedDepreciation,
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] rounded-sm ${a.isDisposed ? "bg-destructive/20 text-destructive" : "bg-teal/20 text-teal"}`}
                      >
                        {a.isDisposed ? "Disposed" : "Active"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        type="button"
                        data-ocid={`assetregister.secondary_button.${i + 1}`}
                        onClick={() =>
                          setExpandedId(expandedId === a.id ? null : a.id)
                        }
                        className="cmd-btn flex items-center gap-0.5"
                      >
                        {expandedId === a.id ? (
                          <ChevronDown size={10} />
                        ) : (
                          <ChevronRight size={10} />
                        )}
                        History
                      </button>
                    </td>
                  </tr>
                  {expandedId === a.id && (
                    <DepreciationHistory assetId={a.id} />
                  )}
                </>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/50 font-semibold border-t-2 border-border">
                <td className="px-2 py-1.5" colSpan={3}>
                  Totals
                </td>
                <td className="px-2 py-1.5 text-right">
                  ₹{totalCost.toLocaleString("en-IN")}
                </td>
                <td className="px-2 py-1.5 text-right">
                  ₹{totalSalvage.toLocaleString("en-IN")}
                </td>
                <td colSpan={2} />
                <td className="px-2 py-1.5 text-right text-amber-500">
                  ₹{totalAccumDep.toLocaleString("en-IN")}
                </td>
                <td className="px-2 py-1.5 text-right text-teal">
                  ₹{totalBookValue.toLocaleString("en-IN")}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
