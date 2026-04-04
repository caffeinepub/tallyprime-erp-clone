export interface AuditEntry {
  id: string;
  timestamp: number;
  username: string;
  role: string;
  action: string;
  module: string;
  details: string;
}

const KEY = "hisabkitab_audit_log";
const MAX = 500;

export function logAuditEvent(
  username: string,
  role: string,
  action: string,
  module: string,
  details: string,
): void {
  const entry: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    username,
    role,
    action,
    module,
    details,
  };
  const existing = getAuditLog();
  const updated = [entry, ...existing].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be unavailable
  }
}

export function getAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

export function clearAuditLog(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
