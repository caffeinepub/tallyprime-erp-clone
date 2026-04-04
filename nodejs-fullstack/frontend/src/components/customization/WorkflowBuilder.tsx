import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const TRIGGERS = [
  "On Voucher Save",
  "On Invoice Create",
  "On Payment Approve",
  "Daily 9am",
  "Weekly Monday",
];
const ACTIONS = [
  "Send Alert",
  "Require Approval",
  "Auto Post",
  "Notify User",
  "Log to Audit",
];

type Workflow = {
  id: number;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
};

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 1,
    name: "High-Value Voucher Approval",
    trigger: "On Voucher Save",
    actions: ["Require Approval", "Send Alert"],
    enabled: true,
  },
  {
    id: 2,
    name: "Daily Sales Summary",
    trigger: "Daily 9am",
    actions: ["Send Alert", "Log to Audit"],
    enabled: true,
  },
  {
    id: 3,
    name: "Invoice Auto-Post",
    trigger: "On Invoice Create",
    actions: ["Auto Post", "Notify User"],
    enabled: false,
  },
];

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>(DEMO_WORKFLOWS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    trigger: string;
    actions: string[];
  }>({ name: "", trigger: TRIGGERS[0], actions: ["Send Alert"] });

  function toggleEnabled(id: number) {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    );
  }

  function deleteWorkflow(id: number) {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  function addWorkflow() {
    if (!form.name.trim()) return;
    setWorkflows((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        trigger: form.trigger,
        actions: form.actions,
        enabled: true,
      },
    ]);
    setForm({ name: "", trigger: TRIGGERS[0], actions: ["Send Alert"] });
    setOpen(false);
  }

  function toggleAction(action: string) {
    setForm((prev) => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter((a) => a !== action)
        : prev.actions.length < 3
          ? [...prev.actions, action]
          : prev.actions,
    }));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-teal-400" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Workflow Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Automate actions based on triggers
            </p>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
          data-ocid="workflowbuilder.open_modal_button"
        >
          <Plus className="h-4 w-4" /> Add Workflow
        </Button>
      </div>

      <div className="space-y-4" data-ocid="workflowbuilder.list">
        {workflows.length === 0 && (
          <Card>
            <CardContent
              className="py-10 text-center text-muted-foreground"
              data-ocid="workflowbuilder.empty_state"
            >
              No workflows defined. Add your first workflow.
            </CardContent>
          </Card>
        )}
        {workflows.map((wf, i) => (
          <Card key={wf.id} data-ocid={`workflowbuilder.item.${i + 1}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{wf.name}</h3>
                    {!wf.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trigger: <span className="text-teal-400">{wf.trigger}</span>
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {wf.actions.map((a) => (
                      <Badge key={a} variant="outline" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={wf.enabled}
                    onCheckedChange={() => toggleEnabled(wf.id)}
                    data-ocid={`workflowbuilder.switch.${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkflow(wf.id)}
                    className="text-destructive h-8 w-8 p-0"
                    data-ocid={`workflowbuilder.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="workflowbuilder.dialog">
          <DialogHeader>
            <DialogTitle>New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Workflow Name</Label>
              <Input
                placeholder="e.g. Auto-approve small payments"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="workflowbuilder.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Trigger</Label>
              <Select
                value={form.trigger}
                onValueChange={(v) => setForm((p) => ({ ...p, trigger: v }))}
              >
                <SelectTrigger data-ocid="workflowbuilder.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions (max 3)</Label>
              <div className="flex flex-wrap gap-2">
                {ACTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAction(a)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      form.actions.includes(a)
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-border text-muted-foreground hover:border-teal-400"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="workflowbuilder.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={addWorkflow}
              disabled={!form.name.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              data-ocid="workflowbuilder.confirm_button"
            >
              Add Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
