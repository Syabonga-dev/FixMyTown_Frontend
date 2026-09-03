import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const FEATURES = [
  {
    icon: "medication",
    title: "Medication Collections",
    description: "Track chronic medication pickups and never miss a collection date.",
  },
  {
    icon: "psychology_alt",
    title: "AI Symptom Checker",
    description: "Philani AI helps you understand symptoms and know when to seek care.",
  },
  {
    icon: "location_on",
    title: "Smart Clinic Finder",
    description: "Find the nearest clinic with live capacity, on a real map.",
  },
  {
    icon: "family_restroom",
    title: "Proxy Care",
    description: "Trusted family members can help manage care for those who need it.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-outline-variant/60 bg-surface-container-lowest/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="PhilaLink" className="h-9 w-9" />
            <span className="text-xl font-bold text-on-surface">
              Phila<span className="text-primary">Link</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-container/10"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-card hover:bg-[#005555]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            South Africa&apos;s Public Health Portal
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-5xl">
            Your health, connected — from clinic to community.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-on-surface-variant">
            PhilaLink links patients, caregivers, and nurses in one place: chronic medication
            reminders, an AI symptom checker, and a live clinic finder — all built for
            everyday South African healthcare.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-on-primary shadow-card hover:bg-[#005555]"
            >
              Create a patient account
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-primary/30 bg-white px-6 py-3.5 text-base font-semibold text-primary hover:bg-primary-container/10"
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">
            Nurse and Proxy accounts are provisioned by a PhilaLink administrator — reach out
            to your clinic if you need one set up.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary-container/10 blur-2xl" />
          <div className="rounded-xl border border-outline-variant/60 bg-white p-6 shadow-elevated">
            <div className="flex items-center gap-3 border-b border-outline-variant/60 pb-4">
              <img src={logo} alt="" className="h-10 w-10" />
              <div>
                <p className="text-sm font-semibold text-on-surface">Next collection</p>
                <p className="text-xs text-on-surface-variant">Metformin 500mg · 30 tablets</p>
              </div>
              <span className="ml-auto rounded-full bg-success-container px-2.5 py-1 text-xs font-semibold text-success">
                In 3 days
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {FEATURES.slice(0, 2).map((f) => (
                <div key={f.title} className="rounded-md bg-surface-container-low p-3.5">
                  <span className="material-symbols-outlined text-primary">{f.icon}</span>
                  <p className="mt-2 text-xs font-semibold text-on-surface">{f.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/60 bg-surface-container-low py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-on-surface">
            Everything your care team needs
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-outline-variant/60 bg-white p-5 shadow-card"
              >
                <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-md bg-primary-container/10 text-primary">
                  {f.icon}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-on-surface">{f.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-outline-variant/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-on-surface-variant sm:flex-row lg:px-8">
          <span>© {new Date().getFullYear()} PhilaLink. All rights reserved.</span>
          <span>
            For emergencies call <a href="tel:10177" className="font-semibold text-error">10177</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
