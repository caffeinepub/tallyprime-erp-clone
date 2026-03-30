import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState } from "react";

interface ServiceOrder {
  id: string;
  ticketId: string;
  customer: string;
  service: string;
  technician: string;
  priority: string;
  startDate: string;
  estimatedHours: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Open: "bg-blue-900 text-blue-300",
  "In Progress": "bg-orange-900 text-orange-300",
  Completed: "bg-green-900 text-green-300",
  Cancelled: "bg-red-900 text-red-300",
};

export default function ServiceRegister() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const allOrders: ServiceOrder[] = JSON.parse(
    localStorage.getItem("hk_service_orders") || "[]",
  );

  const filtered = allOrders.filter((o) => {
    const d = o.startDate;
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    return true;
  });

  const totalTickets = allOrders.length;
  const openTickets = allOrders.filter(
    (o) => o.status === "Open" || o.status === "In Progress",
  ).length;
  const completedTickets = allOrders.filter(
    (o) => o.status === "Completed",
  ).length;
  const totalHours = allOrders.reduce((s, o) => s + (o.estimatedHours || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-bold">Service Register</h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} records
          </p>
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-7 text-xs w-36"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-7 text-xs w-36"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="h-7 text-xs w-32"
              data-ocid="service-register.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All", "Open", "In Progress", "Completed", "Cancelled"].map(
                (s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setFrom("");
              setTo("");
              setStatusFilter("All");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Tickets",
            value: totalTickets,
            color: "text-foreground",
          },
          { label: "Open/Active", value: openTickets, color: "text-blue-400" },
          {
            label: "Completed",
            value: completedTickets,
            color: "text-green-400",
          },
          { label: "Total Hours", value: `${totalHours}h`, color: "text-teal" },
        ].map((row) => (
          <Card key={row.label} className="bg-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className={`text-xl font-bold ${row.color}`}>{row.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="service-register.empty_state"
            >
              No records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Ticket",
                      "Customer",
                      "Service",
                      "Technician",
                      "Start Date",
                      "Est. Hours",
                      "Status",
                    ].map((h) => (
                      <TableHead key={h} className="text-xs">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o, i) => (
                    <TableRow
                      key={o.id}
                      className="border-border text-xs"
                      data-ocid={`service-register.item.${i + 1}`}
                    >
                      <TableCell className="font-mono">{o.ticketId}</TableCell>
                      <TableCell className="font-medium">
                        {o.customer}
                      </TableCell>
                      <TableCell>{o.service}</TableCell>
                      <TableCell>{o.technician || "—"}</TableCell>
                      <TableCell>{o.startDate}</TableCell>
                      <TableCell>{o.estimatedHours}h</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status] || "bg-secondary text-muted-foreground"}`}
                        >
                          {o.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
