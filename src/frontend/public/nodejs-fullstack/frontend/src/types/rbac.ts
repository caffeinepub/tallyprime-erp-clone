export interface AppUser {
  id: bigint;
  username: string;
  role: string;
  companyId: bigint | null;
  isActive: boolean;
}

export type UserRole = "Admin" | "Accountant" | "Auditor" | "Viewer";

export const ROLE_LABELS: Record<string, string> = {
  Admin: "Administrator",
  Accountant: "Accountant",
  Auditor: "Auditor",
  Viewer: "Viewer",
};

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
