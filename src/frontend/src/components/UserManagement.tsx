import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  Edit2,
  KeyRound,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { AppUser } from "../types/rbac";
import { ROLE_LABELS, hashPassword } from "../types/rbac";

const ROLES = ["Admin", "Accountant", "Auditor", "Viewer"] as const;

interface UserForm {
  username: string;
  password: string;
  role: string;
  isActive: boolean;
}

const emptyForm = (): UserForm => ({
  username: "",
  password: "",
  role: "Accountant",
  isActive: true,
});

export default function UserManagement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [pwdUser, setPwdUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rbacActor = actor as any;

  const { data: users = [], isLoading } = useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!rbacActor) return [];
      return (await rbacActor.getAllUsers()) as AppUser[];
    },
    enabled: !!actor,
  });

  const adminCount = users.filter(
    (u) => u.role === "Admin" && u.isActive,
  ).length;

  const createMut = useMutation({
    mutationFn: async (f: UserForm) => {
      if (!rbacActor) throw new Error("No actor");
      const hash = await hashPassword(f.password);
      return rbacActor.createUser(f.username, hash, f.role, null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setShowCreate(false);
      setForm(emptyForm());
    },
    onError: () => toast.error("Failed to create user"),
  });

  const updateMut = useMutation({
    mutationFn: async ({
      user,
      f,
    }: { user: AppUser; f: Partial<UserForm> }) => {
      if (!rbacActor) throw new Error("No actor");
      return rbacActor.updateUser(
        user.id,
        f.username ?? user.username,
        f.role ?? user.role,
        user.companyId,
        f.isActive ?? user.isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
      setEditUser(null);
      setForm(emptyForm());
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: bigint) => {
      if (!rbacActor) throw new Error("No actor");
      return rbacActor.deleteUser(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const changePwdMut = useMutation({
    mutationFn: async ({ id, pwd }: { id: bigint; pwd: string }) => {
      if (!rbacActor) throw new Error("No actor");
      const hash = await hashPassword(pwd);
      return rbacActor.changePassword(id, hash);
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPwdUser(null);
      setNewPassword("");
    },
    onError: () => toast.error("Failed to change password"),
  });

  const openEdit = (user: AppUser) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
  };

  const canDeactivate = (user: AppUser) => {
    if (user.role !== "Admin") return true;
    return adminCount > 1;
  };

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-teal/20 text-teal border-teal/40";
      case "Accountant":
        return "bg-blue-500/15 text-blue-400 border-blue-400/30";
      case "Auditor":
        return "bg-amber-500/15 text-amber-400 border-amber-400/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      data-ocid="user_management.panel"
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield size={16} className="text-teal" />
          <h2 className="text-[14px] font-semibold text-foreground">
            User Management
          </h2>
          <span className="text-[11px] text-muted-foreground border border-border px-2 py-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          type="button"
          data-ocid="user_management.open_modal_button"
          onClick={() => {
            setShowCreate(true);
            setForm(emptyForm());
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] font-medium hover:bg-teal/90 transition-colors"
        >
          <Plus size={12} />
          Create User
          <span className="text-[10px] opacity-70 ml-1">Alt+C</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            data-ocid="user_management.loading_state"
            className="flex items-center justify-center h-40 text-[13px] text-muted-foreground"
          >
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div
            data-ocid="user_management.empty_state"
            className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground"
          >
            <Shield size={32} className="opacity-30" />
            <span className="text-[13px]">No users found</span>
          </div>
        ) : (
          <table
            data-ocid="user_management.table"
            className="w-full border-collapse text-[12px]"
          >
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Username
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={String(user.id)}
                  data-ocid={`user_management.row.item.${idx + 1}`}
                  className="border-b border-border/60 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-teal">
                          {user.username[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] border font-medium ${roleBadgeClass(
                        user.role,
                      )}`}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      data-ocid={`user_management.toggle.${idx + 1}`}
                      disabled={!canDeactivate(user) || updateMut.isPending}
                      onClick={() => {
                        if (!canDeactivate(user)) {
                          toast.error("Cannot deactivate the last Admin user");
                          return;
                        }
                        updateMut.mutate({
                          user,
                          f: { isActive: !user.isActive },
                        });
                      }}
                      className={`flex items-center gap-1.5 px-2 py-0.5 text-[11px] border transition-colors ${
                        user.isActive
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/25"
                          : "bg-muted text-muted-foreground border-border hover:bg-secondary"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {user.isActive ? <Check size={10} /> : <X size={10} />}
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        data-ocid={`user_management.edit_button.${idx + 1}`}
                        onClick={() => openEdit(user)}
                        className="p-1.5 hover:bg-teal/10 text-muted-foreground hover:text-teal transition-colors"
                        title="Edit user"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        data-ocid={`user_management.password.${idx + 1}`}
                        onClick={() => {
                          setPwdUser(user);
                          setNewPassword("");
                        }}
                        className="p-1.5 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400 transition-colors"
                        title="Change password"
                      >
                        <KeyRound size={12} />
                      </button>
                      <button
                        type="button"
                        data-ocid={`user_management.delete_button.${idx + 1}`}
                        onClick={() => setDeleteConfirm(user.id)}
                        disabled={user.role === "Admin" && adminCount <= 1}
                        className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          user.role === "Admin" && adminCount <= 1
                            ? "Cannot delete last Admin"
                            : "Delete user"
                        }
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(showCreate || editUser) && (
        <div
          data-ocid="user_management.dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-card border border-border shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/20">
              <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wide">
                {editUser ? "Edit User" : "Create User"}
              </h3>
              <button
                type="button"
                data-ocid="user_management.close_button"
                onClick={() => {
                  setShowCreate(false);
                  setEditUser(null);
                  setForm(emptyForm());
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* Username */}
              <div>
                <label
                  htmlFor="um-username"
                  className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wide"
                >
                  Username
                </label>
                <input
                  id="um-username"
                  data-ocid="user_management.input"
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-input border border-border text-foreground focus:outline-none focus:border-teal"
                  placeholder="Enter username"
                />
              </div>
              {/* Password (create only) */}
              {!editUser && (
                <div>
                  <label
                    htmlFor="um-password"
                    className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wide"
                  >
                    Password
                  </label>
                  <input
                    id="um-password"
                    data-ocid="user_management.input"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-[12px] bg-input border border-border text-foreground focus:outline-none focus:border-teal"
                    placeholder="Enter password"
                  />
                </div>
              )}
              {/* Role */}
              <div>
                <label
                  htmlFor="um-role"
                  className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wide"
                >
                  Role
                </label>
                <select
                  id="um-role"
                  data-ocid="user_management.select"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-input border border-border text-foreground focus:outline-none focus:border-teal"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              {/* Active (edit only) */}
              {editUser && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Active Status
                  </span>
                  <button
                    type="button"
                    data-ocid="user_management.toggle"
                    onClick={() =>
                      setForm((f) => ({ ...f, isActive: !f.isActive }))
                    }
                    className={`px-3 py-1 text-[11px] border transition-colors ${
                      form.isActive
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-400/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              )}
            </div>
            {/* Admin warning */}
            {editUser &&
              editUser.role === "Admin" &&
              adminCount <= 1 &&
              form.role !== "Admin" && (
                <div className="mx-5 mb-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px]">
                  <AlertCircle size={12} />
                  Warning: This is the last Admin account.
                </div>
              )}
            <div className="flex gap-2 px-5 pb-4">
              <button
                type="button"
                data-ocid="user_management.cancel_button"
                onClick={() => {
                  setShowCreate(false);
                  setEditUser(null);
                  setForm(emptyForm());
                }}
                className="flex-1 py-2 text-[12px] border border-border text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="user_management.submit_button"
                disabled={
                  createMut.isPending ||
                  updateMut.isPending ||
                  !form.username ||
                  (!editUser && !form.password)
                }
                onClick={() => {
                  if (editUser) {
                    updateMut.mutate({ user: editUser, f: form });
                  } else {
                    createMut.mutate(form);
                  }
                }}
                className="flex-1 py-2 text-[12px] bg-teal text-primary-foreground font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
              >
                {createMut.isPending || updateMut.isPending
                  ? "Saving..."
                  : editUser
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {pwdUser && (
        <div
          data-ocid="user_management.dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-card border border-border shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/20">
              <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wide">
                Change Password — {pwdUser.username}
              </h3>
              <button
                type="button"
                data-ocid="user_management.close_button"
                onClick={() => {
                  setPwdUser(null);
                  setNewPassword("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label
                  htmlFor="um-new-password"
                  className="block text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wide"
                >
                  New Password
                </label>
                <input
                  id="um-new-password"
                  data-ocid="user_management.input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] bg-input border border-border text-foreground focus:outline-none focus:border-teal"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="flex gap-2 px-5 pb-4">
              <button
                type="button"
                data-ocid="user_management.cancel_button"
                onClick={() => {
                  setPwdUser(null);
                  setNewPassword("");
                }}
                className="flex-1 py-2 text-[12px] border border-border text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="user_management.confirm_button"
                disabled={changePwdMut.isPending || !newPassword}
                onClick={() =>
                  changePwdMut.mutate({ id: pwdUser.id, pwd: newPassword })
                }
                className="flex-1 py-2 text-[12px] bg-teal text-primary-foreground font-medium hover:bg-teal/90 transition-colors disabled:opacity-50"
              >
                {changePwdMut.isPending ? "Saving..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm !== null && (
        <div
          data-ocid="user_management.dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-card border border-border shadow-2xl w-full max-w-xs">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                  <Trash2 size={14} className="text-destructive" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground">
                    Delete User
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    This action cannot be undone.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-5 pb-4">
              <button
                type="button"
                data-ocid="user_management.cancel_button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-[12px] border border-border text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="user_management.delete_button"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(deleteConfirm)}
                className="flex-1 py-2 text-[12px] bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
