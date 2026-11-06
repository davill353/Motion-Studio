# The AI Pound: Brand Guide

> Practical AI for UK businesses: built, tested, and explained in plain English.

Use this file as the single source of truth for every video, post, caption and pitch. If something here conflicts with a request, flag it before publishing.

---

## 1. Who we are

**The AI Pound** designs and builds AI automations and AI-assisted ad creative for UK businesses. Every piece of content shows real workflows (n8n, OpenAI, WhatsApp, Telegram, Google Workspace) and explains how they work, not just what they promise.

**Audience:** UK-based. Use British English (organise, colour, enquiry), £ for money, and UK time and date formats (14:00, 6 November 2026).

### Two lanes

| | Lane 1: AI agents for local businesses | Lane 2: UGC-style ads for health & beauty brands |
| --- | --- | --- |
| **Who** | Restaurants, cafés, gyms, salons, trades (plumbers, electricians, builders) | Skincare, weight-loss and hair-transplant brands and clinics |
| **Problem we solve** | Missed messages, manual bookings and orders, admin after hours | Need for a steady flow of scroll-stopping, compliant short-form ad creative |
| **What we deliver** | WhatsApp/web chat agents, booking and order automation, voice-note assistants, human-in-the-loop approval flows | UGC-style ad concepts, scripts, hooks and AI-assisted video, built inside UK advertising rules |
| **Proof we show** | Workflow walkthroughs, demo builds, measured client results (with permission) | Example concepts labelled as demos, compliance-first scripting, performance data only with client permission |
| **Default CTA** | “Comment AUTOMATE” / “DM me for a free workflow audit” | “DM for a sample ad concept” |

### Two goals

1. **Win clients** in both lanes.
2. **Land a remote senior AI strategist / AI lead role.** All content should also work as a public portfolio. It should show strategy (why this workflow, what it costs, what the risks are), not just tool demos.

---

## 2. Positioning

**One-liner:** *I build AI agents that answer, book and sell for local businesses, and I make compliant UGC-style ads for health and beauty brands.*

**For founders and hiring managers:** *I turn AI from a demo into a working system: scoped, built, tested, governed and measured.*

### Messaging pillars

1. **Show the build.** Every claim is backed by a real workflow on screen.
2. **Human in the loop.** AI drafts; people approve anything customer-facing, medical or money-related.
3. **Plain English.** No jargon without a one-line explanation.
4. **Compliance is a feature.** Especially in Lane 2, staying within ASA/CAP rules is part of the value, not a footnote.
5. **Measured, not hyped.** Numbers are real, sourced and dated, or they don't appear.

---

## 3. Voice and tone

- **Confident, calm, practical.** Write like a senior consultant explaining to a busy owner.
- **British, plain, direct.** Short sentences. Active voice.
- **Avoid:** “game-changer”, “revolutionary”, “10x”, “guaranteed”, “secret”, “hack”, “passive income”, rocket emojis, all-caps hype.
- **Prefer:** “Here's how it works”, “What it does”, “What it doesn't do”, “Built in n8n”, “Tested on…”.
- **Emoji:** at most one per caption, and only if it adds meaning.

---

## 4. Visual identity

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#16233b` | Backgrounds |
| Navy 2 | `#1b2a46` | Background shapes, cards |
| Card | `#1f2f4f` | Workflow nodes, panels |
| Mint | `#6ee7a8` | Accent, highlights, CTAs, logo |
| Teal | `#5eead4` | Gradient partner to mint |
| Text | `#ffffff` / 62% white | Body / secondary |

- **Logo:** mint £ in a rounded square on navy (`public/pound/logo.png`). Don't recolour, stretch or put it on busy imagery.
- **Type:** Inter (800–900 for headlines, 500–600 for body).
- **Motion:** words spring in one by one; workflow nodes light up step by step; data pulses travel along connections. Keep it smooth, not flashy.
- **Formats:** 1080×1920 vertical (TikTok, Reels, Shorts), 1080×1080 square (LinkedIn, feed).
- **Safe zones (vertical):** keep text out of the top 330px, bottom 480px and right 130px.
- **Code:** brand tokens live in `src/pound/theme.ts`.

---

## 5. Content pillars

| Pillar | Lane | Example |
| --- | --- | --- |
| Workflow explainers (Part 1: what it does, Part 2: how it's built) | 1 | “My AI receptionist sorts every enquiry” |
| Case studies | 1 & 2 | Problem → build → result, with real numbers and permission |
| Ad teardown & concept | 2 | Hook, script and compliance notes for a skincare UGC ad |
| Compliance in 60 seconds | 2 | “3 things you can't say in a weight-loss ad in the UK” |
| Strategy notes | Role goal | “How I'd roll out AI in a 20-person business” (LinkedIn) |
| Build in public | Both | Tools, costs, mistakes and lessons |

### Platform playbook

| Platform | Purpose | Length | Notes |
| --- | --- | --- | --- |
| TikTok | Reach, local business owners | 20–60s | Hook in the first 2 seconds; captions on screen |
| Instagram Reels / Stories | Reach + trust | 15–60s | Stories for behind-the-scenes and polls |
| YouTube Shorts | Search + evergreen | 30–60s | Descriptive titles (“WhatsApp AI agent for restaurants, built in n8n”) |
| LinkedIn | Founders, hiring managers | Text post + square video | Strategy, outcomes, governance; less hype, more reasoning |

---

## 6. Compliance (non-negotiable)

Every post, video, ad script and case study must pass this section before publishing. When in doubt, leave it out.

### 6.1 Core rules

1. **No fabricated testimonials, reviews or results.** Only use quotes, reviews, names, logos and figures from real clients, with written permission, kept on file. Never invent “example” quotes that look real. Fake reviews are banned under the Digital Markets, Competition and Consumers Act 2024 and are misleading under the CAP Code.
2. **No prescription-medicine claims.** Prescription-only medicines (for example weight-loss injections such as semaglutide or tirzepatide, Botox and other botulinum toxins, and prescription hair-loss treatments) must not be advertised or promoted to the public in the UK (Human Medicines Regulations 2012; CAP Code section 12). Don't name them, show them, or imply them (“the jab”, “skinny pen”) in ads or organic promotional content for clients.
3. **No guaranteed results.** Never promise outcomes: no “lose 2 stone in 8 weeks”, “guaranteed regrowth”, “clear skin in 7 days”, “never miss a booking again”, “double your revenue”. Use “designed to”, “can help”, “in our test…”.
4. **Label AI-generated and demo content.** Anything showing a demo build, sample data, an AI-generated person or voice, or a simulated chat must be clearly labelled, both on screen and in the caption (e.g. “Demo build, sample data” / “AI-generated demo”).

### 6.2 Lane 2 specifics (health & beauty ads)

- **Substantiation:** every objective claim (“reduces redness”, “clinically proven”) needs evidence held by the brand before it runs (CAP Code section 3, rule 3.7).
- **Cosmetics:** describe cosmetic effects (“looks smoother”, “feels hydrated”); don't make medical claims (“treats acne”, “cures eczema”) unless the product is licensed for that.
- **Weight loss (CAP Code section 13):** no claims about a specific amount or rate of weight loss; don't target under-18s; no before/after imagery that exaggerates or misleads.
- **Cosmetic interventions (incl. hair transplants):** follow ASA guidance: don't trivialise surgery, no time-limited deals that pressure decisions, no targeting under-18s, and no implying guaranteed or permanent results. Before/after images must be real, unedited and representative.
- **Clearly identifiable ads:** UGC-style content made for a brand must be labelled as advertising (e.g. “#ad” or “Ad” upfront), even if it looks organic.
- **AI people and voices:** don't present an AI-generated person as a real customer. Don't use AI to alter results in before/after content.

### 6.3 Lane 1 specifics (local businesses)

- **Data:** don't show real customer names, phone numbers or messages without consent. Use sample data in demos and label it.
- **Accuracy:** say what the agent actually does, including its limits (e.g. “escalates medical questions to a clinician”, “owner approves every order”).
- **Platform names:** WhatsApp, OpenAI, Google and so on are used descriptively, never implying endorsement.

### 6.4 Pre-publish checklist

- [ ] Every number is real, sourced, dated and approved, or it's removed
- [ ] No testimonial or quote unless real and permissioned
- [ ] No prescription-medicine names, images or implications
- [ ] No guaranteed or specific-outcome claims
- [ ] Demo / AI-generated content labelled on screen **and** in the caption
- [ ] Paid or brand content labelled as an ad
- [ ] No personal data shown without consent

---

## 7. Case study format

Every case study follows the same structure:

1. **Client:** sector and UK location (named only with permission).
2. **Status:** *Live client* or *Demo build* (stated on screen and in the caption).
3. **Problem:** one sentence.
4. **Build:** the workflow and tools.
5. **Result:** measured numbers with period and method (e.g. “median first reply: 4h → 40s, over 6 weeks, from WhatsApp timestamps”). For demos: *test* figures only, labelled as such, never presented as business results.
6. **What's next:** one line.

Case study posts live in `posts/<YYYY-MM-DD>-<slug>/` with captions for Instagram, TikTok, YouTube Shorts and LinkedIn, plus a LinkedIn text post.

---

## 8. Handles and links

| Platform | Handle |
| --- | --- |
| TikTok | @theaipound |
| Instagram | `[add]` |
| YouTube | `[add]` |
| LinkedIn | `[add]` |
| Website | `[add]` |
| Contact email | `[add]` |
