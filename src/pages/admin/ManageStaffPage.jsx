import { useState } from "react";
import { Link } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input, { Select } from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { adminApi } from "../../services/api/admin.js";
import { useToast } from "../../components/ui/Toast.jsx";

export default function ManageStaffPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const { data: staff, loading, error, refetch, setData } = useApi(
    () => adminApi.listStaff(),
    []
  );
  const [pendingId, setPendingId] = useState(null);
  const toast = useToast();

  const filtered = (staff || []).filter((s) => {
    const matchesRole = roleFilter === "All" || s.role === roleFilter;
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const toggleActive = async (member) => {
    setPendingId(member.id);
    const action = member.active ? adminApi.deactivateStaff : adminApi.reactivateStaff;
    try {
      await action(member.id);
      setData((list) =>
        list.map((s) => (s.id === member.id ? { ...s, active: !s.active } : s))
      );
      toast.success(`${member.fullName} ${member.active ? "deactivated" : "reactivated"}.`);
    } catch {
      toast.error("Couldn't update this account. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Manage staff"
        subtitle={`${filtered.length} account${filtered.length === 1 ? "" : "s"}`}
        action={
          <Button as={Link} to="/admin/register-staff" size="sm" icon="person_add">
            Register staff
          </Button>
        }
      />
      <CardBody className="pt-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-44">
            {["All", "Nurse", "Proxy"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="py-10">
            <Spinner label="Loading staff accounts…" />
          </div>
        ) : error ? (
          <ErrorState description={error.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="badge"
            title="No staff accounts found"
            description="Register a Nurse or Proxy account to see it here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/60 text-xs uppercase tracking-wide text-on-surface-variant">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 pr-4 font-semibold text-on-surface">{s.fullName}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{s.role}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{s.phone || s.email || "—"}</td>
                    <td className="py-3 pr-4">
                      <StatusChip tone={s.active ? "success-soft" : "neutral"}>
                        {s.active ? "Active" : "Deactivated"}
                      </StatusChip>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => toggleActive(s)}
                        disabled={pendingId === s.id}
                        className={`text-xs font-semibold hover:underline disabled:opacity-50 ${
                          s.active ? "text-error" : "text-primary"
                        }`}
                      >
                        {pendingId === s.id ? "Updating…" : s.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
