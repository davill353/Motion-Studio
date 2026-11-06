// Case study #1: edit facts here. Every number must be real and sourced (see brand.md §6).
export type Result = { value: string; label: string };

export const cs01 = {
  number: 1,
  status: "Demo build · sample data", // keep until it's a live client with permission
  title: "WhatsApp pricing assistant",
  hook: "A WhatsApp\nassistant that\nanswers pricing\nquestions.",
  hookHl: ["whatsapp", "pricing"],
  problem: "Customers ask the same pricing questions all day, while you're busy working.",
  problemHl: ["same", "pricing", "questions"],
  chat: [
    { from: "user" as const, text: "Hi, what are your prices?" },
    { from: "bot" as const, text: "Here's our current price list, taken from our pricing document. Want me to send the full PDF?" },
  ],
  pipeline: [
    { icon: "whatsapp" as const, label: "WhatsApp message" },
    { icon: "agent" as const, label: "AI agent" },
    { icon: "vector" as const, label: "Your documents" },
    { icon: "whatsapp" as const, label: "Instant reply" },
  ],
  buildFacts: ["Built in n8n", "No code", "Built overnight"],
  // Fill in ONLY with real test figures, e.g. { value: "50/50", label: "test questions answered" }
  results: [] as Result[],
  resultsNote: "Demo test figures, not business results",
  // Real client quote, with written permission. Leave null until you have it.
  quote: null as null | { text: string; who: string },
  outro: "Answers from your own documents.\nYou stay in control.",
  outroHl: ["own", "documents"],
};
