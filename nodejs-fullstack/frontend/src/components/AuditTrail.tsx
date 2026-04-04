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
import { RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppUser } from "../types/rbac";
import { clearAuditLog, getAuditLog } from "../utils/auditLog";
import type { AuditEntry } from "../utils/auditLog";

interface Props {
  currentUser: AppUser | null;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

const ACTION_BADGE: Record<string, string> = {
  LOGIN: "bg-green-600/20 text-green-400 border-green-600/30",
  LOGOUT: "bg-gray-600/20 text-gray-400 border-gray-600/30",
  CREATE: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  UPDATE: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  DELETE: "bg-red-600/20 text-red-400 border-red-600/30",
  EXPORT: "bg-purple-600/20 text-purple-400 border-purple-600/30",
};

export default function AuditTrail({ currentUser }: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setEntries(getAuditLog());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const modules = useMemo(() => {
    const set = new Set(entries.map((e) => e.module));
    return ["All", ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (moduleFilter !== "All" && e.module !== moduleFilter) return false;
      if (fromDate) {
        const from = new Date(fromDate).getTime();
        if (e.timestamp < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate).getTime() + 86400000;
        if (e.timestamp > to) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.username.toLowerCase().includes(q) &&
          !e.action.toLowerCase().includes(q) &&
          !e.module.toLowerCase().includes(q) &&
          !e.details.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [entries, fromDate, toDate, moduleFilter, search]);

  const handleClear = () => {
    clearAuditLog();
    load();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
        <span className="text-sm font-semibold text-teal tracking-wide uppercase">
          Activity Log
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            className="h-7 px-2 text-xs"
            data-ocid="audit.refresh.button"
          >
            <RefreshCw size={12} className="mr-1" /> Refresh
          </Button>
          {currentUser?.role === "Admin" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs"
              data-ocid="audit.delete_button"
            >
              <Trash2 size={12} className="mr-1" /> Clear Log
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/10 flex-wrap">
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="h-7 text-xs w-36"
          placeholder="From Date"
          data-ocid="audit.input"
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="h-7 text-xs w-36"
          placeholder="To Date"
        />
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="h-7 text-xs w-36" data-ocid="audit.select">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((m) => (
              <SelectItem key={m} value={m} className="text-xs">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="h-7 text-xs w-48"
          data-ocid="audit.search_input"
        />
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div
            className="flex items-center justify-center h-32 text-sm text-muted-foreground"
            data-ocid="audit.empty_state"
          >
            No activity recorded yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-xs border-border hover:bg-transparent">
                <TableHead className="py-1 px-3 font-semibold text-muted-foreground w-40">
                  Timestamp
                </TableHead>
                <TableHead className="py-1 px-3 font-semibold text-muted-foreground w-28">
                  User
                </TableHead>
                <TableHead className="py-1 px-3 font-semibold text-muted-foreground w-24">
                  Role
                </TableHead>
                <TableHead className="py-1 px-3 font-semibold text-muted-foreground w-24">
                  Action
                </TableHead>
                <TableHead className="py-1 px-3 font-semibold text-muted-foreground w-28">
                  Module
                </TableHead>
                <TableHead className="py-1 px-3 font-semibold text-muted-foreground">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry, idx) => (
                <TableRow
                  key={entry.id}
                  className="text-xs border-border hover:bg-secondary/20"
                  data-ocid={`audit.item.${idx + 1}`}
                >
                  <TableCell className="py-1 px-3 font-mono text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </TableCell>
                  <TableCell className="py-1 px-3 font-semibold">
                    {entry.username}
                  </TableCell>
                  <TableCell className="py-1 px-3 text-muted-foreground">
                    {entry.role}
                  </TableCell>
                  <TableCell className="py-1 px-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        ACTION_BADGE[entry.action] ??
                        "bg-secondary/30 text-foreground"
                      }`}
                    >
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-3 text-muted-foreground">
                    {entry.module}
                  </TableCell>
                  <TableCell className="py-1 px-3 text-foreground/80">
                    {entry.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
