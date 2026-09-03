import { api } from "./client.js";

// The browser NEVER talks to Anthropic directly and never holds an API key.
// It only calls the PhilaLink backend, which proxies to Claude server-side
// (keeping the key in the ASP.NET Core app's configuration/secret store) and
// can also enforce the medication/emergency safety checks again server-side.
export const chatbotApi = {
  /**
   * POST /api/chatbot/message
   * body: { message, history: [{ role, content }] }
   * returns: { reply, isEmergency, missingFields: string[] }
   */
  sendMessage: (payload, opts = {}) =>
    api.post("/api/chatbot/message", payload, { signal: opts.signal }),

  /** GET /api/chatbot/history — resume a persisted conversation for this patient */
  getHistory: () => api.get("/api/chatbot/history"),

  /** DELETE /api/chatbot/history — clear the server-side conversation record */
  clearHistory: () => api.delete("/api/chatbot/history"),
};
