import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, ListTodo, MessageSquare } from "lucide-react";

interface Task {
  id: string;
  voucherRef: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

interface Comment {
  id: string;
  voucherRef: string;
  author: string;
  text: string;
  timestamp: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-orange-100 text-orange-700",
  Done: "bg-green-100 text-green-700",
};

export default function CollaborationDashboard() {
  const tasks: Task[] = JSON.parse(
    localStorage.getItem("hkp_collab_tasks") || "[]",
  );
  const comments: Comment[] = JSON.parse(
    localStorage.getItem("hkp_collab_comments") || "[]",
  );

  const openTasks = tasks.filter((t) => t.status !== "Done");
  const doneTasks = tasks.filter((t) => t.status === "Done");
  const recentComments = [...comments]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="p-4 space-y-4" data-ocid="collab.dashboard.panel">
      <h2 className="text-sm font-semibold text-foreground">
        Collaboration Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ListTodo className="w-3 h-3" /> Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-teal">
              {openTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-green-600">
              {doneTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-blue-600">
              {comments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Tasks */}
      <Card>
        <CardHeader className="px-3 pt-3 pb-2">
          <CardTitle className="text-[11px] font-semibold">
            Open Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {openTasks.length === 0 ? (
            <div
              className="text-center py-6 text-[10px] text-muted-foreground"
              data-ocid="collab.tasks.empty_state"
            >
              No open tasks
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Voucher Ref</TableHead>
                  <TableHead className="text-[10px]">Task</TableHead>
                  <TableHead className="text-[10px]">Assignee</TableHead>
                  <TableHead className="text-[10px]">Due Date</TableHead>
                  <TableHead className="text-[10px]">Priority</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openTasks.map((task, i) => (
                  <TableRow
                    key={task.id}
                    data-ocid={`collab.tasks.item.${i + 1}`}
                  >
                    <TableCell className="text-[10px] font-mono">
                      {task.voucherRef}
                    </TableCell>
                    <TableCell className="text-[10px]">{task.title}</TableCell>
                    <TableCell className="text-[10px]">
                      {task.assignee}
                    </TableCell>
                    <TableCell className="text-[10px]">
                      {task.dueDate}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority] || ""}`}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[task.status] || ""}`}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Comments */}
      <Card>
        <CardHeader className="px-3 pt-3 pb-2">
          <CardTitle className="text-[11px] font-semibold">
            Recent Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {recentComments.length === 0 ? (
            <div
              className="text-center py-4 text-[10px] text-muted-foreground"
              data-ocid="collab.comments.empty_state"
            >
              No comments yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentComments.map((c, i) => (
                <div
                  key={c.id}
                  className="border border-border rounded p-2 bg-muted/30"
                  data-ocid={`collab.comments.item.${i + 1}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono text-teal">
                      {c.voucherRef}
                    </span>
                    <span className="text-[9px] font-semibold">{c.author}</span>
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(c.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
