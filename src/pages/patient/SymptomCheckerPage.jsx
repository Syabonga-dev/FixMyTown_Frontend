import { useState } from "react";
import { Link } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { ErrorState } from "../../components/ui/EmptyState.jsx";
import { symptomCheckerApi } from "../../services/api/clinics.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { ApiError } from "../../services/api/client.js";

const SYMPTOMS = [
  "Headache", "Fever", "Sore throat", "Cough", "Runny nose", "Stomach pain",
  "Nausea", "Vomiting", "Joint pain", "Back pain", "Fatigue", "Skin rash",
  "Dizziness", "Chest tightness",
];

const SEVERITIES = [
  { value: "Mild", desc: "Noticeable but not interfering with daily activities.", icon: "sentiment_satisfied" },
  { value: "Moderate", desc: "Uncomfortable and affecting your daily routine.", icon: "sentiment_neutral" },
  { value: "Severe", desc: "Intense, distressing, or rapidly worsening.", icon: "sentiment_very_dissatisfied" },
];

export default function SymptomCheckerPage() {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState([]);
  const [severity, setSeverity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const toggleSymptom = (s) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const runAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await symptomCheckerApi.assess({ symptoms, severity });
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err instanceof ApiError ? err : new Error("Assessment failed."));
      toast.error("Couldn't complete the assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(1);
    setSymptoms([]);
    setSeverity(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step >= n ? "bg-primary text-on-primary" : "bg-surface-container-highest text-outline"
              }`}
            >
              {step > n ? <span className="material-symbols-outlined text-[16px]">check</span> : n}
            </div>
            {n < 3 && <div className={`h-0.5 flex-1 ${step > n ? "bg-primary" : "bg-outline-variant"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader title="What symptoms are you experiencing?" subtitle="Select all that apply." />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    symptoms.includes(s)
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant bg-white text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  {symptoms.includes(s) && "✓ "}
                  {s}
                </button>
              ))}
            </div>
            <Button
              className="mt-6 w-full"
              disabled={symptoms.length === 0}
              onClick={() => setStep(2)}
            >
              Continue ({symptoms.length} selected)
            </Button>
          </CardBody>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader title="How severe are your symptoms?" subtitle="Be as honest as you can." />
          <CardBody>
            <div className="space-y-3">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  className={`flex w-full items-center gap-4 rounded-md border p-4 text-left transition-colors ${
                    severity === s.value
                      ? "border-primary bg-primary-container/10"
                      : "border-outline-variant bg-white hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-primary">{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{s.value}</p>
                    <p className="text-xs text-on-surface-variant">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {error && <ErrorState className="mt-4" description={error.message} onRetry={runAssessment} />}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!severity}
                loading={loading}
                onClick={runAssessment}
              >
                {loading ? "Assessing…" : "Get assessment"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 3 && result && (
        <Card>
          <CardHeader
            title="Your AI assessment"
            subtitle="Generated by Philani AI — not a substitute for professional care."
          />
          <CardBody>
            {result.isEmergency ? (
              <div className="rounded-md border border-error bg-error-container/50 p-4">
                <p className="text-sm font-bold text-error">
                  This may be a medical emergency. Call 10177 immediately.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-md bg-primary-container/10 p-4">
                  <span className="material-symbols-outlined text-3xl text-primary">verified</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Confidence: {result.confidence ?? "—"}%
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Based on {symptoms.length} symptom{symptoms.length === 1 ? "" : "s"} ·{" "}
                      {severity} severity
                    </p>
                  </div>
                </div>

                {result.possibleConditions?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-semibold text-on-surface">Possible conditions</p>
                    <ul className="space-y-2">
                      {result.possibleConditions.map((c, i) => (
                        <li key={i} className="rounded-md border border-outline-variant/60 p-3 text-sm">
                          <span className="font-semibold text-on-surface">{c.name}</span>
                          {c.description && (
                            <p className="mt-0.5 text-xs text-on-surface-variant">{c.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.advice && (
                  <div className="mb-2 rounded-md bg-surface-container-low p-3 text-sm text-on-surface">
                    {result.advice}
                  </div>
                )}
              </>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={restart} className="flex-1">
                Start over
              </Button>
              <Button as={Link} to="/patient/clinic-finder" className="flex-1" icon="location_on">
                Find a nearby clinic
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
