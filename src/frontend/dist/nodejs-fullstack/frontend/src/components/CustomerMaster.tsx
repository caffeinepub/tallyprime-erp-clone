import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Company } from "../backend.d";

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  paymentTerms: number;
  status: "Active" | "Inactive";
}

const empty = (): Omit<Customer, "id"> => ({
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  creditLimit: 0,
  paymentTerms: 30,
  status: "Active",
});

export default function CustomerMaster({ company }: { company: Company }) {
  const key = `hkp-customers-${company.id}`;
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(empty());
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(customers));
  }, [customers, key]);

  const save = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setCustomers((c) =>
        c.map((x) => (x.id === editId ? { ...form, id: editId } : x)),
      );
    } else {
      setCustomers((c) => [...c, { ...form, id: Date.now().toString() }]);
    }
    setForm(empty());
    setEditId(null);
    setShowForm(false);
  };

  const edit = (c: Customer) => {
    setForm({ ...c });
    setEditId(c.id);
    setShowForm(true);
  };
  const del = (id: string) => setCustomers((c) => c.filter((x) => x.id !== id));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-foreground">
          Customer Master
        </h2>
        <button
          type="button"
          data-ocid="customer.open_modal_button"
          onClick={() => {
            setForm(empty());
            setEditId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
        >
          <Plus size={13} /> New Customer
        </button>
      </div>

      {showForm && (
        <div
          className="bg-card border border-border rounded p-4 space-y-3"
          data-ocid="customer.dialog"
        >
          <h3 className="text-[13px] font-semibold">
            {editId ? "Edit" : "Add"} Customer
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["name", "Customer Name *", "text"],
                ["contactPerson", "Contact Person", "text"],
                ["phone", "Phone", "text"],
                ["email", "Email", "email"],
                ["creditLimit", "Credit Limit (₹)", "number"],
                ["paymentTerms", "Payment Terms (days)", "number"],
              ] as [keyof typeof form, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
                <input
                  type={type}
                  data-ocid={field === "name" ? "customer.input" : undefined}
                  className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                  value={form[field] as string | number}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [field]:
                        type === "number"
                          ? Number.parseFloat(e.target.value) || 0
                          : e.target.value,
                    }))
                  }
                />
              </div>
            ))}
            <div className="col-span-2">
              <span className="text-[11px] text-muted-foreground">Address</span>
              <input
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">Status</span>
              <select
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as Customer["status"],
                  }))
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="customer.save_button"
              onClick={save}
              className="px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
            >
              Save
            </button>
            <button
              type="button"
              data-ocid="customer.cancel_button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 border border-border text-[12px] rounded hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {[
                "Name",
                "Contact",
                "Phone",
                "Email",
                "Credit Limit",
                "Terms",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-muted-foreground px-3 py-2 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-[12px] text-muted-foreground py-6"
                  data-ocid="customer.empty_state"
                >
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((c, i) => (
              <tr
                key={c.id}
                className="border-b border-border hover:bg-muted/30"
                data-ocid={`customer.item.${i + 1}`}
              >
                <td className="px-3 py-2 text-[12px] font-medium">{c.name}</td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {c.contactPerson}
                </td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {c.phone}
                </td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {c.email}
                </td>
                <td className="px-3 py-2 text-[12px] text-right">
                  ₹{c.creditLimit.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-2 text-[12px] text-center">
                  {c.paymentTerms}d
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-600"}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid={`customer.edit_button.${i + 1}`}
                      onClick={() => edit(c)}
                      className="text-teal hover:opacity-70"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`customer.delete_button.${i + 1}`}
                      onClick={() => del(c.id)}
                      className="text-destructive hover:opacity-70"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
