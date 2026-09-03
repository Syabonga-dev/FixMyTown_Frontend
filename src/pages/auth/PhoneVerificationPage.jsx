import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import Button from "../../components/ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { authApi } from "../../services/api/auth.js";
import { ApiError } from "../../services/api/client.js";

export default function PhoneVerificationPage() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);
  const { verifyPhone } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, phone } = location.state || {};

  const handleChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const code = digits.join("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyPhone({ userId, code });
      navigate("/register/success");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendCode({ userId });
      toast.success("A new code has been sent.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
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

      <div className="w-full max-w-md rounded-xl border border-outline-variant/60 bg-white p-8 text-center shadow-card">
        <span className="material-symbols-outlined mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/10 text-3xl text-primary">
          sms
        </span>
        <h1 className="mt-4 text-2xl font-bold text-on-surface">Verify your number</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Enter the 6-digit code we sent to{" "}
          <span className="font-semibold text-on-surface">{phone || "your phone"}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex justify-center gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-11 rounded-md border border-outline-variant text-center text-xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            ))}
          </div>

          <Button type="submit" className="mt-6 w-full" loading={loading}>
            {loading ? "Verifying…" : "Verify & continue"}
          </Button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-4 text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Didn't get a code? Resend"}
        </button>
      </div>
    </div>
  );
}
