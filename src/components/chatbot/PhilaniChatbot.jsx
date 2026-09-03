import { useState, useRef, useEffect } from "react";
import { chatbotApi } from "../../services/api/chatbot.js";
import { ApiError } from "../../services/api/client.js";

const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const QUICK_SYMPTOMS = [
  "Headache", "Fever", "Sore throat", "Cough", "Stomach pain",
  "Nausea", "Joint pain", "Fatigue", "Skin rash", "Dizziness",
];

const INIT_MESSAGE = {
  role: "assistant",
  time: ts(),
  content:
    "Hello! I'm **Philani AI**, your personal health assistant.\n\nI can help you understand your symptoms and guide you toward the right care.\n\n*This is for informational purposes only and does not replace professional medical care.*\n\nHow are you feeling today?",
};

// Lightweight markdown-ish renderer: **bold**, *italic*, line breaks.
function Formatted({ text }) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-primary">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={i} className="text-on-surface-variant">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MessageText({ content }) {
  return (
    <div className="space-y-1.5">
      {content.split("\n").map((line, i) =>
        line.trim() ? (
          <p key={i} className="leading-relaxed">
            <Formatted text={line} />
          </p>
        ) : (
          <div key={i} className="h-1.5" />
        )
      )}
    </div>
  );
}

export default function PhilaniChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INIT_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text, time: ts() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    if (offline) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", error: true, time: ts(), content: "You appear to be offline. Please check your connection and try again." },
      ]);
      return;
    }

    setLoading(true);
    abortRef.current = new AbortController();
    try {
      // Server holds the Anthropic key and the safety-check logic; the
      // client just forwards the running conversation history.
      const history = nextMessages
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await chatbotApi.sendMessage(
        { message: text, history },
        { signal: abortRef.current.signal }
      );

      if (data.isEmergency) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            emergency: true,
            time: ts(),
            content:
              "**This sounds like a medical emergency.**\n\nPlease **call 10177 (Emergency Medical Services) immediately** or go to your nearest emergency room.\n\nDo not wait — conditions like heart attacks and strokes are time-critical.",
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply, time: ts() }]);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      const msg =
        err instanceof ApiError
          ? err.message
          : "Something went wrong reaching Philani AI. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", error: true, time: ts(), content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const clear = () => setMessages([INIT_MESSAGE]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Philani AI health assistant"
          className="animate-pulse-ring fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-elevated transition-transform hover:scale-105"
        >
          <span className="material-symbols-outlined text-[26px]">stethoscope</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-4 sm:items-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Philani AI Health Assistant"
            className="relative flex h-[min(680px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg bg-white shadow-elevated animate-fade-in"
          >
            {offline && (
              <div className="flex items-center gap-2 bg-error-container px-4 py-2 text-xs font-medium text-error">
                <span className="material-symbols-outlined text-[16px]">wifi_off</span>
                You are offline
              </div>
            )}

            <div className="flex items-center justify-between border-b border-outline-variant/60 px-4 py-3">
              <div>
                <p className="text-base font-bold text-on-surface">
                  Philani <span className="text-primary">AI</span>
                </p>
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Health Assistant
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clear}
                  title="Clear conversation"
                  className="material-symbols-outlined rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container"
                >
                  delete
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="material-symbols-outlined rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container"
                >
                  close
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
                      m.emergency
                        ? "bg-error-container text-error"
                        : m.error
                        ? "bg-warning-container text-warning"
                        : m.role === "user"
                        ? "bg-primary text-white"
                        : "bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <MessageText content={m.content} />
                    {m.time && (
                      <p className="mt-1 text-[10px] opacity-60">{m.time}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-t border-outline-variant/60 px-3 py-2">
              {QUICK_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="flex-shrink-0 rounded-full border border-primary/30 bg-primary-container/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-container/20 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2 border-t border-outline-variant/60 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder="Describe your symptoms…"
                className="max-h-28 flex-1 resize-none rounded-md border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              {loading ? (
                <button
                  onClick={stop}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-error text-white"
                  aria-label="Stop"
                >
                  <span className="material-symbols-outlined text-[18px]">stop</span>
                </button>
              ) : (
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || offline}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
                  aria-label="Send"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              )}
            </div>

            <div className="border-t border-outline-variant/60 bg-surface-container-low px-3 py-2 text-center text-[11px] text-on-surface-variant">
              For emergencies call{" "}
              <a href="tel:10177" className="font-bold text-error">
                10177
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
