import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Reply } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loadContactQueries, saveContactQueries } from "./login/ContactModal";
import type { ContactQuery } from "./login/ContactModal";

export default function ContactQueries() {
  const [queries, setQueries] = useState<ContactQuery[]>(loadContactQueries);
  const [filter, setFilter] = useState<"all" | "open" | "replied">("all");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered =
    filter === "all" ? queries : queries.filter((q) => q.status === filter);

  const handleReply = (id: string) => {
    if (!replyText.trim()) {
      toast.error("Enter a reply");
      return;
    }
    const updated = queries.map((q) =>
      q.id === id
        ? { ...q, reply: replyText.trim(), status: "replied" as const }
        : q,
    );
    setQueries(updated);
    saveContactQueries(updated);
    setReplyId(null);
    setReplyText("");
    toast.success("Reply saved!");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Mail size={16} className="text-teal" />
            Contact Queries
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Messages from users via the login page contact form
          </p>
        </div>
        <div className="flex gap-1">
          {(["all", "open", "replied"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              data-ocid={`contact_queries.${f}.tab`}
              className={`text-[10px] px-3 py-1 border rounded transition-colors capitalize ${
                filter === f
                  ? "bg-teal/20 border-teal/50 text-teal"
                  : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground text-sm"
          data-ocid="contact_queries.empty_state"
        >
          <MessageSquare size={36} className="mx-auto mb-2 opacity-40" />
          No queries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <div
              key={q.id}
              className="border border-border rounded p-4 space-y-2"
              data-ocid={`contact_queries.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {q.name}
                    </span>
                    <Badge
                      className={`text-[9px] px-1.5 py-0 ${
                        q.status === "open"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                          : "bg-green-500/20 text-green-400 border-green-500/40"
                      }`}
                    >
                      {q.status === "open" ? "Open" : "Replied"}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {q.email} &bull;{" "}
                    {new Date(q.timestamp).toLocaleString("en-IN")}
                  </div>
                  {q.subject && (
                    <div className="text-[11px] text-teal font-medium mt-0.5">
                      {q.subject}
                    </div>
                  )}
                </div>
                {q.status === "open" && replyId !== q.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => {
                      setReplyId(q.id);
                      setReplyText("");
                    }}
                    data-ocid={`contact_queries.reply.${i + 1}.button`}
                  >
                    <Reply size={11} className="mr-1" />
                    Reply
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground bg-secondary/30 rounded p-2">
                {q.message}
              </div>
              {q.reply && (
                <div className="text-xs text-green-400 bg-green-500/5 border border-green-500/20 rounded p-2">
                  <span className="font-semibold">Admin reply:</span> {q.reply}
                </div>
              )}
              {replyId === q.id && (
                <div className="space-y-2 border-t border-border/50 pt-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="text-xs resize-none"
                    data-ocid={`contact_queries.reply_input.${i + 1}`}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleReply(q.id)}
                      data-ocid={`contact_queries.send_reply.${i + 1}.primary_button`}
                    >
                      Send Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setReplyId(null)}
                      data-ocid={`contact_queries.cancel.${i + 1}.cancel_button`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
