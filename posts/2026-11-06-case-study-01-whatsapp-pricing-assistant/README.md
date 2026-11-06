# Case study #1: WhatsApp pricing assistant (demo build)

| | |
| --- | --- |
| **Status** | Demo build, sample data. Not a live client result. |
| **Lane** | 1: AI agents for local businesses |
| **Video (vertical, 25s)** | `renders/case-studies/CaseStudy01-Vertical.mp4` → Instagram Reels, TikTok, YouTube Shorts |
| **Video (square, 25s)** | `renders/case-studies/CaseStudy01-Square.mp4` → LinkedIn |
| **Source** | `src/casestudy/cs01.ts` (edit facts here, then re-render) |
| **Facts used** | From your TikTok caption: built overnight, no code, answers pricing questions from the business's own documents. Built in n8n. |

## Pre-publish checklist (brand.md §6.4)

- [x] No numbers shown, because no test figures have been supplied yet
- [x] No testimonial (the client's quote is pending; add it only once you have written permission)
- [x] No prescription-medicine content
- [x] No guaranteed outcomes
- [x] "Demo build · sample data" on screen throughout **and** in every caption below
- [ ] Before posting: replace `[link]` placeholders if you want a direct link instead of "link in bio"

**To add results later:** put real test figures in `results` in `src/casestudy/cs01.ts` (e.g. `{ value: "50/50", label: "test questions answered" }`). A "Test results" scene then switches on automatically. Re-render with:

```bash
npx remotion render CaseStudy01-Vertical renders/case-studies/CaseStudy01-Vertical.mp4 --crf=18
```

---

## Instagram (Reels)

> Case study #1: a WhatsApp assistant that answers pricing questions from the business's own documents.
>
> Customers ask the same "how much is…?" questions all day. This assistant reads the business's price documents and replies on WhatsApp straight away, built in n8n with no code.
>
> Demo build with sample data, so no client results yet. Real numbers coming in the next case study.
>
> Comment AUTOMATE if you want one for your business.
>
> #AIAutomation #SmallBusinessUK #WhatsAppBusiness #n8n #AIForBusiness #UKSmallBusiness #BuildInPublic

## TikTok

> Case study #1: WhatsApp assistant that answers pricing questions from your own docs 📄 Built overnight in n8n, no code. Demo build, sample data. Comment AUTOMATE and I'll show you how it works.
>
> #AIAutomation #n8n #SmallBusinessUK #AIassistant #buildinpublic

## YouTube Shorts

**Title:** WhatsApp AI assistant that answers pricing questions (n8n demo build) | Case study #1

**Description:**

> A WhatsApp assistant that answers customers' pricing questions using the business's own documents. Built in n8n with no code.
>
> How it works: WhatsApp message → AI agent → searches your documents → instant reply.
>
> This is a demo build using sample data, not a live client result.
>
> Follow The AI Pound for practical AI automations for UK small businesses. Links: linktr.ee/theaipound
>
> #AIAutomation #n8n #SmallBusinessUK #Shorts

## LinkedIn (caption for the square video)

> Case study #1 (demo build): a WhatsApp assistant that answers pricing questions from the business's own documents.
>
> WhatsApp message → AI agent → the business's documents → instant reply. Built in n8n, no code.
>
> Sample data for now. I'll share measured results once it's running with a live client.
>
> #AI #Automation #SmallBusiness #n8n

---

## LinkedIn text post (for founders)

> Most small businesses don't need "an AI strategy". They need the same five questions answered properly, at 9pm, without the founder picking up the phone.
>
> So my first case study is deliberately boring:
>
> A WhatsApp assistant that answers pricing questions using the business's own documents.
>
> How it works:
> → A customer messages on WhatsApp
> → An AI agent searches the business's own pricing documents
> → It replies with the answer from those documents, not a guess
> → Anything it can't answer goes to a human
>
> I built it overnight in n8n, without writing code.
>
> Three things I'd tell any founder thinking about this:
>
> 1. Start with the question you answer most, not the most impressive use case.
> 2. Ground the AI in your own documents. It shouldn't be making up prices.
> 3. Keep a human in the loop for anything involving money, health or complaints.
>
> To be clear: this is a demo build with sample data, not a client result. I'll share real, measured numbers when I have them, and I won't share them before.
>
> If you run a restaurant, gym, salon, café or trade business and want to know what this would look like for you, comment or DM me "AUTOMATE".
>
> #AI #Automation #SmallBusiness #UKBusiness #AIStrategy
