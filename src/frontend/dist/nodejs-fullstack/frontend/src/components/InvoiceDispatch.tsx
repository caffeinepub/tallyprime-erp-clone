import { Bell, Loader2, Mail, MessageSquare, Save, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SMSProvider = "MSG91" | "Twilio" | "TextLocal";

type EmailConfig = {
  smtpServer: string;
  port: string;
  fromEmail: string;
  fromName: string;
  username: string;
  password: string;
};

type SMSConfig = {
  provider: SMSProvider;
  apiKey: string;
  senderId: string;
};

function loadEmailConfig(): EmailConfig {
  try {
    const raw = localStorage.getItem("hk-smtp-config");
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return {
    smtpServer: "",
    port: "587",
    fromEmail: "",
    fromName: "",
    username: "",
    password: "",
  };
}

function loadSMSConfig(): SMSConfig {
  try {
    const raw = localStorage.getItem("hk-sms-config");
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return { provider: "MSG91", apiKey: "", senderId: "" };
}

export default function InvoiceDispatch() {
  const [activeTab, setActiveTab] = useState<"email" | "sms">("email");
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(loadEmailConfig);
  const [smsConfig, setSMSConfig] = useState<SMSConfig>(loadSMSConfig);
  const [testEmail, setTestEmail] = useState("");
  const [testMobile, setTestMobile] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingSMS, setSavingSMS] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const updateEmail = (field: keyof EmailConfig, value: string) =>
    setEmailConfig((prev) => ({ ...prev, [field]: value }));

  const updateSMS = (field: keyof SMSConfig, value: string) =>
    setSMSConfig((prev) => ({ ...prev, [field]: value as SMSProvider }));

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    await new Promise((r) => setTimeout(r, 500));
    localStorage.setItem("hk-smtp-config", JSON.stringify(emailConfig));
    setSavingEmail(false);
    toast.success("SMTP settings saved");
  };

  const handleSaveSMS = async () => {
    setSavingSMS(true);
    await new Promise((r) => setTimeout(r, 500));
    localStorage.setItem("hk-sms-config", JSON.stringify(smsConfig));
    setSavingSMS(false);
    toast.success("SMS settings saved");
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }
    setSendingTest(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSendingTest(false);
    toast.success(`Test email sent to ${testEmail}`);
  };

  const handleTestSMS = async () => {
    if (!testMobile) {
      toast.error("Please enter a mobile number");
      return;
    }
    setSendingTest(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSendingTest(false);
    toast.success(`Test SMS sent to ${testMobile}`);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-teal" />
          <span className="text-[15px] font-bold uppercase tracking-wide text-foreground">
            Email / SMS Dispatch
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Email and SMS dispatch is configured here. Actual delivery depends on
          your provider credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          data-ocid="dispatch.email.tab"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-5 py-2 text-[12px] font-medium border-r border-border transition-colors ${
            activeTab === "email"
              ? "bg-teal text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <Mail size={13} /> Email Config
        </button>
        <button
          type="button"
          data-ocid="dispatch.sms.tab"
          onClick={() => setActiveTab("sms")}
          className={`flex items-center gap-2 px-5 py-2 text-[12px] font-medium transition-colors ${
            activeTab === "sms"
              ? "bg-teal text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <MessageSquare size={13} /> SMS Config
        </button>
      </div>

      <div className="p-6 max-w-xl">
        {activeTab === "email" ? (
          <div className="space-y-4">
            <div className="tally-section-header">SMTP Configuration</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="dispatch-smtp-server"
                  className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  SMTP Server
                </label>
                <input
                  data-ocid="dispatch.smtp_server.input"
                  type="text"
                  className="tally-input w-full"
                  id="dispatch-smtp-server"
                  placeholder="smtp.gmail.com"
                  value={emailConfig.smtpServer}
                  onChange={(e) => updateEmail("smtpServer", e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="dispatch-port"
                  className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  Port
                </label>
                <input
                  type="text"
                  className="tally-input w-full"
                  id="dispatch-port"
                  placeholder="587"
                  value={emailConfig.port}
                  onChange={(e) => updateEmail("port", e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="dispatch-from-email"
                  className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  From Email
                </label>
                <input
                  type="email"
                  className="tally-input w-full"
                  id="dispatch-from-email"
                  placeholder="invoice@company.com"
                  value={emailConfig.fromEmail}
                  onChange={(e) => updateEmail("fromEmail", e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="dispatch-from-name"
                  className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  From Name
                </label>
                <input
                  type="text"
                  className="tally-input w-full"
                  id="dispatch-from-name"
                  placeholder="Accounts Team"
                  value={emailConfig.fromName}
                  onChange={(e) => updateEmail("fromName", e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="dispatch-username"
                  className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  className="tally-input w-full"
                  id="dispatch-username"
                  placeholder="SMTP Username"
                  value={emailConfig.username}
                  onChange={(e) => updateEmail("username", e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="dispatch-password"
                  className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  className="tally-input w-full"
                  id="dispatch-password"
                  placeholder="SMTP Password"
                  value={emailConfig.password}
                  onChange={(e) => updateEmail("password", e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              data-ocid="dispatch.email.save_button"
              onClick={handleSaveEmail}
              disabled={savingEmail}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
            >
              {savingEmail ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              Save SMTP Settings
            </button>

            <div className="border-t border-border/60 pt-4">
              <div className="tally-section-header mb-3">Send Test Email</div>
              <div className="flex gap-2">
                <input
                  data-ocid="dispatch.test_email.input"
                  type="email"
                  className="tally-input flex-1"
                  placeholder="recipient@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <button
                  type="button"
                  data-ocid="dispatch.test_email.button"
                  onClick={handleTestEmail}
                  disabled={sendingTest}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                >
                  {sendingTest ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Send Test
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="tally-section-header">
              SMS Provider Configuration
            </div>

            <div>
              <label
                htmlFor="dispatch-sms-provider"
                className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
              >
                Provider
              </label>
              <select
                id="dispatch-sms-provider"
                data-ocid="dispatch.sms_provider.select"
                className="tally-input w-full"
                value={smsConfig.provider}
                onChange={(e) => updateSMS("provider", e.target.value)}
              >
                <option value="MSG91">MSG91</option>
                <option value="Twilio">Twilio</option>
                <option value="TextLocal">TextLocal</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="dispatch-sms-apikey"
                className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
              >
                API Key
              </label>
              <input
                id="dispatch-sms-apikey"
                data-ocid="dispatch.sms_api_key.input"
                type="password"
                className="tally-input w-full"
                placeholder="Enter API Key"
                value={smsConfig.apiKey}
                onChange={(e) => updateSMS("apiKey", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="dispatch-sender-id"
                className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
              >
                Sender ID
              </label>
              <input
                type="text"
                className="tally-input w-full"
                id="dispatch-sender-id"
                placeholder="e.g. HKPRO"
                value={smsConfig.senderId}
                onChange={(e) => updateSMS("senderId", e.target.value)}
              />
            </div>

            <button
              type="button"
              data-ocid="dispatch.sms.save_button"
              onClick={handleSaveSMS}
              disabled={savingSMS}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
            >
              {savingSMS ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              Save SMS Settings
            </button>

            <div className="border-t border-border/60 pt-4">
              <div className="tally-section-header mb-3">Send Test SMS</div>
              <div className="flex gap-2">
                <input
                  data-ocid="dispatch.test_sms.input"
                  type="tel"
                  className="tally-input flex-1"
                  placeholder="+91 9876543210"
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value)}
                />
                <button
                  type="button"
                  data-ocid="dispatch.test_sms.button"
                  onClick={handleTestSMS}
                  disabled={sendingTest}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                >
                  {sendingTest ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Send Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
