// IndexedDB helper library for HisabKitab Pro
// Stores: backups, offline_queue, sync_history

const DB_NAME = "hisabkitab_db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("backups")) {
        const store = db.createObjectStore("backups", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp");
      }
      if (!db.objectStoreNames.contains("offline_queue")) {
        db.createObjectStore("offline_queue", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("sync_history")) {
        db.createObjectStore("sync_history", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface BackupRecord {
  id?: number;
  timestamp: string;
  size: number;
  label: string;
  data: string;
  status: "ok" | "error";
}

export interface OfflineQueueItem {
  id?: number;
  timestamp: string;
  type: string;
  description: string;
  payload: unknown;
}

export interface SyncLogItem {
  id?: number;
  timestamp: string;
  itemsSynced: number;
  status: "success" | "failed";
  note?: string;
}

export async function saveBackup(snapshot: object): Promise<void> {
  const db = await openDB();
  const data = JSON.stringify(snapshot);
  const record: BackupRecord = {
    timestamp: new Date().toISOString(),
    size: new Blob([data]).size,
    label: `Backup ${new Date().toLocaleString()}`,
    data,
    status: "ok",
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("backups", "readwrite");
    tx.objectStore("backups").add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBackups(): Promise<BackupRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("backups", "readonly");
    const req = tx.objectStore("backups").getAll();
    req.onsuccess = () => {
      const results = (req.result as BackupRecord[]).sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBackup(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("backups", "readwrite");
    tx.objectStore("backups").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function addToOfflineQueue(
  entry: Omit<OfflineQueueItem, "id">,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readwrite");
    tx.objectStore("offline_queue").add(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readonly");
    const req = tx.objectStore("offline_queue").getAll();
    req.onsuccess = () => resolve(req.result as OfflineQueueItem[]);
    req.onerror = () => reject(req.error);
  });
}

export async function clearOfflineQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readwrite");
    tx.objectStore("offline_queue").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function addSyncLog(log: Omit<SyncLogItem, "id">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sync_history", "readwrite");
    tx.objectStore("sync_history").add(log);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSyncHistory(): Promise<SyncLogItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sync_history", "readonly");
    const req = tx.objectStore("sync_history").getAll();
    req.onsuccess = () => {
      const results = (req.result as SyncLogItem[]).sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}
