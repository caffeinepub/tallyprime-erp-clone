import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  status: string;
  notes: string;
  followUpDate: string;
  createdAt: string;
}

const LEADS_KEY = "hk_leads";

export function loadLeads(): Lead[] {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

const SOURCES = ["Direct", "Reference", "Online", "Exhibition"];
const STATUSES = ["New", "Follow-up", "Qualified", "Won", "Lost"];

interface LeadMasterProps {
  editLead?: Lead | null;
  onSaved?: () => void;
}

export default function LeadMaster({ editLead, onSaved }: LeadMasterProps) {
  const [form, setForm] = useState({
    name: editLead?.name ?? "",
    phone: editLead?.phone ?? "",
    email: editLead?.email ?? "",
    company: editLead?.company ?? "",
    source: editLead?.source ?? "Direct",
    status: editLead?.status ?? "New",
    notes: editLead?.notes ?? "",
    followUpDate: editLead?.followUpDate ?? "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    const leads = loadLeads();
    if (editLead) {
      const updated = leads.map((l) =>
        l.id === editLead.id ? { ...editLead, ...form } : l,
      );
      saveLeads(updated);
      toast.success("Lead updated");
    } else {
      const newLead: Lead = {
        id: `lead_${Date.now()}`,
        ...form,
        createdAt: new Date().toLocaleDateString("en-IN"),
      };
      saveLeads([newLead, ...leads]);
      toast.success(`Lead created: ${form.name}`);
      setForm({
        name: "",
        phone: "",
        email: "",
        company: "",
        source: "Direct",
        status: "New",
        notes: "",
        followUpDate: "",
      });
    }
    onSaved?.();
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">
          {editLead ? "Edit Lead" : "Create Lead"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Full Name *
            </Label>
            <Input
              data-ocid="lead.name.input"
              className="h-8 text-[12px] mt-1"
              placeholder="Rajesh Kumar"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Phone *</Label>
            <Input
              data-ocid="lead.phone.input"
              className="h-8 text-[12px] mt-1"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Email</Label>
            <Input
              data-ocid="lead.email.input"
              type="email"
              className="h-8 text-[12px] mt-1"
              placeholder="rajesh@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Company</Label>
            <Input
              data-ocid="lead.company.input"
              className="h-8 text-[12px] mt-1"
              placeholder="ABC Pvt Ltd"
              value={form.company}
              onChange={(e) => handleChange("company", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Source</Label>
            <Select
              value={form.source}
              onValueChange={(v) => handleChange("source", v)}
            >
              <SelectTrigger
                data-ocid="lead.source.select"
                className="h-8 text-[12px] mt-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[12px]">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => handleChange("status", v)}
            >
              <SelectTrigger
                data-ocid="lead.status.select"
                className="h-8 text-[12px] mt-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[12px]">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Next Follow-up Date
            </Label>
            <Input
              data-ocid="lead.followup_date.input"
              type="date"
              className="h-8 text-[12px] mt-1"
              value={form.followUpDate}
              onChange={(e) => handleChange("followUpDate", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Notes</Label>
          <Textarea
            data-ocid="lead.notes.textarea"
            className="text-[12px] mt-1 min-h-[80px]"
            placeholder="Follow-up details, requirements..."
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            data-ocid="lead.submit_button"
            type="submit"
            size="sm"
            className="bg-teal hover:bg-teal/80 text-white text-[12px] min-h-[44px] lg:min-h-[32px]"
          >
            <UserPlus size={12} className="mr-1" />
            {editLead ? "Update Lead" : "Create Lead"}
          </Button>
          <Button
            data-ocid="lead.reset.button"
            type="button"
            variant="outline"
            size="sm"
            className="text-[12px] min-h-[44px] lg:min-h-[32px]"
            onClick={() =>
              setForm({
                name: "",
                phone: "",
                email: "",
                company: "",
                source: "Direct",
                status: "New",
                notes: "",
                followUpDate: "",
              })
            }
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
