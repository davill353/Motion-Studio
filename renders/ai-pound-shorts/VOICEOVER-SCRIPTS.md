# The AI Pound: voiceover scripts

Timestamps match the rendered reels (60s each). The on-screen text is your script: read it, or riff on it in your own words. Aim to finish each line before the next timestamp.

## 01-SkinClinic-Part1 (Part 1 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: My AI receptionist sorts every enquiry. | My AI receptionist sorts every enquiry. |
| 0:04 | Bookings, medical questions and random messages all land in the same inbox. | Bookings, medical questions and random messages all land in the same inbox. |
| 0:09 | Every enquiry goes down 1 of 4 routes: Booking request · Needs a clinician · Not something done online · Unclear, so ask | Every enquiry goes down 1 of 4 routes: Booking request, Needs a clinician, Not something done online, Unclear, so ask. |
| 0:15 | Customer on the website (web chat) | “Hi! Can I book a facial for Saturday morning?” → “Thanks! Your booking request has been sent to the studio for approval.” |
| 0:23 | Meanwhile, the studio gets this (telegram chat) | “New booking request: Facial, Saturday morning.” → “Approved. Booking saved to Google Sheets.” |
| 0:32 | A medical question? (web chat) | “My skin is red after my peel. Is that normal?” → “A clinician will review this and get back to you.” |
| 0:39 | …and the clinician gets flagged on Telegram straight away. | …and the clinician gets flagged on Telegram straight away. |
| 0:43 | Any clinic, salon or studio that takes bookings. | Any clinic, salon or studio that takes bookings. |
| 0:47 | Without vs with | Without automation: replying to every message yourself, medical questions buried in the inbox, bookings typed up by hand. With The AI Pound: instant replies, day or night, clinical questions flagged right away, approved bookings saved automatically. |
| 0:54 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Part 2 next: how it's built. |

## 02-SkinClinic-Part2 (Part 2 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: How my AI clinic receptionist is built. | How my AI clinic receptionist is built. |
| 0:03 | Real n8n workflow screenshot | Here's the real workflow, built in n8n. Let's break it down. |
| 0:06 | The whole flow | One message in. Four possible outcomes. Let's walk through it. |
| 0:10 | Intake in | A webhook catches the enquiry the moment the customer hits send. |
| 0:15 | Read data | It pulls the clinic's info from Google Sheets, so it always works from the latest data. |
| 0:20 | Triage | A code step reads the message and decides what kind of enquiry it is. |
| 0:25 | Enquiry type? | A Switch node sends it down one of four routes. |
| 0:29 | Bookings | The customer gets an instant reply, and the studio gets a Telegram message to approve. |
| 0:35 | Approved? | Tap approve and the booking is saved straight into Google Sheets. |
| 0:40 | Clinical questions | The customer is told a clinician will review it, and the clinician is flagged on Telegram. |
| 0:45 | Everything else | Not available online? It says so. Unclear? It asks the customer to clarify. |
| 0:51 | Built with: n8n · Google Sheets · Telegram · A website form (webhook) | Built with: n8n, Google Sheets, Telegram, A website form (webhook). |
| 0:55 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Missed Part 1? It's on my profile. |

## 03-Restaurant-Part1 (Part 1 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: AI that takes your restaurant's orders. | AI that takes your restaurant's orders. |
| 0:04 | Orders arrive as messy messages. Someone has to read, price and confirm every single one. | Orders arrive as messy messages. Someone has to read, price and confirm every single one. |
| 0:09 | The customer orders (web chat) | “hi can i get 2 chicken burgers, large fries and a coke pls” → “Got it: 2 × Chicken Burger, 1 × Large Fries, 1 × Coke. Sending it to the kitchen to confirm.” |
| 0:17 | The owner gets this (telegram chat) | “New order: 2 × Chicken Burger, 1 × Large Fries, 1 × Coke” → “Approved. Order saved and customer confirmed.” |
| 0:26 | What the AI does: Reads messy messages · Matches items to your menu · Prices the order · Gets the owner's OK · Confirms with the customer | What the AI does: Reads messy messages, Matches items to your menu, Prices the order, Gets the owner's OK, Confirms with the customer. |
| 0:34 | Nothing is confirmed until the owner approves it. | Nothing is confirmed until the owner approves it. |
| 0:39 | It asks the customer instead of guessing. | It asks the customer instead of guessing. |
| 0:43 | Without vs with | Without automation: reading every order by hand, pricing mistakes, customers left waiting. With The AI Pound: orders understood instantly, prices from your own menu, customers confirmed fast. |
| 0:50 | Restaurants, takeaways, cafés and food trucks. | Restaurants, takeaways, cafés and food trucks. |
| 0:54 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Part 2 next: how it's built. |

## 04-Restaurant-Part2 (Part 2 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: How my AI order assistant is built. | How my AI order assistant is built. |
| 0:03 | Real n8n workflow screenshot | Here's the real workflow, built in n8n. Let's break it down. |
| 0:07 | The whole flow | From a messy message to a confirmed order. Here's every step. |
| 0:11 | Order in | A webhook receives the customer's order message. |
| 0:15 | Get menu data | Your live menu and prices are pulled from Google Sheets. |
| 0:20 | Read the order | The menu is prepared, then OpenAI works out what the customer actually wants. |
| 0:25 | Price the order | A code step does the maths from your menu, so the AI never makes up a price. |
| 0:31 | Instant reply | The customer gets a reply straight away. |
| 0:34 | Route | Clear order goes to the owner. Unclear order? It asks the customer. |
| 0:39 | Owner approval | The owner gets the order on Telegram and taps approve. |
| 0:44 | Saved & confirmed | Approved orders are saved to Google Sheets and confirmed to the customer. |
| 0:49 | Held | Not approved? The customer gets a 'held' reply instead of silence. |
| 0:53 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Missed Part 1? It's on my profile. |

## 05-VoiceAssistant-Part1 (Part 1 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: I run my day with voice notes. | I run my day with voice notes. |
| 0:04 | Send a voice note on Telegram. AI turns it into action. | Send a voice note on Telegram. AI turns it into action. |
| 0:08 | “What's on today?” (telegram chat) | [voice note] → “Here's your schedule for today: 10:00 client call, 14:00 team meeting.” |
| 0:16 | “Add a task” (telegram chat) | [voice note] → “Task logged: order new packaging.” |
| 0:22 | “Email Sarah about Friday” (telegram chat) | [voice note] → “Draft ready: “Hi Sarah, just confirming our meeting on Friday…”” → “Sent from Gmail.” |
| 0:33 | One voice note can: Read out today's calendar · Log a task to Google Sheets · Draft and send an email · Save a new contact | One voice note can: Read out today's calendar, Log a task to Google Sheets, Draft and send an email, Save a new contact. |
| 0:40 | Perfect for: Busy business owners · People always on the move · Anyone who hates typing | Perfect for: Busy business owners, People always on the move, Anyone who hates typing. |
| 0:46 | It's like a PA in your pocket. | It's like a PA in your pocket. |
| 0:50 | And nothing gets emailed until you approve it. | And nothing gets emailed until you approve it. |
| 0:54 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Part 2 next: how it's built. |

## 06-VoiceAssistant-Part2 (Part 2 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: How my voice assistant is built. | How my voice assistant is built. |
| 0:03 | Real n8n workflow screenshot | Here's the real workflow, built in n8n. Let's break it down. |
| 0:06 | The whole flow | One voice note in. Three jobs it can do. Let's go. |
| 0:10 | Voice note in | You send a voice note to your Telegram bot. An If node checks it's audio. |
| 0:15 | Transcribe | The audio file is downloaded and OpenAI turns it into text. |
| 0:19 | Understand | An AI model works out what you want. A code step turns that into clean data. |
| 0:24 | Switch | Is it a schedule question, a new task, or an email? |
| 0:28 | Schedule | Pulls today's events from Google Calendar and sends them back to you. |
| 0:32 | Task | Adds a row to Google Sheets and confirms on Telegram. |
| 0:36 | Email | Finds who you mean in your contacts sheet. |
| 0:40 | New contact? | No email address saved? It asks you, then saves it for next time. |
| 0:45 | You approve | You approve the draft on Telegram, then it's sent from Gmail. |
| 0:50 | Redraft loop | Want changes? Reply with feedback and AI redrafts until you're happy. |
| 0:55 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Missed Part 1? It's on my profile. |

## 07-WhatsApp-Part1 (Part 1 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: Your WhatsApp, answered by AI. 24/7. | Your WhatsApp, answered by AI. 24/7. |
| 0:04 | Customers message all day. Menu questions, opening times, orders… | Customers message all day. Menu questions, opening times, orders… |
| 0:08 | A question comes in (whatsapp chat) | “Do you have any vegan options?” → “Yes! I've checked our menu. Here are today's vegan dishes…” |
| 0:15 | Then they order (whatsapp chat) | “Great, 2 vegan wraps for pickup please” → “Order received! It's gone to the kitchen and you'll get a confirmation shortly.” |
| 0:23 | It can: Answer questions, day or night · Remember the conversation · Search your business knowledge · Take orders and pass them on | It can: Answer questions, day or night, Remember the conversation, Search your business knowledge, Take orders and pass them on. |
| 0:30 | It answers using your own business info. | It answers using your own business info. |
| 0:35 | Orders go straight into my restaurant order workflow. | Orders go straight into my restaurant order workflow. |
| 0:39 | Without vs with | Without automation: missed messages after hours, same questions, again and again, orders lost in the chat. With The AI Pound: instant replies, 24/7, answers from your own info, orders captured automatically. |
| 0:46 | Works for: Restaurants & takeaways · Salons & clinics · Shops & local services | Works for: Restaurants & takeaways, Salons & clinics, Shops & local services. |
| 0:53 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Part 2 next: how it's built. |

## 08-WhatsApp-Part2 (Part 2 of 2)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: How my WhatsApp AI agent is built. | How my WhatsApp AI agent is built. |
| 0:03 | The whole flow | Two paths: orders and questions. Here's how it decides. |
| 0:07 | Message in | Every WhatsApp message triggers the workflow. |
| 0:11 | Read the menu | It loads your latest menu from Google Sheets. |
| 0:16 | Order or question? | A code step checks: does this message look like an order? |
| 0:20 | Orders | Orders are sent to my restaurant order engine, and the customer gets a reply on WhatsApp. |
| 0:26 | Questions | Everything else goes to the AI Agent, which replies on WhatsApp. |
| 0:31 | Brain & memory | The agent runs on an OpenAI model, with memory so it remembers the conversation. |
| 0:37 | Knowledge | Pinecone stores your business info. Embeddings let the AI search it by meaning, not just keywords. |
| 0:43 | Built with: n8n · WhatsApp Business · OpenAI · Pinecone · Google Sheets | Built with: n8n, WhatsApp Business, OpenAI, Pinecone, Google Sheets. |
| 0:49 | Two workflows. One smooth customer experience. | Two workflows. One smooth customer experience. |
| 0:53 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. Missed Part 1? It's on my profile. |

## 09-HumanInTheLoop (AI + you)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00 | Hook: AI writes it. You approve it. | AI writes it. You approve it. |
| 0:03 | AI is fast, but you don't want it emailing your leads without checking first. | AI is fast, but you don't want it emailing your leads without checking first. |
| 0:08 | Real n8n workflow screenshot | Here's the real workflow, built in n8n. Let's break it down. |
| 0:12 | The whole flow | A draft, an approval, and a loop until it's right. |
| 0:15 | Lead enquiry | A new lead fills in your enquiry form. |
| 0:19 | AI drafts | An LLM chain with OpenAI writes a personal reply. |
| 0:23 | You check it | The draft comes to you on Telegram. The workflow waits for your answer. |
| 0:28 | Approve | Happy with it? Tap approve and it goes out from Gmail. |
| 0:32 | Request changes | Not quite right? Say what to change and the editor AI rewrites it. |
| 0:37 | Loop | The new draft comes back for approval. It loops until you're happy. |
| 0:41 | What it looks like (telegram chat) | “New lead. Draft: “Hi Jane, thanks for getting in touch! I'd love to help…”” → “Shorter, and offer a free call” → “Updated draft ready for approval.” |
| 0:52 | End card | Follow The AI Pound for more automations. Comment AUTOMATE if you want this built for your business. |
