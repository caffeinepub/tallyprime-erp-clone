import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONFIG_KEY = "hk_remote_db_config";
const SYNC_HIST_KEY = "hk_remote_db_sync_history";

type DbConfig = {
  dbType: "mysql" | "sqlite";
  bridgeUrl: string;
  databaseName: string;
  username: string;
  password: string;
  timeout: number;
  lastTestedAt?: string;
  lastTestResult?: "success" | "fail";
};

type SyncEntry = {
  at: string;
  status: "success" | "fail";
  message: string;
};

function loadConfig(): DbConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    dbType: "mysql",
    bridgeUrl: "",
    databaseName: "",
    username: "",
    password: "",
    timeout: 10,
  };
}

function loadSyncHistory(): SyncEntry[] {
  try {
    const raw = localStorage.getItem(SYNC_HIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveSyncHistory(entries: SyncEntry[]) {
  localStorage.setItem(SYNC_HIST_KEY, JSON.stringify(entries.slice(0, 5)));
}

const SAMPLE_BRIDGE_CODE = `// Node.js Bridge Server (express)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const pool = mysql.createPool({ host, user, password, database });

app.get('/ping', (req, res) => res.json({ ok: true }));
app.post('/sync', async (req, res) => {
  // receive data from HisabKitab and store
  const { data } = req.body;
  // ... process data ...
  res.json({ ok: true, synced: Date.now() });
});

app.listen(3000, () => console.log('Bridge running on :3000'));`;

export default function RemoteDatabaseConfig() {
  const [config, setConfig] = useState<DbConfig>(loadConfig);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncEntry[]>(loadSyncHistory);
  const [showDocs, setShowDocs] = useState(false);

  const update = <K extends keyof DbConfig>(key: K, value: DbConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    toast.success("Remote database configuration saved");
  };

  const handleTest = async () => {
    if (!config.bridgeUrl) {
      toast.error("Please enter a Bridge URL first");
      return;
    }
    setTesting(true);
    const pingUrl = `${config.bridgeUrl.replace(/\/$/, "")}/ping`;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(
        () => ctrl.abort(),
        (config.timeout || 10) * 1000,
      );
      const res = await fetch(pingUrl, {
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: config.username
            ? `Basic ${btoa(`${config.username}:${config.password}`)}`
            : "",
        },
      });
      clearTimeout(timer);
      if (res.ok) {
        const updated = {
          ...config,
          lastTestedAt: new Date().toISOString(),
          lastTestResult: "success" as const,
        };
        setConfig(updated);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
        toast.success("Connection successful! Bridge is reachable.");
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      const updated = {
        ...config,
        lastTestedAt: new Date().toISOString(),
        lastTestResult: "fail" as const,
      };
      setConfig(updated);
      localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
      if (err.name === "AbortError") {
        toast.error("Connection timed out. Check your Bridge URL and server.");
      } else if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError")
      ) {
        toast.error("Cannot reach bridge. Check URL, CORS, and server status.");
      } else {
        toast.error(`Connection failed: ${err.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!config.bridgeUrl) {
      toast.error("Configure bridge URL first");
      return;
    }
    setSyncing(true);
    const syncUrl = `${config.bridgeUrl.replace(/\/$/, "")}/sync`;
    try {
      const payload = {
        source: "hisabkitab-pro",
        syncedAt: new Date().toISOString(),
        data: localStorage.getItem("hisabkitab_export") || "{}",
      };
      const res = await fetch(syncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: config.username
            ? `Basic ${btoa(`${config.username}:${config.password}`)}`
            : "",
        },
        body: JSON.stringify(payload),
      });
      const entry: SyncEntry = {
        at: new Date().toISOString(),
        status: res.ok ? "success" : "fail",
        message: res.ok ? "Sync completed" : `HTTP ${res.status}`,
      };
      const newHistory = [entry, ...syncHistory].slice(0, 5);
      setSyncHistory(newHistory);
      saveSyncHistory(newHistory);
      if (res.ok) {
        toast.success("Data synced to remote database");
      } else {
        toast.error(`Sync failed: HTTP ${res.status}`);
      }
    } catch (err: any) {
      const entry: SyncEntry = {
        at: new Date().toISOString(),
        status: "fail",
        message: err.message || "Network error",
      };
      const newHistory = [entry, ...syncHistory].slice(0, 5);
      setSyncHistory(newHistory);
      saveSyncHistory(newHistory);
      toast.error(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Database size={16} className="text-teal" />
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-foreground">
          Remote Database Bridge
        </h2>
      </div>

      {/* Explanation Banner */}
      <div className="border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-2">
        <AlertCircle size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground leading-relaxed">
          Connect your own MySQL or SQLite server. You need to run a simple REST
          bridge on your server (see Documentation below). HisabKitab Pro will
          make HTTP calls to sync data indirectly through this bridge.
        </p>
      </div>

      {/* Config Form */}
      <div className="border border-border bg-secondary/20 p-5 space-y-4">
        <Label className="text-[12px] font-semibold text-foreground">
          Connection Settings
        </Label>

        {/* DB Type */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">
            Database Type
          </Label>
          <Select
            value={config.dbType}
            onValueChange={(v) => update("dbType", v as DbConfig["dbType"])}
          >
            <SelectTrigger
              className="w-48 h-7 text-[11px]"
              data-ocid="remote_db.type.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="sqlite">SQLite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bridge URL */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">
            Bridge URL
          </Label>
          <Input
            value={config.bridgeUrl}
            onChange={(e) => update("bridgeUrl", e.target.value)}
            placeholder="http://yourserver.com:3000/hk-bridge"
            className="h-7 text-[11px] font-mono"
            data-ocid="remote_db.bridge_url.input"
          />
          <p className="text-[10px] text-muted-foreground">
            Full URL of your bridge REST endpoint.
          </p>
        </div>

        {/* MySQL-specific fields */}
        {config.dbType === "mysql" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">
                Database Name
              </Label>
              <Input
                value={config.databaseName}
                onChange={(e) => update("databaseName", e.target.value)}
                placeholder="hisabkitab_db"
                className="h-7 text-[11px]"
                data-ocid="remote_db.dbname.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">
                Username
              </Label>
              <Input
                value={config.username}
                onChange={(e) => update("username", e.target.value)}
                placeholder="db_user"
                className="h-7 text-[11px]"
                data-ocid="remote_db.username.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">
                Password
              </Label>
              <Input
                type="password"
                value={config.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                className="h-7 text-[11px]"
                data-ocid="remote_db.password.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase">
                Timeout (sec)
              </Label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e) => update("timeout", Number(e.target.value))}
                min={3}
                max={60}
                className="h-7 text-[11px]"
                data-ocid="remote_db.timeout.input"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
            data-ocid="remote_db.save_button"
          >
            Save Configuration
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTest}
            disabled={testing}
            className="text-[11px] h-7"
            data-ocid="remote_db.test_button"
          >
            {testing ? (
              <Loader2 size={11} className="animate-spin mr-1" />
            ) : null}
            Test Connection
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="text-[11px] h-7"
            data-ocid="remote_db.sync_button"
          >
            {syncing ? (
              <RefreshCw size={11} className="animate-spin mr-1" />
            ) : (
              <RefreshCw size={11} className="mr-1" />
            )}
            Sync Now
          </Button>
        </div>

        {/* Connection Status */}
        {config.lastTestedAt && (
          <div className="flex items-center gap-2 mt-2">
            {config.lastTestResult === "success" ? (
              <CheckCircle size={12} className="text-green-400" />
            ) : (
              <XCircle size={12} className="text-red-400" />
            )}
            <span className="text-[10px] text-muted-foreground">
              Last tested:{" "}
              {new Date(config.lastTestedAt).toLocaleString("en-IN")} —{" "}
              <span
                className={
                  config.lastTestResult === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {config.lastTestResult === "success" ? "Connected" : "Failed"}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* CORS Note */}
      <div className="border border-yellow-500/30 bg-yellow-500/10 p-3 text-[10px] text-foreground">
        <strong>CORS:</strong> If you get CORS errors, configure your bridge
        server to allow requests from{" "}
        <span className="font-mono">{window.location.origin}</span>
      </div>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="border border-border bg-secondary/20 p-4 space-y-2">
          <Label className="text-[12px] font-semibold text-foreground">
            Sync History
          </Label>
          <div className="space-y-1">
            {syncHistory.map((entry, i) => (
              <div
                key={`${entry.at}-${i}`}
                data-ocid={`remote_db.sync_history.item.${i + 1}`}
                className="flex items-center gap-2 text-[10px]"
              >
                {entry.status === "success" ? (
                  <CheckCircle size={10} className="text-green-400" />
                ) : (
                  <XCircle size={10} className="text-red-400" />
                )}
                <span className="text-muted-foreground">
                  {new Date(entry.at).toLocaleString("en-IN")}
                </span>
                <span className="text-foreground">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="border border-border">
        <button
          type="button"
          onClick={() => setShowDocs((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-secondary/30 hover:bg-secondary/50 text-[11px] font-semibold text-foreground transition-colors"
          data-ocid="remote_db.docs.toggle"
        >
          {showDocs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Documentation: Sample Node.js Bridge Server
        </button>
        {showDocs && (
          <div className="p-4">
            <p className="text-[10px] text-muted-foreground mb-3">
              Run this simple Express.js server on your VPS/cloud to act as a
              bridge between HisabKitab Pro and your MySQL database. Install
              dependencies:{" "}
              <span className="font-mono">npm install express mysql2 cors</span>
            </p>
            <Textarea
              readOnly
              value={SAMPLE_BRIDGE_CODE}
              rows={16}
              className="text-[9px] font-mono resize-none bg-background"
              data-ocid="remote_db.code_sample.textarea"
            />
          </div>
        )}
      </div>
    </div>
  );
}
