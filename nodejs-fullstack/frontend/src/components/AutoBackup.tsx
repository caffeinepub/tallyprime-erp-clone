import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveBackup } from "@/lib/indexedDB";
import { Clock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BackupSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  lastBackupTime: string | null;
  reminderEnabled: boolean;
}

const SETTINGS_KEY = "hisabkitab_backup_settings";

function loadSettings(): BackupSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as BackupSettings;
  } catch {
    // ignore
  }
  return {
    enabled: false,
    frequency: "daily",
    lastBackupTime: null,
    reminderEnabled: true,
  };
}

function saveSettings(s: BackupSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function isBackupDue(settings: BackupSettings): boolean {
  if (!settings.enabled || !settings.lastBackupTime) return settings.enabled;
  const last = new Date(settings.lastBackupTime).getTime();
  const diff = Date.now() - last;
  if (settings.frequency === "daily") return diff > 24 * 60 * 60 * 1000;
  if (settings.frequency === "weekly") return diff > 7 * 24 * 60 * 60 * 1000;
  if (settings.frequency === "monthly") return diff > 30 * 24 * 60 * 60 * 1000;
  return false;
}

function getNextBackupTime(settings: BackupSettings): string {
  if (!settings.lastBackupTime) return "Not scheduled yet";
  const last = new Date(settings.lastBackupTime);
  const ms =
    settings.frequency === "daily"
      ? 86400000
      : settings.frequency === "weekly"
        ? 604800000
        : 2592000000;
  return new Date(last.getTime() + ms).toLocaleString();
}

function getFrequencyLabel(freq: BackupSettings["frequency"]): string {
  if (freq === "daily") return "a day";
  if (freq === "weekly") return "a week";
  return "a month";
}

export default function AutoBackup() {
  const [settings, setSettings] = useState<BackupSettings>(loadSettings);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    if (isBackupDue(s)) {
      const runAutoBackup = async () => {
        const snapshot: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            try {
              snapshot[k] = JSON.parse(localStorage.getItem(k) ?? "null");
            } catch {
              snapshot[k] = localStorage.getItem(k);
            }
          }
        }
        await saveBackup(snapshot);
        const updated = { ...s, lastBackupTime: new Date().toISOString() };
        saveSettings(updated);
        setSettings(updated);
        toast.success("Auto-backup completed!");
      };
      runAutoBackup().catch(() => toast.error("Auto-backup failed"));
    } else if (s.reminderEnabled && s.lastBackupTime) {
      const last = new Date(s.lastBackupTime);
      const diff = Date.now() - last.getTime();
      const threshold =
        s.frequency === "daily"
          ? 86400000
          : s.frequency === "weekly"
            ? 604800000
            : 2592000000;
      if (diff > threshold * 0.9) {
        toast(
          `⚠️ Backup reminder: Your last backup was more than ${getFrequencyLabel(s.frequency)} ago.`,
        );
      }
    }
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    toast.success("Auto-backup settings saved!");
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const snapshot: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          try {
            snapshot[k] = JSON.parse(localStorage.getItem(k) ?? "null");
          } catch {
            snapshot[k] = localStorage.getItem(k);
          }
        }
      }
      await saveBackup(snapshot);
      const updated = { ...settings, lastBackupTime: new Date().toISOString() };
      saveSettings(updated);
      setSettings(updated);
      toast.success("Backup completed and settings updated!");
    } catch {
      toast.error("Backup failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-xl">
      <div>
        <h2 className="text-base font-bold text-foreground">
          Auto Backup Settings
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure automatic backups to IndexedDB local storage
        </p>
      </div>

      <div className="space-y-4 border border-border rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Auto-Backup</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically backup data on schedule
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => setSettings((p) => ({ ...p, enabled: v }))}
            data-ocid="auto_backup.switch"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Backup Frequency</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              How often to run auto-backup
            </p>
          </div>
          <Select
            value={settings.frequency}
            onValueChange={(v) =>
              setSettings((p) => ({
                ...p,
                frequency: v as BackupSettings["frequency"],
              }))
            }
          >
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid="auto_backup.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Backup Reminder</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show toast reminder if backup is overdue
            </p>
          </div>
          <Switch
            checked={settings.reminderEnabled}
            onCheckedChange={(v) =>
              setSettings((p) => ({ ...p, reminderEnabled: v }))
            }
            data-ocid="auto_backup.reminder.switch"
          />
        </div>
      </div>

      <div className="border border-border rounded p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Clock size={13} className="text-muted-foreground" />
          <span className="text-muted-foreground">Last backup:</span>
          <span className="font-medium">
            {settings.lastBackupTime
              ? new Date(settings.lastBackupTime).toLocaleString()
              : "Never"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Clock size={13} className="text-muted-foreground" />
          <span className="text-muted-foreground">Next backup:</span>
          <span className="font-medium">
            {settings.enabled
              ? getNextBackupTime(settings)
              : "Auto-backup disabled"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          data-ocid="auto_backup.save_button"
          className="text-xs"
        >
          <Save size={12} className="mr-1" />
          Save Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRunNow}
          disabled={running}
          data-ocid="auto_backup.primary_button"
          className="text-xs"
        >
          {running ? "Running..." : "Run Backup Now"}
        </Button>
      </div>
    </div>
  );
}
