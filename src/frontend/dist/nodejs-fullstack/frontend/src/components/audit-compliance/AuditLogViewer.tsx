import { Download, Filter, RefreshCw, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { getAuditLog } from "../../utils/auditLog";

export default function AuditLogViewer() {
  const [searchUser, setSearchUser] = useState("");
  const [searchAction, setSearchAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const rawLogs = getAuditLog();

  const filtered = useMemo(() => {
    return rawLogs.filter((e) => {
      if (
        searchUser &&
        !e.username.toLowerCase().includes(searchUser.toLowerCase())
      )
        return false;
      if (
        searchAction &&
        !e.action.toLowerCase().includes(searchAction.toLowerCase())
      )
        return false;
      if (dateFrom && e.timestamp < new Date(dateFrom).getTime()) return false;
      if (dateTo && e.timestamp > new Date(`${dateTo}T23:59:59`).getTime())
        return false;
      return true;
    });
  }, [rawLogs, searchUser, searchAction, dateFrom, dateTo]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      "Timestamp,Username,Role,Action,Module,Details",
      ...filtered.map(
        (e) =>
          `${new Date(e.timestamp).toISOString()},${e.username},${e.role},${e.action},${e.module},"${e.details}"`,
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield size={16} className="text-teal" />
          Audit Log Viewer
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(1)}
            className="text-[11px] px-3 py-1.5 bg-secondary border border-border text-muted-foreground hover:bg-secondary/80 rounded-sm flex items-center gap-1"
            data-ocid="audit.refresh.button"
          >
            <RefreshCw size={11} /> Refresh
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="text-[11px] px-3 py-1.5 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 rounded-sm flex items-center gap-1"
            data-ocid="audit.export.button"
          >
            <Download size={11} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-sm p-3 mb-4 flex flex-wrap gap-3 items-end">
        <Filter size={12} className="text-muted-foreground self-center" />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="audit-user-filter"
            className="text-[10px] text-muted-foreground"
          >
            User
          </label>
          <input
            id="audit-user-filter"
            type="text"
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by user..."
            className="h-7 bg-secondary/50 border border-border rounded-sm px-2 text-[11px] text-foreground outline-none focus:border-teal/50 w-32"
            data-ocid="audit.user.search_input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="audit-action-filter"
            className="text-[10px] text-muted-foreground"
          >
            Action
          </label>
          <input
            id="audit-action-filter"
            type="text"
            value={searchAction}
            onChange={(e) => {
              setSearchAction(e.target.value);
              setPage(1);
            }}
            placeholder="LOGIN, CREATE..."
            className="h-7 bg-secondary/50 border border-border rounded-sm px-2 text-[11px] text-foreground outline-none focus:border-teal/50 w-36"
            data-ocid="audit.action.search_input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="audit-date-from"
            className="text-[10px] text-muted-foreground"
          >
            From Date
          </label>
          <input
            id="audit-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="h-7 bg-secondary/50 border border-border rounded-sm px-2 text-[11px] text-foreground outline-none focus:border-teal/50"
            data-ocid="audit.date_from.input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="audit-date-to"
            className="text-[10px] text-muted-foreground"
          >
            To Date
          </label>
          <input
            id="audit-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-7 bg-secondary/50 border border-border rounded-sm px-2 text-[11px] text-foreground outline-none focus:border-teal/50"
            data-ocid="audit.date_to.input"
          />
        </div>
        <span className="text-[10px] text-muted-foreground self-end pb-1">
          {filtered.length} records
        </span>
      </div>

      {/* Log Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Timestamp
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                User
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Role
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Action
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Module
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No audit log entries found. Log events will appear here as you
                  use the system.
                </td>
              </tr>
            ) : (
              paged.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="border-b border-border/50 hover:bg-secondary/20"
                  data-ocid={`audit.row.item.${idx + 1}`}
                >
                  <td className="px-3 py-2 text-muted-foreground font-mono whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="px-3 py-2 text-teal font-medium">
                    {entry.username}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {entry.role}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] font-medium ${
                        entry.action === "LOGIN"
                          ? "bg-teal/15 text-teal"
                          : entry.action === "LOGOUT"
                            ? "bg-secondary text-muted-foreground"
                            : entry.action.includes("DELETE")
                              ? "bg-red-500/15 text-red-500"
                              : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {entry.module}
                  </td>
                  <td className="px-3 py-2 text-foreground max-w-[200px] truncate">
                    {entry.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-[11px] px-3 py-1.5 bg-secondary border border-border text-muted-foreground hover:bg-secondary/80 rounded-sm disabled:opacity-50"
              data-ocid="audit.pagination_prev"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-[11px] px-3 py-1.5 bg-secondary border border-border text-muted-foreground hover:bg-secondary/80 rounded-sm disabled:opacity-50"
              data-ocid="audit.pagination_next"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
