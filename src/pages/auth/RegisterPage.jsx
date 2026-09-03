import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { ApiError } from "../../services/api/client.js";

const initialForm = {
  fullName: "",
  idNumber: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { registerPatient } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!/^\d{13}$/.test(form.idNumber)) next.idNumber = "Enter a valid 13-digit SA ID number.";
    if (!/^0\d{9}$/.test(form.phone)) next.phone = "Enter a valid SA phone number (e.g. 0821234567).";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await registerPatient({
        fullName: form.fullName,
        idNumber: form.idNumber,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
      });
      toast.success("Account created — let's verify your phone number.");
      navigate("/register/verify", {
        state: { userId: result?.userId ?? result?.id, phone: form.phone },
      });
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
      toast.error(err.message || "Couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-surface-container-low px-4 py-10">
      <Link to="/" className="mb-8 flex items-center gap-2.5">
        <img src={logo} alt="PhilaLink" className="h-9 w-9" />
        <span className="text-xl font-bold text-on-surface">
          Phila<span className="text-primary">Link</span>
        </span>
      </Link>

      <div className="w-full max-w-lg rounded-xl border border-outline-variant/60 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
            1
          </div>
          <div className="h-0.5 flex-1 bg-outline-variant" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-highest text-sm font-bold text-outline">
            2
          </div>
          <div className="h-0.5 flex-1 bg-outline-variant" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-highest text-sm font-bold text-outline">
            3
          </div>
        </div>

        <h1 className="text-2xl font-bold text-on-surface">Create your patient account</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Only patients can self-register. Nurse and Proxy accounts are created for you by a
          PhilaLink administrator.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Full name"
            value={form.fullName}
            onChange={set("fullName")}
            error={errors.fullName}
            placeholder="Thabo Nkosi"
          />
          <Input
            label="SA ID number"
            value={form.idNumber}
            onChange={set("idNumber")}
            error={errors.idNumber}
            placeholder="9001015800082"
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
            hint="We'll text a verification code to this number."
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            placeholder="you@example.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              placeholder="••••••••"
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            {loading ? "Creating account…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
