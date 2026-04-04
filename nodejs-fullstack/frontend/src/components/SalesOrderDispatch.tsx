import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import type { SalesOrder } from "./SalesOrderEntry";

const LS_KEY = "hk-sales-orders";
const DISPATCH_KEY = "hk-so-dispatches";

function loadSOs(): SalesOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveSOs(sos: SalesOrder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sos));
}

interface DispatchRecord {
  id: string;
  soId: string;
  soNumber: string;
  dispatchDate: string;
  dispatchedQtys: Record<number, number>;
  companyName: string;
  createdAt: string;
}

export default function SalesOrderDispatch({ company }: { company: Company }) {
  const today = new Date().toISOString().slice(0, 10);
  const confirmedSOs = loadSOs().filter(
    (s) => s.companyName === company.name && s.status === "Confirmed",
  );
  const [selectedSOId, setSelectedSOId] = useState<string>("");
  const [dispatchDate, setDispatchDate] = useState(today);
  const [dispatchedQtys, setDispatchedQtys] = useState<Record<number, number>>(
    {},
  );

  const selectedSO = confirmedSOs.find((s) => s.id === selectedSOId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedSOId(id);
    const so = confirmedSOs.find((s) => s.id === id);
    if (so) {
      const defaults: Record<number, number> = {};
      so.lineItems.forEach((l, i) => {
        defaults[i] = l.qty;
      });
      setDispatchedQtys(defaults);
    }
  };

  const handleSubmit = () => {
    if (!selectedSO) {
      toast.error("Select a confirmed SO first");
      return;
    }
    const record: DispatchRecord = {
      id: Date.now().toString(),
      soId: selectedSO.id,
      soNumber: selectedSO.soNumber,
      dispatchDate,
      dispatchedQtys,
      companyName: company.name,
      createdAt: new Date().toISOString(),
    };
    const dispatches: DispatchRecord[] = JSON.parse(
      localStorage.getItem(DISPATCH_KEY) ?? "[]",
    );
    localStorage.setItem(DISPATCH_KEY, JSON.stringify([...dispatches, record]));
    saveSOs(
      loadSOs().map((s) =>
        s.id === selectedSO.id ? { ...s, status: "Dispatched" } : s,
      ),
    );
    toast.success(`SO ${selectedSO.soNumber} marked as Dispatched!`);
    setSelectedSOId("");
    setDispatchedQtys({});
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 bg-background"
      data-ocid="so_dispatch.page"
    >
      <div className="max-w-3xl mx-auto">
        <div className="tally-section-header mb-4">
          SO Dispatch — {company.name}
        </div>

        {confirmedSOs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            data-ocid="so_dispatch.empty_state"
          >
            <span className="text-4xl mb-3">🚚</span>
            <div className="text-[13px]">No confirmed sales orders</div>
            <div className="text-[11px] mt-1">
              Confirm an SO in the SO List first
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label className="text-[11px] text-muted-foreground">
                  Select Confirmed SO
                </Label>
                <select
                  value={selectedSOId}
                  onChange={(e) => handleSelect(e.target.value)}
                  className="w-full h-8 text-[12px] border border-input bg-background px-2 text-foreground"
                  data-ocid="so_dispatch.select"
                >
                  <option value="">-- Choose SO --</option>
                  {confirmedSOs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.soNumber} — {s.customerName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">
                  Dispatch Date
                </Label>
                <Input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="h-8 text-[12px]"
                  data-ocid="so_dispatch.input"
                />
              </div>
            </div>

            {selectedSO && (
              <div className="border border-border mb-4">
                <div className="bg-secondary/60 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase border-b border-border">
                  Line Items — Dispatch Quantities
                </div>
                {selectedSO.lineItems.map((l, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: line items ordered by position
                    key={i}
                    className="grid grid-cols-4 border-b border-border/50 px-3 py-2 items-center"
                    data-ocid={`so_dispatch.row.${i + 1}`}
                  >
                    <div className="col-span-2 text-[12px]">{l.itemName}</div>
                    <div className="text-[11px] text-muted-foreground text-right">
                      Ordered: {l.qty}
                    </div>
                    <div className="pl-2">
                      <Input
                        type="number"
                        value={dispatchedQtys[i] ?? l.qty}
                        onChange={(e) =>
                          setDispatchedQtys((prev) => ({
                            ...prev,
                            [i]: Number(e.target.value),
                          }))
                        }
                        max={l.qty}
                        className="h-7 text-[11px] text-right"
                        data-ocid="so_dispatch.input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-teal hover:bg-teal/90 text-primary-foreground text-[12px] h-8"
                data-ocid="so_dispatch.submit_button"
              >
                Mark as Dispatched
              </Button>
              <Button
                variant="outline"
                className="text-[12px] h-8"
                onClick={() => setSelectedSOId("")}
                data-ocid="so_dispatch.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
