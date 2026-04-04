import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Branch {
  id: string;
  name: string;
}

function loadBranches(): Branch[] {
  return JSON.parse(localStorage.getItem("hk_branches") || "[]");
}

function getBranchData(branchName: string) {
  const seed = branchName.charCodeAt(0) + branchName.length;
  const revenue = 500000 + seed * 2000;
  const expenses = 300000 + seed * 1000;
  const profit = revenue - expenses;
  const stockItems = [
    {
      name: "Rice (5kg)",
      qty: 80 + (seed % 50),
      value: (80 + (seed % 50)) * 350,
    },
    {
      name: "Cooking Oil (1L)",
      qty: 120 + (seed % 30),
      value: (120 + (seed % 30)) * 150,
    },
    {
      name: "Sugar (1kg)",
      qty: 200 + (seed % 40),
      value: (200 + (seed % 40)) * 45,
    },
  ];
  return {
    revenue,
    expenses,
    profit,
    margin: ((profit / revenue) * 100).toFixed(1),
    stockItems,
  };
}

export default function BranchReports() {
  const branches = loadBranches();
  const [selected, setSelected] = useState("");
  const data = selected ? getBranchData(selected) : null;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Branch Reports</h2>
        <p className="text-xs text-muted-foreground">
          Branch-wise P&L and Stock Summary
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger
            className="h-8 text-xs w-52"
            data-ocid="branch-reports.select"
          >
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.length === 0 && (
              <SelectItem value="__none" disabled className="text-xs">
                No branches created
              </SelectItem>
            )}
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.name} className="text-xs">
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selected && (
        <div
          className="p-8 text-center text-muted-foreground text-sm"
          data-ocid="branch-reports.empty_state"
        >
          Select a branch to view its report.
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">
                P&L Summary — {selected}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="text-green-400 font-medium">
                  ₹{data.revenue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expenses</span>
                <span className="text-red-400 font-medium">
                  ₹{data.expenses.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                <span>Net Profit</span>
                <span
                  className={
                    data.profit >= 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  ₹{data.profit.toLocaleString("en-IN")} ({data.margin}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">
                Stock Summary — {selected}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {data.stockItems.map((it) => (
                <div key={it.name} className="flex justify-between text-xs">
                  <span>{it.name}</span>
                  <span className="text-muted-foreground">{it.qty} units</span>
                  <span className="font-medium">
                    ₹{it.value.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
