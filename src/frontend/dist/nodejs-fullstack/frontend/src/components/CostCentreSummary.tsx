import { Loader2 } from "lucide-react";
import type { Company } from "../backend.d";
import { useGetCostCentreSummary } from "../hooks/useQueries";

interface Props {
  company: Company;
}

export default function CostCentreSummary({ company }: Props) {
  const { data: summary = [], isLoading } = useGetCostCentreSummary(company.id);
  const grandTotal = summary.reduce((s, e) => s + e.totalAllocated, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-foreground">
          Cost Centre Summary
        </h2>
        <p className="text-[10px] text-muted-foreground">{company.name}</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div
            className="flex justify-center py-10"
            data-ocid="costcentresummary.loading_state"
          >
            <Loader2 size={18} className="animate-spin text-teal" />
          </div>
        )}
        {!isLoading && summary.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="costcentresummary.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              No cost allocation data found.
            </p>
          </div>
        )}
        {!isLoading && summary.length > 0 && (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                <th className="tally-key-badge text-left px-2 py-1.5 font-semibold border border-border/40">
                  #
                </th>
                <th className="tally-key-badge text-left px-2 py-1.5 font-semibold border border-border/40">
                  Centre Name
                </th>
                <th className="tally-key-badge text-right px-2 py-1.5 font-semibold border border-border/40">
                  Total Allocated (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.map((e, i) => (
                <tr
                  key={e.centreId.toString()}
                  data-ocid={`costcentresummary.item.${i + 1}`}
                  className="border-b border-border/30 hover:bg-secondary/30"
                >
                  <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-2 py-1.5 text-foreground font-medium">
                    {e.centreName}
                  </td>
                  <td className="px-2 py-1.5 text-right text-teal">
                    ₹
                    {e.totalAllocated.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/50 font-semibold border-t-2 border-border">
                <td className="px-2 py-1.5" colSpan={2}>
                  Grand Total
                </td>
                <td className="px-2 py-1.5 text-right text-teal">
                  ₹
                  {grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
