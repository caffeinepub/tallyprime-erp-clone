import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
}
interface ServiceOrder {
  id: string;
  ticketId: string;
  customer: string;
  phone: string;
  service: string;
  description: string;
  technician: string;
  priority: string;
  estimatedHours: number;
  startDate: string;
  status: string;
  createdAt: string;
}

function loadServices(): Service[] {
  return JSON.parse(localStorage.getItem("hk_services") || "[]");
}
function loadOrders(): ServiceOrder[] {
  return JSON.parse(localStorage.getItem("hk_service_orders") || "[]");
}

let ticketCounter = Number.parseInt(
  localStorage.getItem("hk_service_ticket_counter") || "1000",
  10,
);

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const priorityColors: Record<string, string> = {
  Low: "bg-secondary text-muted-foreground",
  Medium: "bg-blue-900 text-blue-300",
  High: "bg-orange-900 text-orange-300",
  Urgent: "bg-red-900 text-red-300",
};

export default function ServiceOrders() {
  const services = loadServices();
  const [orders, setOrders] = useState<ServiceOrder[]>(loadOrders);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    service: "",
    description: "",
    technician: "",
    priority: "Medium",
    estimatedHours: "",
    startDate: new Date().toISOString().slice(0, 10),
  });

  const save = () => {
    if (!form.customer.trim() || !form.service) {
      toast.error("Customer and service are required");
      return;
    }
    ticketCounter += 1;
    localStorage.setItem("hk_service_ticket_counter", String(ticketCounter));
    const o: ServiceOrder = {
      ...form,
      estimatedHours: Number.parseFloat(form.estimatedHours) || 0,
      id: Date.now().toString(),
      ticketId: `SRV-${ticketCounter}`,
      status: "Open",
      createdAt: new Date().toISOString(),
    };
    const updated = [o, ...orders];
    setOrders(updated);
    localStorage.setItem("hk_service_orders", JSON.stringify(updated));
    toast.success(`Service order ${o.ticketId} created`);
    setForm({
      customer: "",
      phone: "",
      service: "",
      description: "",
      technician: "",
      priority: "Medium",
      estimatedHours: "",
      startDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Service Orders</h2>
          <p className="text-xs text-muted-foreground">
            {orders.filter((o) => o.status === "Open").length} open orders
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
          onClick={() => setShowForm(!showForm)}
          data-ocid="service-orders.open_modal_button"
        >
          <Plus size={12} className="mr-1" />
          {showForm ? "Cancel" : "New Order"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Create Service Job Card</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Customer Name *</Label>
                <Input
                  value={form.customer}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customer: e.target.value }))
                  }
                  className="h-8 text-xs"
                  data-ocid="service-orders.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Service Type *</Label>
                <Select
                  value={form.service}
                  onValueChange={(v) => setForm((p) => ({ ...p, service: v }))}
                >
                  <SelectTrigger
                    className="h-8 text-xs"
                    data-ocid="service-orders.select"
                  >
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.length === 0 && (
                      <SelectItem value="__none" disabled className="text-xs">
                        No services — create in Service Master
                      </SelectItem>
                    )}
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.name} className="text-xs">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assigned Technician</Label>
                <Input
                  value={form.technician}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, technician: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Estimated Hours</Label>
                <Input
                  type="number"
                  value={form.estimatedHours}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, estimatedHours: e.target.value }))
                  }
                  className="h-8 text-xs"
                  placeholder="2"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={save}
                className="h-8 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
                data-ocid="service-orders.submit_button"
              >
                Create Job Card
              </Button>
              <Button
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setShowForm(false)}
                data-ocid="service-orders.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="service-orders.empty_state"
            >
              No service orders yet.
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
                      "Start Date",
                      "Status",
                    ].map((h) => (
                      <TableHead key={h} className="text-xs">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o, i) => (
                    <TableRow
                      key={o.id}
                      className="border-border text-xs"
                      data-ocid={`service-orders.item.${i + 1}`}
                    >
                      <TableCell className="font-mono">{o.ticketId}</TableCell>
                      <TableCell className="font-medium">
                        {o.customer}
                      </TableCell>
                      <TableCell>{o.service}</TableCell>
                      <TableCell>{o.technician || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityColors[o.priority]}`}
                        >
                          {o.priority}
                        </span>
                      </TableCell>
                      <TableCell>{o.startDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-900 text-blue-300 text-xs">
                          Open
                        </Badge>
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
