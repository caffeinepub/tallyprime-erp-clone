import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadLeads, saveLeads } from "./LeadMaster";
import type { Lead } from "./LeadMaster";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500/20 text-blue-500 border-blue-500/40",
  "Follow-up": "bg-yellow-500/20 text-yellow-600 border-yellow-500/40",
  Qualified: "bg-purple-500/20 text-purple-500 border-purple-500/40",
  Won: "bg-green-500/20 text-green-500 border-green-500/40",
  Lost: "bg-red-500/20 text-red-500 border-red-500/40",
};

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  const refresh = () => setLeads(loadLeads());

  const convertToCustomer = (lead: Lead) => {
    const updated = leads.map((l) =>
      l.id === lead.id ? { ...l, status: "Won" } : l,
    );
    saveLeads(updated);
    setLeads(updated);
    toast.success(`${lead.name} converted to Customer!`);
  };

  const deleteLead = (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    saveLeads(updated);
    setLeads(updated);
    toast.success("Lead deleted");
  };

  const filtered = leads.filter((l) => {
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchSource = sourceFilter === "All" || l.source === sourceFilter;
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSource && matchSearch;
  });

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Users size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">Lead List</h2>
        <span className="text-[11px] text-muted-foreground">
          {filtered.length} leads
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-[11px] h-7"
          onClick={refresh}
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          data-ocid="leads.search_input"
          className="h-7 text-[11px] w-full sm:w-48"
          placeholder="Search by name / company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            data-ocid="leads.status.select"
            className="h-7 text-[11px] w-full sm:w-36"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["All", "New", "Follow-up", "Qualified", "Won", "Lost"].map(
              (s) => (
                <SelectItem key={s} value={s} className="text-[11px]">
                  {s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger
            data-ocid="leads.source.select"
            className="h-7 text-[11px] w-full sm:w-36"
          >
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {["All", "Direct", "Reference", "Online", "Exhibition"].map((s) => (
              <SelectItem key={s} value={s} className="text-[11px]">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="leads.list.empty_state"
          className="text-center py-12 text-muted-foreground text-[12px]"
        >
          No leads found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="leads.list.table">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">#</TableHead>
                <TableHead className="text-[11px]">Name</TableHead>
                <TableHead className="text-[11px]">Phone</TableHead>
                <TableHead className="text-[11px]">Company</TableHead>
                <TableHead className="text-[11px]">Source</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">Follow-up</TableHead>
                <TableHead className="text-[11px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead, i) => (
                <TableRow key={lead.id} data-ocid={`leads.list.item.${i + 1}`}>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-[12px] font-medium">
                    {lead.name}
                  </TableCell>
                  <TableCell className="text-[11px]">{lead.phone}</TableCell>
                  <TableCell className="text-[11px]">{lead.company}</TableCell>
                  <TableCell className="text-[11px]">{lead.source}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${STATUS_COLORS[lead.status] ?? ""}`}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {lead.followUpDate || "\u2014"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {lead.status === "Won" && (
                        <Button
                          data-ocid={`leads.convert.button.${i + 1}`}
                          size="sm"
                          className="text-[9px] h-6 px-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => convertToCustomer(lead)}
                        >
                          Convert
                        </Button>
                      )}
                      <Button
                        data-ocid={`leads.delete_button.${i + 1}`}
                        size="sm"
                        variant="destructive"
                        className="text-[9px] h-6 px-2"
                        onClick={() => deleteLead(lead.id)}
                      >
                        Del
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
