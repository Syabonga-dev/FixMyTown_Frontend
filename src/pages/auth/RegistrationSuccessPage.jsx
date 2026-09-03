import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import Button from "../../components/ui/Button.jsx";

export default function RegistrationSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-low px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/60 bg-white p-8 text-center shadow-card">
        <span className="material-symbols-outlined mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-container text-4xl text-success">
          check_circle
        </span>
        <div className="mt-4 flex items-center justify-center gap-2">
          <img src={logo} alt="" className="h-6 w-6" />
          <span className="text-sm font-semibold text-on-surface-variant">PhilaLink</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-on-surface">You're all set!</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Your PhilaLink patient account has been created and verified. Log in to see your
          dashboard, medications, and the Philani AI assistant.
        </p>
        <Button as={Link} to="/login" className="mt-6 w-full">
          Go to login
        </Button>
      </div>
    </div>
  );
}
