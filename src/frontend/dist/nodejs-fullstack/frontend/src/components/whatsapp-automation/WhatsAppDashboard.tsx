import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, MessageCircle, XCircle } from "lucide-react";

const ACTIVITY = [
  {
    id: 1,
    msg: "Invoice #INV-2301 sent to Rahul Sharma",
    time: "10:32 AM",
    status: "Sent",
  },
  {
    id: 2,
    msg: "Payment reminder to Meera Textiles",
    time: "09:15 AM",
    status: "Sent",
  },
  {
    id: 3,
    msg: "Ledger summary to Patel Stores",
    time: "08:50 AM",
    status: "Failed",
  },
  {
    id: 4,
    msg: "Invoice #INV-2300 sent to Om Traders",
    time: "Yesterday",
    status: "Sent",
  },
  {
    id: 5,
    msg: "Bulk reminder to 5 customers",
    time: "Yesterday",
    status: "Sent",
  },
];

export default function WhatsAppDashboard() {
  return (
    <div className="p-4 space-y-4" data-ocid="whatsapp.dashboard.section">
      <h2 className="text-sm font-bold text-foreground">
        WhatsApp Automation Dashboard
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Sent Today",
            value: 12,
            icon: CheckCircle,
            color: "text-green-500",
          },
          { label: "Pending", value: 3, icon: Clock, color: "text-yellow-500" },
          { label: "Failed", value: 1, icon: XCircle, color: "text-red-500" },
          {
            label: "This Month",
            value: 148,
            icon: MessageCircle,
            color: "text-teal",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <stat.icon size={16} className={stat.color} />
                <div>
                  <div className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {stat.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-foreground">
          Recent Activity
        </h3>
        {ACTIVITY.map((a) => (
          <div
            key={a.id}
            data-ocid={`whatsapp.activity.item.${a.id}`}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${a.status === "Sent" ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-xs">{a.msg}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {a.time}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.status === "Sent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
              >
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
