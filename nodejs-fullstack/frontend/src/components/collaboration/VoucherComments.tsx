import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Comment {
  id: string;
  voucherRef: string;
  author: string;
  text: string;
  timestamp: string;
}

function getComments(): Comment[] {
  return JSON.parse(localStorage.getItem("hkp_collab_comments") || "[]");
}

function saveComments(comments: Comment[]) {
  localStorage.setItem("hkp_collab_comments", JSON.stringify(comments));
}

export default function VoucherComments() {
  const currentUser =
    JSON.parse(localStorage.getItem("hkp_current_user") || "null")?.username ||
    "admin";

  const [voucherRef, setVoucherRef] = useState("");
  const [searchRef, setSearchRef] = useState("");
  const [newText, setNewText] = useState("");
  const [, forceUpdate] = useState(0);

  const allComments = getComments();
  const filtered = searchRef
    ? allComments
        .filter((c) =>
          c.voucherRef.toLowerCase().includes(searchRef.toLowerCase()),
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
    : [];

  const addComment = () => {
    if (!searchRef.trim()) {
      toast.error("Enter a voucher reference first");
      return;
    }
    if (!newText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    const comments = getComments();
    comments.push({
      id: Date.now().toString(),
      voucherRef: searchRef.trim(),
      author: currentUser,
      text: newText.trim(),
      timestamp: new Date().toISOString(),
    });
    saveComments(comments);
    setNewText("");
    forceUpdate((n) => n + 1);
    toast.success("Comment added");
  };

  const deleteComment = (id: string) => {
    const comments = getComments().filter((c) => c.id !== id);
    saveComments(comments);
    forceUpdate((n) => n + 1);
    toast.success("Comment deleted");
  };

  return (
    <div className="p-4 space-y-4" data-ocid="voucher_comments.panel">
      <h2 className="text-sm font-semibold text-foreground">
        Voucher Comments
      </h2>

      {/* Search by voucher ref */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-[10px]">Voucher Reference</Label>
          <Input
            className="h-7 text-[10px]"
            placeholder="e.g. INV/2024/001"
            value={voucherRef}
            onChange={(e) => setVoucherRef(e.target.value)}
            data-ocid="voucher_comments.input"
          />
        </div>
        <Button
          className="h-7 text-[10px]"
          onClick={() => setSearchRef(voucherRef.trim())}
          data-ocid="voucher_comments.primary_button"
        >
          View Comments
        </Button>
      </div>

      {searchRef && (
        <>
          {/* Thread */}
          <div className="border border-border rounded">
            <div className="px-3 py-2 bg-muted/40 border-b border-border">
              <span className="text-[10px] font-semibold flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Comments for&nbsp;
                <span className="text-teal font-mono">{searchRef}</span>
                &nbsp;({filtered.length})
              </span>
            </div>
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <div
                  className="py-6 text-center text-[10px] text-muted-foreground"
                  data-ocid="voucher_comments.empty_state"
                >
                  No comments yet for this voucher
                </div>
              ) : (
                filtered.map((c, i) => (
                  <div
                    key={c.id}
                    className="px-3 py-2"
                    data-ocid={`voucher_comments.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-teal">
                          {c.author}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(c.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {c.author === currentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                          onClick={() => deleteComment(c.id)}
                          data-ocid={`voucher_comments.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add comment */}
          <div className="space-y-2">
            <Label className="text-[10px]">Add Comment</Label>
            <Textarea
              className="text-[10px] min-h-[60px]"
              placeholder="Write a comment..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              data-ocid="voucher_comments.textarea"
            />
            <Button
              className="h-7 text-[10px]"
              onClick={addComment}
              data-ocid="voucher_comments.submit_button"
            >
              Post Comment
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
