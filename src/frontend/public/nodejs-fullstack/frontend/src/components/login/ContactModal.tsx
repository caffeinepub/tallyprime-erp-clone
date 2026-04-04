import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Mail, X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CONTACT_KEY = "hkp_contact_queries";

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  reply: string | null;
  status: "open" | "replied";
}

export function loadContactQueries(): ContactQuery[] {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    if (raw) return JSON.parse(raw) as ContactQuery[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveContactQueries(queries: ContactQuery[]) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(queries));
}

export default function ContactModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    const query: ContactQuery = {
      id: `cq_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || "General Inquiry",
      message: message.trim(),
      timestamp: new Date().toISOString(),
      reply: null,
      status: "open",
    };
    const existing = loadContactQueries();
    saveContactQueries([...existing, query]);
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      data-ocid="contact.modal"
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-teal" />
            <span className="text-sm font-bold text-foreground">
              Contact Support
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0"
            data-ocid="contact.close_button"
          >
            <X size={14} />
          </Button>
        </div>

        {submitted ? (
          <div
            className="p-8 text-center space-y-3"
            data-ocid="contact.success_state"
          >
            <CheckCircle size={40} className="mx-auto text-green-400" />
            <div className="text-sm font-semibold text-foreground">
              Message sent!
            </div>
            <div className="text-xs text-muted-foreground">
              We&apos;ll get back to you soon. Admin will reply to your query.
            </div>
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs mt-2"
              data-ocid="contact.close_button"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-8 text-xs"
                required
                data-ocid="contact.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-8 text-xs"
                required
                data-ocid="contact.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Login issue"
                className="h-8 text-xs"
                data-ocid="contact.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Message *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your query..."
                rows={4}
                className="text-xs resize-none"
                required
                data-ocid="contact.textarea"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full text-xs"
              data-ocid="contact.submit_button"
            >
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
