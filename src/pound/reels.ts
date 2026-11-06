import { FNode } from "./Flow";
import { ReelDef } from "./Reel";

const n = (id: string, label: string, sub: string, icon: FNode["icon"], col: number, row: number): FNode => ({ id, label, sub, icon, col, row });

const P2_NOTE = "Part 2 next: how it's built";
const P1_NOTE = "Missed Part 1? It's on my profile";

/* ---------------- 1. Skin Clinic, Part 1 ---------------- */
const clinic1: ReelDef = {
  id: "01-SkinClinic-Part1",
  tag: "Part 1 of 2",
  scenes: [
    { type: "hook", kicker: "Skin clinic automation", text: "My AI receptionist\nsorts every\nenquiry.", hl: ["ai", "receptionist"], dur: 105 },
    { type: "text", kicker: "The problem", text: "Bookings, medical questions and random messages all land in the same inbox.", hl: ["same", "inbox"], dur: 150 },
    { type: "list", title: "Every enquiry goes\ndown 1 of 4 routes", numbered: true, items: ["Booking request", "Needs a clinician", "Not something done online", "Unclear, so ask"], dur: 200 },
    {
      type: "chat", app: "web", title: "Skin Clinic", label: "Customer on the website",
      msgs: [
        { from: "user", text: "Hi! Can I book a facial for Saturday morning?" },
        { from: "bot", text: "Thanks! Your booking request has been sent to the studio for approval." },
      ],
    },
    {
      type: "chat", app: "telegram", title: "Studio approvals", label: "Meanwhile, the studio gets this",
      msgs: [
        { from: "bot", text: "New booking request: Facial, Saturday morning.", buttons: ["Approve", "Decline"], pick: 0 },
        { from: "bot", text: "Approved. Booking saved to Google Sheets." },
      ],
    },
    {
      type: "chat", app: "web", title: "Skin Clinic", label: "A medical question?",
      msgs: [
        { from: "user", text: "My skin is red after my peel. Is that normal?" },
        { from: "bot", text: "A clinician will review this and get back to you." },
      ],
    },
    { type: "text", text: "…and the clinician gets flagged on Telegram straight away.", hl: ["clinician", "flagged"], size: 80, dur: 110 },
    { type: "text", kicker: "Who it's for", text: "Any clinic, salon or studio that takes bookings.", hl: ["bookings"], size: 90, dur: 130 },
    {
      type: "compare", dur: 220,
      without: ["Replying to every message yourself", "Medical questions buried in the inbox", "Bookings typed up by hand"],
      withIt: ["Instant replies, day or night", "Clinical questions flagged right away", "Approved bookings saved automatically"],
    },
    { type: "end", note: P2_NOTE },
  ],
};

/* ---------------- 2. Skin Clinic, Part 2 ---------------- */
const clinic2: ReelDef = {
  id: "02-SkinClinic-Part2",
  tag: "Part 2 of 2",
  scenes: [
    { type: "hook", kicker: "Skin clinic automation", text: "How my AI\nclinic receptionist\nis built.", hl: ["built"], dur: 90 },
    { type: "shot", src: "pound/wf-clinic.png", aspect: 1380 / 560, label: "The real workflow", dur: 100 },
    {
      type: "flow", label: "Step by step",
      nodes: [
        n("in", "Intake in", "Webhook", "webhook", 0.5, 0),
        n("read", "Read data", "Google Sheets", "sheet", 0.5, 1),
        n("tri", "Triage", "Code", "code", 0.5, 2),
        n("sw", "Enquiry type?", "Switch · 4 routes", "switch", 0.5, 3),
        n("rb", "Reply: booking sent", "Respond to webhook", "reply", 0, 4),
        n("rc", "Reply: clinician", "Respond to webhook", "reply", 1, 4),
        n("ap", "Studio approval", "Telegram · waits", "telegram", 0, 5),
        n("fl", "Flag for clinician", "Telegram", "telegram", 1, 5),
        n("ok", "Approved?", "If", "if", 0, 6),
        n("no", "Reply: not online", "Respond to webhook", "reply", 1, 6),
        n("save", "Save booking", "Google Sheets", "sheet", 0, 7),
        n("cl", "Reply: clarify", "Respond to webhook", "reply", 1, 7),
      ],
      edges: [
        { from: "in", to: "read" }, { from: "read", to: "tri" }, { from: "tri", to: "sw" },
        { from: "sw", to: "rb", label: "booking" }, { from: "sw", to: "rc", label: "clinical" },
        { from: "rb", to: "ap" }, { from: "ap", to: "ok" }, { from: "ok", to: "save", label: "yes" },
        { from: "rc", to: "fl" }, { from: "sw", to: "no", via: "right" }, { from: "sw", to: "cl", via: "right" },
      ],
      steps: [
        { focus: ["*"], title: "The whole flow", body: "One message in. Four possible outcomes. Let's walk through it.", dur: 100 },
        { focus: ["in"], title: "Intake in", body: "A webhook catches the enquiry the moment the customer hits send.", dur: 150 },
        { focus: ["read"], title: "Read data", body: "It pulls the clinic's info from Google Sheets, so it always works from the latest data.", dur: 150 },
        { focus: ["tri"], title: "Triage", body: "A code step reads the message and decides what kind of enquiry it is.", dur: 150 },
        { focus: ["sw"], title: "Enquiry type?", body: "A Switch node sends it down one of four routes.", dur: 130 },
        { focus: ["rb", "ap"], title: "Bookings", body: "The customer gets an instant reply, and the studio gets a Telegram message to approve.", dur: 170 },
        { focus: ["ok", "save"], title: "Approved?", body: "Tap approve and the booking is saved straight into Google Sheets.", dur: 150 },
        { focus: ["rc", "fl"], title: "Clinical questions", body: "The customer is told a clinician will review it, and the clinician is flagged on Telegram.", dur: 170 },
        { focus: ["no", "cl"], title: "Everything else", body: "Not available online? It says so. Unclear? It asks the customer to clarify.", dur: 160 },
      ],
    },
    { type: "list", title: "Built with", items: ["n8n", "Google Sheets", "Telegram", "A website form (webhook)"], dur: 125 },
    { type: "end", note: P1_NOTE },
  ],
};

/* ---------------- 3. Restaurant, Part 1 ---------------- */
const rest1: ReelDef = {
  id: "03-Restaurant-Part1",
  tag: "Part 1 of 2",
  scenes: [
    { type: "hook", kicker: "Restaurant automation", text: "AI that takes\nyour restaurant's\norders.", hl: ["orders"], dur: 105 },
    { type: "text", kicker: "The problem", text: "Orders arrive as messy messages. Someone has to read, price and confirm every single one.", hl: ["every", "single", "one"], dur: 160 },
    {
      type: "chat", app: "web", title: "Order chat", label: "The customer orders",
      msgs: [
        { from: "user", text: "hi can i get 2 chicken burgers, large fries and a coke pls" },
        { from: "bot", text: "Got it: 2 × Chicken Burger, 1 × Large Fries, 1 × Coke. Sending it to the kitchen to confirm." },
      ],
    },
    {
      type: "chat", app: "telegram", title: "Owner approvals", label: "The owner gets this",
      msgs: [
        { from: "bot", text: "New order: 2 × Chicken Burger, 1 × Large Fries, 1 × Coke", buttons: ["Approve", "Hold"], pick: 0 },
        { from: "bot", text: "Approved. Order saved and customer confirmed." },
      ],
    },
    { type: "list", title: "What the AI does", numbered: true, items: ["Reads messy messages", "Matches items to your menu", "Prices the order", "Gets the owner's OK", "Confirms with the customer"], dur: 230 },
    { type: "text", kicker: "You stay in control", text: "Nothing is confirmed until the owner approves it.", hl: ["owner", "approves"], size: 90, dur: 140 },
    { type: "text", kicker: "Order not clear?", text: "It asks the customer instead of guessing.", hl: ["asks"], size: 96, dur: 120 },
    {
      type: "compare", dur: 220,
      without: ["Reading every order by hand", "Pricing mistakes", "Customers left waiting"],
      withIt: ["Orders understood instantly", "Prices from your own menu", "Customers confirmed fast"],
    },
    { type: "text", kicker: "Who it's for", text: "Restaurants, takeaways, cafés and food trucks.", hl: ["takeaways", "cafés"], size: 90, dur: 130 },
    { type: "end", note: P2_NOTE },
  ],
};

/* ---------------- 4. Restaurant, Part 2 ---------------- */
const rest2: ReelDef = {
  id: "04-Restaurant-Part2",
  tag: "Part 2 of 2",
  scenes: [
    { type: "hook", kicker: "Restaurant automation", text: "How my AI\norder assistant\nis built.", hl: ["built"], dur: 90 },
    { type: "shot", src: "pound/wf-restaurant.png", aspect: 1470 / 410, label: "The real workflow", dur: 110 },
    {
      type: "flow", label: "Step by step",
      nodes: [
        n("in", "Order in", "Webhook", "webhook", 0.5, 0),
        n("menu", "Get menu data", "Google Sheets", "sheet", 0.5, 1),
        n("bask", "Build basket", "Code", "code", 0.5, 2),
        n("ai", "Read the order", "OpenAI", "openai", 0.5, 3),
        n("price", "Price the order", "Code", "code", 0.5, 4),
        n("rep", "Reply to customer", "Respond to webhook", "reply", 0.5, 5),
        n("route", "Route", "Switch", "switch", 0.5, 6),
        n("own", "Owner approval", "Telegram · waits", "telegram", 0, 7),
        n("ask", "Ask customer", "Set reply", "edit", 1, 7),
        n("ok", "Approved?", "If", "if", 0, 8),
        n("save", "Save order", "Google Sheets", "sheet", 0, 9),
        n("held", "Held reply", "Set reply", "edit", 1, 9),
        n("conf", "Confirm to customer", "Set reply", "edit", 0, 10),
      ],
      edges: [
        { from: "in", to: "menu" }, { from: "menu", to: "bask" }, { from: "bask", to: "ai" }, { from: "ai", to: "price" },
        { from: "price", to: "rep" }, { from: "rep", to: "route" },
        { from: "route", to: "own", label: "clear" }, { from: "route", to: "ask", label: "unclear" },
        { from: "own", to: "ok" }, { from: "ok", to: "save", label: "yes" }, { from: "ok", to: "held", label: "no" },
        { from: "save", to: "conf" },
      ],
      steps: [
        { focus: ["*"], title: "The whole flow", body: "From a messy message to a confirmed order. Here's every step.", dur: 120 },
        { focus: ["in"], title: "Order in", body: "A webhook receives the customer's order message.", dur: 130 },
        { focus: ["menu"], title: "Get menu data", body: "Your live menu and prices are pulled from Google Sheets.", dur: 140 },
        { focus: ["bask", "ai"], title: "Read the order", body: "The menu is prepared, then OpenAI works out what the customer actually wants.", dur: 170 },
        { focus: ["price"], title: "Price the order", body: "A code step does the maths from your menu, so the AI never makes up a price.", dur: 160 },
        { focus: ["rep"], title: "Instant reply", body: "The customer gets a reply straight away.", dur: 110 },
        { focus: ["route", "ask"], title: "Route", body: "Clear order goes to the owner. Unclear order? It asks the customer.", dur: 150 },
        { focus: ["own", "ok"], title: "Owner approval", body: "The owner gets the order on Telegram and taps approve.", dur: 140 },
        { focus: ["save", "conf"], title: "Saved & confirmed", body: "Approved orders are saved to Google Sheets and confirmed to the customer.", dur: 150 },
        { focus: ["held"], title: "Held", body: "Not approved? The customer gets a 'held' reply instead of silence.", dur: 130 },
      ],
    },
    { type: "end", note: P1_NOTE },
  ],
};

/* ---------------- 5. Voice assistant, Part 1 ---------------- */
const voice1: ReelDef = {
  id: "05-VoiceAssistant-Part1",
  tag: "Part 1 of 2",
  scenes: [
    { type: "hook", kicker: "Voice assistant", text: "I run my day\nwith voice notes.", hl: ["voice", "notes"], dur: 105 },
    { type: "text", kicker: "How it works", text: "Send a voice note on Telegram. AI turns it into action.", hl: ["action"], dur: 140 },
    {
      type: "chat", app: "telegram", title: "My AI assistant", label: "“What's on today?”",
      msgs: [
        { from: "user", voice: "0:03" },
        { from: "bot", text: "Here's your schedule for today: 10:00 client call, 14:00 team meeting." },
      ],
    },
    {
      type: "chat", app: "telegram", title: "My AI assistant", label: "“Add a task”",
      msgs: [
        { from: "user", voice: "0:04" },
        { from: "bot", text: "Task logged: order new packaging." },
      ],
    },
    {
      type: "chat", app: "telegram", title: "My AI assistant", label: "“Email Sarah about Friday”",
      msgs: [
        { from: "user", voice: "0:06" },
        { from: "bot", text: "Draft ready: “Hi Sarah, just confirming our meeting on Friday…”", buttons: ["Send", "Change"], pick: 0 },
        { from: "bot", text: "Sent from Gmail." },
      ],
    },
    { type: "list", title: "One voice note can", items: ["Read out today's calendar", "Log a task to Google Sheets", "Draft and send an email", "Save a new contact"], dur: 200 },
    { type: "list", title: "Perfect for", items: ["Busy business owners", "People always on the move", "Anyone who hates typing"], dur: 190 },
    { type: "text", text: "It's like a PA\nin your pocket.", hl: ["pa", "pocket"], size: 110, dur: 120 },
    { type: "text", text: "And nothing gets emailed until you approve it.", hl: ["approve"], size: 90, dur: 120 },
    { type: "end", note: P2_NOTE },
  ],
};

/* ---------------- 6. Voice assistant, Part 2 ---------------- */
const voice2: ReelDef = {
  id: "06-VoiceAssistant-Part2",
  tag: "Part 2 of 2",
  scenes: [
    { type: "hook", kicker: "Voice assistant", text: "How my voice\nassistant\nis built.", hl: ["built"], dur: 80 },
    { type: "shot", src: "pound/wf-voice.png", aspect: 1440 / 400, label: "The real workflow", dur: 100 },
    {
      type: "flow", label: "Step by step",
      nodes: [
        n("trig", "Telegram Trigger", "New message", "telegram", 0.5, 0),
        n("if", "Voice note?", "If", "if", 0.5, 1),
        n("file", "Get a file", "Telegram", "telegram", 0.5, 2),
        n("tr", "Transcribe", "OpenAI", "openai", 0.5, 3),
        n("model", "Message a model", "OpenAI", "openai", 0.5, 4),
        n("code", "Code in JavaScript", "Code", "code", 0.5, 5),
        n("sw", "Switch", "Schedule · task · email", "switch", 0.5, 6),
        n("cal", "Get today's events", "Google Calendar", "calendar", 0, 7),
        n("row", "Append row", "Google Sheets", "sheet", 1, 7),
        n("sched", "Send schedule", "Telegram", "telegram", 0, 8),
        n("logd", "Confirm task logged", "Telegram", "telegram", 1, 8),
        n("con", "Get contacts", "Google Sheets", "sheet", 0.5, 9),
        n("res", "Resolve recipient", "Code", "code", 0.5, 10),
        n("need", "Need email?", "If", "if", 0, 11),
        n("draft", "Approve draft", "Telegram · waits", "telegram", 1, 11),
        n("addr", "Ask for address", "Telegram · waits", "telegram", 0, 12),
        n("ok", "Approved?", "If", "if", 1, 12),
        n("save", "Save contact", "Google Sheets", "sheet", 0, 13),
        n("gm", "Send a message", "Gmail", "gmail", 1, 13),
        n("chg", "Ask for changes", "Telegram · waits", "telegram", 0.5, 14),
        n("re", "Redraft", "OpenAI", "openai", 0.5, 15),
      ],
      edges: [
        { from: "trig", to: "if" }, { from: "if", to: "file", label: "yes" }, { from: "file", to: "tr" }, { from: "tr", to: "model" },
        { from: "model", to: "code" }, { from: "code", to: "sw" },
        { from: "sw", to: "cal" }, { from: "sw", to: "row" }, { from: "cal", to: "sched" }, { from: "row", to: "logd" },
        { from: "sw", to: "con", via: "right" }, { from: "con", to: "res" },
        { from: "res", to: "need" }, { from: "res", to: "draft" }, { from: "need", to: "addr", label: "yes" }, { from: "addr", to: "save" },
        { from: "draft", to: "ok" }, { from: "ok", to: "gm", label: "yes" }, { from: "ok", to: "chg", label: "no" }, { from: "chg", to: "re" },
        { from: "re", to: "draft", via: "right" },
      ],
      steps: [
        { focus: ["*"], title: "The whole flow", body: "One voice note in. Three jobs it can do. Let's go.", dur: 110 },
        { focus: ["trig", "if"], title: "Voice note in", body: "You send a voice note to your Telegram bot. An If node checks it's audio.", dur: 150 },
        { focus: ["file", "tr"], title: "Transcribe", body: "The audio file is downloaded and OpenAI turns it into text.", dur: 140 },
        { focus: ["model", "code"], title: "Understand", body: "An AI model works out what you want. A code step turns that into clean data.", dur: 150 },
        { focus: ["sw"], title: "Switch", body: "Is it a schedule question, a new task, or an email?", dur: 110 },
        { focus: ["cal", "sched"], title: "Schedule", body: "Pulls today's events from Google Calendar and sends them back to you.", dur: 130 },
        { focus: ["row", "logd"], title: "Task", body: "Adds a row to Google Sheets and confirms on Telegram.", dur: 120 },
        { focus: ["con", "res"], title: "Email", body: "Finds who you mean in your contacts sheet.", dur: 120 },
        { focus: ["need", "addr", "save"], title: "New contact?", body: "No email address saved? It asks you, then saves it for next time.", dur: 140 },
        { focus: ["draft", "ok", "gm"], title: "You approve", body: "You approve the draft on Telegram, then it's sent from Gmail.", dur: 140 },
        { focus: ["chg", "re"], title: "Redraft loop", body: "Want changes? Reply with feedback and AI redrafts until you're happy.", dur: 150 },
      ],
    },
    { type: "end", note: P1_NOTE },
  ],
};

/* ---------------- 7. WhatsApp, Part 1 ---------------- */
const wa1: ReelDef = {
  id: "07-WhatsApp-Part1",
  tag: "Part 1 of 2",
  scenes: [
    { type: "hook", kicker: "WhatsApp automation", text: "Your WhatsApp,\nanswered by AI.\n24/7.", hl: ["ai", "24/7"], dur: 105 },
    { type: "text", kicker: "The problem", text: "Customers message all day. Menu questions, opening times, orders…", hl: ["all", "day"], dur: 140 },
    {
      type: "chat", app: "whatsapp", title: "Restaurant", label: "A question comes in",
      msgs: [
        { from: "user", text: "Do you have any vegan options?" },
        { from: "bot", text: "Yes! I've checked our menu. Here are today's vegan dishes…" },
      ],
    },
    {
      type: "chat", app: "whatsapp", title: "Restaurant", label: "Then they order",
      msgs: [
        { from: "user", text: "Great, 2 vegan wraps for pickup please" },
        { from: "bot", text: "Order received! It's gone to the kitchen and you'll get a confirmation shortly." },
      ],
    },
    { type: "list", title: "It can", items: ["Answer questions, day or night", "Remember the conversation", "Search your business knowledge", "Take orders and pass them on"], dur: 220 },
    { type: "text", kicker: "No guessing", text: "It answers using your own business info.", hl: ["your", "own"], size: 90, dur: 130 },
    { type: "text", text: "Orders go straight into my restaurant order workflow.", hl: ["order", "workflow"], size: 86, dur: 130 },
    {
      type: "compare", dur: 220,
      without: ["Missed messages after hours", "Same questions, again and again", "Orders lost in the chat"],
      withIt: ["Instant replies, 24/7", "Answers from your own info", "Orders captured automatically"],
    },
    { type: "list", title: "Works for", items: ["Restaurants & takeaways", "Salons & clinics", "Shops & local services"], dur: 190 },
    { type: "end", note: P2_NOTE },
  ],
};

/* ---------------- 8. WhatsApp, Part 2 ---------------- */
const wa2: ReelDef = {
  id: "08-WhatsApp-Part2",
  tag: "Part 2 of 2",
  scenes: [
    { type: "hook", kicker: "WhatsApp automation", text: "How my WhatsApp\nAI agent\nis built.", hl: ["built"], dur: 90 },
    {
      type: "flow", label: "Step by step",
      nodes: [
        n("trig", "WhatsApp Trigger", "New message", "whatsapp", 0.5, 0),
        n("menu", "Read the menu", "Google Sheets", "sheet", 0.5, 1),
        n("is", "Looks like an order?", "Code", "code", 0.5, 2),
        n("eng", "Send to order engine", "HTTP request", "http", 1, 3),
        n("orep", "Send order reply", "WhatsApp", "whatsapp", 1, 4),
        n("agent", "AI Agent", "Answers questions", "agent", 0, 5),
        n("send", "Send message", "WhatsApp", "whatsapp", 1, 5),
        n("llm", "Chat model", "OpenAI", "openai", 0, 6),
        n("mem", "Simple Memory", "Remembers the chat", "memory", 1, 6),
        n("vec", "Pinecone", "Vector store", "vector", 0, 7),
        n("emb", "Embeddings", "OpenAI", "openai", 1, 7),
      ],
      edges: [
        { from: "trig", to: "menu" }, { from: "menu", to: "is" },
        { from: "is", to: "eng", label: "order" }, { from: "eng", to: "orep" },
        { from: "is", to: "agent", label: "question" }, { from: "agent", to: "send" },
        { from: "agent", to: "llm", dashed: true }, { from: "agent", to: "mem", dashed: true }, { from: "agent", to: "vec", dashed: true },
        { from: "vec", to: "emb", dashed: true },
      ],
      steps: [
        { focus: ["*"], title: "The whole flow", body: "Two paths: orders and questions. Here's how it decides.", dur: 120 },
        { focus: ["trig"], title: "Message in", body: "Every WhatsApp message triggers the workflow.", dur: 130 },
        { focus: ["menu"], title: "Read the menu", body: "It loads your latest menu from Google Sheets.", dur: 130 },
        { focus: ["is"], title: "Order or question?", body: "A code step checks: does this message look like an order?", dur: 140 },
        { focus: ["eng", "orep"], title: "Orders", body: "Orders are sent to my restaurant order engine, and the customer gets a reply on WhatsApp.", dur: 180 },
        { focus: ["agent", "send"], title: "Questions", body: "Everything else goes to the AI Agent, which replies on WhatsApp.", dur: 150 },
        { focus: ["llm", "mem"], title: "Brain & memory", body: "The agent runs on an OpenAI model, with memory so it remembers the conversation.", dur: 170 },
        { focus: ["vec", "emb"], title: "Knowledge", body: "Pinecone stores your business info. Embeddings let the AI search it by meaning, not just keywords.", dur: 190 },
      ],
    },
    { type: "list", title: "Built with", items: ["n8n", "WhatsApp Business", "OpenAI", "Pinecone", "Google Sheets"], dur: 170 },
    { type: "text", text: "Two workflows.\nOne smooth\ncustomer experience.", hl: ["smooth"], size: 96, dur: 120 },
    { type: "end", note: P1_NOTE },
  ],
};

/* ---------------- 9. Human in the loop ---------------- */
const hitl: ReelDef = {
  id: "09-HumanInTheLoop",
  tag: "AI + you",
  scenes: [
    { type: "hook", kicker: "Human in the loop", text: "AI writes it.\nYou approve it.", hl: ["you", "approve"], dur: 100 },
    { type: "text", kicker: "Why", text: "AI is fast, but you don't want it emailing your leads without checking first.", hl: ["checking"], dur: 150 },
    { type: "shot", src: "pound/wf-loop.png", aspect: 1490 / 550, label: "The real workflow", dur: 100 },
    {
      type: "flow", label: "Step by step",
      nodes: [
        n("form", "Lead enquiry", "Form", "form", 0.5, 0),
        n("llm", "Draft reply", "LLM chain", "openai", 0, 1),
        n("m", "OpenAI Chat Model", "Model", "openai", 1, 1),
        n("ap", "Send & wait", "Telegram approval", "telegram", 0.5, 2),
        n("if", "Approved?", "If", "if", 0.5, 3),
        n("gm", "Send a message", "Gmail", "gmail", 0, 4),
        n("fb", "Ask for edits", "Telegram · waits", "telegram", 1, 4),
        n("ed", "Editor", "LLM chain + OpenAI", "openai", 1, 5),
      ],
      edges: [
        { from: "form", to: "llm" }, { from: "llm", to: "m", dashed: true }, { from: "llm", to: "ap" }, { from: "ap", to: "if" },
        { from: "if", to: "gm", label: "yes" }, { from: "if", to: "fb", label: "no" }, { from: "fb", to: "ed" },
        { from: "ed", to: "ap", via: "right" },
      ],
      steps: [
        { focus: ["*"], title: "The whole flow", body: "A draft, an approval, and a loop until it's right.", dur: 100 },
        { focus: ["form"], title: "Lead enquiry", body: "A new lead fills in your enquiry form.", dur: 110 },
        { focus: ["llm", "m"], title: "AI drafts", body: "An LLM chain with OpenAI writes a personal reply.", dur: 130 },
        { focus: ["ap"], title: "You check it", body: "The draft comes to you on Telegram. The workflow waits for your answer.", dur: 140 },
        { focus: ["if", "gm"], title: "Approve", body: "Happy with it? Tap approve and it goes out from Gmail.", dur: 130 },
        { focus: ["fb", "ed"], title: "Request changes", body: "Not quite right? Say what to change and the editor AI rewrites it.", dur: 150 },
        { focus: ["ap"], title: "Loop", body: "The new draft comes back for approval. It loops until you're happy.", dur: 120 },
      ],
    },
    {
      type: "chat", app: "telegram", title: "Lead approvals", label: "What it looks like",
      msgs: [
        { from: "bot", text: "New lead. Draft: “Hi Jane, thanks for getting in touch! I'd love to help…”", buttons: ["Approve", "Edit"], pick: 1 },
        { from: "user", text: "Shorter, and offer a free call" },
        { from: "bot", text: "Updated draft ready for approval." },
      ],
    },
    { type: "end" },
  ],
};

export const poundReels: ReelDef[] = [clinic1, clinic2, rest1, rest2, voice1, voice2, wa1, wa2, hitl];
