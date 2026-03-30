import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";

interface ServiceOrder {
  id: string;
  ticketId: string;
  customer: string;
  service: string;
  technician: string;
  priority: string;
  startDate: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["Open", "In Progress", "Completed", "Cancelled"];
const statusColors: Record<string, string> = {
  Open: "bg-blue-900 text-blue-300",
  "In Progress": "bg-orange-900 text-orange-300",
  Completed: "bg-green-900 text-green-300",
  Cancelled: "bg-red-900 text-red-300",
};
const priorityColors: Record<string, string> = {
  Low: "text-muted-foreground",
  Medium: "text-blue-400",
  High: "text-orange-400",
  Urgent: "text-red-400",
};

export default function ServiceTickets() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [orders, setOrders] = useState<ServiceOrder[]>(() =>
    JSON.parse(localStorage.getItem("hk_service_orders") || "[]"),
  );

  const changeStatus = (id: string, newStatus: string) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o,
    );
    setOrders(updated);
    localStorage.setItem("hk_service_orders", JSON.stringify(updated));
    toast.success(`Ticket updated to ${newStatus}`);
  };

  const filtered =
    filterStatus === "All"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const counts: Record<string, number> = {};
  for (const s of STATUS_OPTIONS) {
    counts[s] = orders.filter((o) => o.status === s).length;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Service Tickets</h2>
        <p className="text-xs text-muted-foreground">
          {orders.length} total tickets
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...STATUS_OPTIONS].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filterStatus === s
                ? "border-teal bg-teal/10 text-teal font-medium"
                : "border-border text-muted-foreground"
            }`}
            data-ocid="service-tickets.tab"
          >
            {s}{" "}
            {s !== "All" && counts[s] !== undefined
              ? `(${counts[s]})`
              : s === "All"
                ? `(${orders.length})`
                : ""}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map((s) => (
          <Card key={s} className="bg-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s}</p>
              <p
                className={`text-xl font-bold ${statusColors[s].split(" ")[1]}`}
              >
                {counts[s] || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="service-tickets.empty_state"
            >
              No tickets found.
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
                      "Priority",
                      "Created",
                      "Status",
                      "Change Status",
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
                      data-ocid={`service-tickets.item.${i + 1}`}
                    >
                      <TableCell className="font-mono">{o.ticketId}</TableCell>
                      <TableCell className="font-medium">
                        {o.customer}
                      </TableCell>
                      <TableCell>{o.service}</TableCell>
                      <TableCell>{o.technician || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${priorityColors[o.priority]}`}
                        >
                          {o.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={o.status}
                          onValueChange={(v) => changeStatus(o.id, v)}
                        >
                          <SelectTrigger
                            className="h-6 text-xs w-28"
                            data-ocid="service-tickets.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
