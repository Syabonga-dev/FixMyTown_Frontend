import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input, { Select } from "../../components/ui/Input.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { adminApi } from "../../services/api/admin.js";
import { ApiError } from "../../services/api/client.js";

const initialForm = {
  role: "Nurse",
  fullName: "",
  idNumber: "",
  employeeNumber: "",
  phone: "",
  email: "",
  clinicAssignment: "",
  temporaryPassword: "",
};

export default function RegisterStaffPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter the staff member's full name.";
    if (!/^\d{13}$/.test(form.idNumber)) next.idNumber = "Enter a valid 13-digit SA ID number.";
    if (form.role === "Nurse" && !form.employeeNumber.trim())
      next.employeeNumber = "Enter an employee / practice number.";
    if (!/^0\d{9}$/.test(form.phone)) next.phone = "Enter a valid SA phone number.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.temporaryPassword.length < 8)
      next.temporaryPassword = "Temporary password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await adminApi.createStaff(form);
      toast.success(`${form.role} account created for ${form.fullName}.`);
      setForm(initialForm);
      navigate("/admin/staff");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const fieldErrors = {};
        Object.entries(err.errors).forEach(([key, msgs]) => {
          fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = Array.isArray(msgs)
            ? msgs[0]
            : msgs;
        });
        setErrors(fieldErrors);
      }
      toast.error(err.message || "Couldn't create the account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader
        title="Register a Nurse or Proxy account"
        subtitle="Public sign-up is patient-only — this is the only way staff accounts get created."
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-md bg-surface-container-low p-1">
            {["Nurse", "Proxy"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  form.role === r
                    ? "bg-white text-primary shadow-card"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {r === "Nurse" ? "medical_services" : "family_restroom"}
                </span>
                {r}
              </button>
            ))}
          </div>

          <Input
            label="Full name"
            value={form.fullName}
            onChange={set("fullName")}
            error={errors.fullName}
            placeholder="Nomsa Dlamini"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SA ID number"
              value={form.idNumber}
              onChange={set("idNumber")}
              error={errors.idNumber}
              placeholder="8505120800083"
              inputMode="numeric"
              maxLength={13}
            />
            <Input
              label="Cellphone number"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
              placeholder="0821234567"
              inputMode="tel"
            />
          </div>

          {form.role === "Nurse" ? (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Employee / practice number"
                value={form.employeeNumber}
                onChange={set("employeeNumber")}
                error={errors.employeeNumber}
                placeholder="NUR-00231"
              />
              <Input
                label="Clinic assignment"
                value={form.clinicAssignment}
                onChange={set("clinicAssignment")}
                placeholder="Gqeberha Community Clinic"
              />
            </div>
          ) : (
            <Input
              label="Related patient (optional — can be linked later)"
              value={form.clinicAssignment}
              onChange={set("clinicAssignment")}
              placeholder="Patient ID or name"
            />
          )}

          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            placeholder="staff@philalink.org"
          />

          <Input
            label="Temporary password"
            type="password"
            value={form.temporaryPassword}
            onChange={set("temporaryPassword")}
            error={errors.temporaryPassword}
            hint="The staff member will be asked to change this on first login."
          />

          <Button type="submit" className="w-full" loading={loading}>
            {loading ? "Creating account…" : `Create ${form.role} account`}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
