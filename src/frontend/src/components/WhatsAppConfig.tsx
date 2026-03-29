import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "hisabkitab_whatsapp_config";

interface WAConfig {
  accessToken: string;
  phoneNumberId: string;
  webhookToken: string;
}

function loadConfig(): WAConfig {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return { accessToken: "", phoneNumberId: "", webhookToken: "" };
  }
}

export default function WhatsAppConfig() {
  const saved = loadConfig();
  const [accessToken, setAccessToken] = useState(saved.accessToken || "");
  const [phoneNumberId, setPhoneNumberId] = useState(saved.phoneNumberId || "");
  const [webhookToken, setWebhookToken] = useState(saved.webhookToken || "");
  const [testing, setTesting] = useState(false);
  const [sendPhone, setSendPhone] = useState("");
  const [sendMsg, setSendMsg] = useState("");
  const [sending, setSending] = useState(false);

  const handleSave = () => {
    const cfg: WAConfig = { accessToken, phoneNumberId, webhookToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    toast.success("WhatsApp configuration saved");
  };

  const handleTest = async () => {
    if (!accessToken || !phoneNumberId) {
      toast.error("Enter Access Token and Phone Number ID first");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`Connected: ${data.display_phone_number || data.id}`);
      } else {
        toast.error(data.error?.message || "Connection failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSend = async () => {
    if (!accessToken || !phoneNumberId) {
      toast.error("Save configuration first");
      return;
    }
    if (!sendPhone || !sendMsg) {
      toast.error("Enter phone number and message");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: sendPhone.replace(/\D/g, ""),
            type: "text",
            text: { body: sendMsg },
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Message sent successfully!");
        setSendPhone("");
        setSendMsg("");
      } else {
        toast.error(data.error?.message || "Failed to send");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={16} className="text-teal" />
        <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
          WhatsApp Business Configuration
        </h2>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-[10px]">
          Cloud API
        </Badge>
      </div>

      {/* Info alert */}
      <div className="flex items-start gap-2 border border-yellow-500/40 bg-yellow-500/10 p-3 mb-5">
        <AlertTriangle
          size={13}
          className="text-yellow-400 flex-shrink-0 mt-0.5"
        />
        <p className="text-[11px] text-yellow-300 leading-relaxed">
          <strong>Note:</strong> This platform supports <strong>sending</strong>{" "}
          WhatsApp messages only. Receiving replies and webhooks is not
          supported.
        </p>
      </div>

      {/* API Config */}
      <div className="border border-border bg-secondary/20 p-4 space-y-4 mb-5">
        <p className="text-[11px] font-semibold text-foreground uppercase text-muted-foreground">
          API Credentials
        </p>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            Access Token
          </Label>
          <Input
            data-ocid="whatsapp.input"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAAxxxxxx..."
            className="font-mono text-[11px] bg-background border-border"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            Phone Number ID
          </Label>
          <Input
            data-ocid="whatsapp.secondary_button"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="1234567890"
            className="font-mono text-[11px] bg-background border-border"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            Webhook Verification Token
          </Label>
          <Input
            value={webhookToken}
            onChange={(e) => setWebhookToken(e.target.value)}
            placeholder="your_verification_token"
            className="font-mono text-[11px] bg-background border-border"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            Webhook URL
          </Label>
          <Input
            value="Not available on this platform (receiving webhooks not supported)"
            readOnly
            className="font-mono text-[11px] bg-secondary/30 border-border text-muted-foreground cursor-not-allowed"
          />
        </div>

        <div className="flex gap-2">
          <Button
            data-ocid="whatsapp.save_button"
            size="sm"
            onClick={handleSave}
            className="bg-teal hover:bg-teal/80 text-primary-foreground h-7 text-[11px]"
          >
            Save Config
          </Button>
          <Button
            data-ocid="whatsapp.primary_button"
            size="sm"
            variant="outline"
            onClick={handleTest}
            disabled={testing}
            className="h-7 text-[11px] border-border"
          >
            {testing ? (
              <Loader2 size={11} className="animate-spin mr-1" />
            ) : null}
            Test Connection
          </Button>
        </div>
      </div>

      {/* Send Test Message */}
      <div className="border border-border bg-secondary/20 p-4 space-y-3">
        <p className="text-[11px] font-semibold text-foreground uppercase text-muted-foreground">
          Send Test Message
        </p>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            To Phone (with country code)
          </Label>
          <Input
            data-ocid="whatsapp.search_input"
            value={sendPhone}
            onChange={(e) => setSendPhone(e.target.value)}
            placeholder="+919876543210"
            className="font-mono text-[11px] bg-background border-border"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            Message
          </Label>
          <Textarea
            data-ocid="whatsapp.textarea"
            value={sendMsg}
            onChange={(e) => setSendMsg(e.target.value)}
            placeholder="Hello from HisabKitab Pro..."
            rows={3}
            className="font-mono text-[11px] bg-background border-border resize-none"
          />
        </div>

        <Button
          data-ocid="whatsapp.submit_button"
          size="sm"
          onClick={handleSend}
          disabled={sending}
          className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px]"
        >
          {sending ? <Loader2 size={11} className="animate-spin mr-1" /> : null}
          Send Message
        </Button>
      </div>
    </div>
  );
}
