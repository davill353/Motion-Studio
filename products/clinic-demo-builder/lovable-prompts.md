# Clinic Demo Builder: Lovable prompts

Paste these into Lovable **one at a time**, in order. Check each step works before moving on.
Goal: type in a clinic's details → get a shareable page where anyone can chat with that clinic's AI assistant (a demo).

---

## Prompt 1: Build the app
```
Build a web app called "Clinic Demo Builder" for my business, The AI Pound (UK).

Purpose: before I meet a beauty or aesthetics clinic, I create a personalised demo of an AI assistant that answers their customers' messages. I show it to the owner on my phone.

Pages:
1. Dashboard (only for me): a list of the demos I've created, with clinic name, date created, and buttons to Open, Edit, Copy link and Delete.
2. Create / Edit demo form with these fields:
   - Clinic name
   - Town
   - Brand colour (colour picker)
   - Logo (optional image upload)
   - Treatments: a table I can add rows to, with treatment name, price (£), duration, and a short note (e.g. "patch test needed 48h before")
   - Opening hours
   - Booking link (URL)
   - Phone / WhatsApp number
   - Tone of voice: Friendly / Professional / Luxury
   - Extra info: free text (parking, aftercare, cancellation policy, etc.)
3. Public demo page at /demo/{clinic-slug}: looks like a WhatsApp-style chat on a phone screen, in the clinic's brand colour with their name and logo at the top. A small badge at the top says "Demo by The AI Pound". Under the chat, show 4 suggested question chips: "How much is a facial?", "Do you have anything Saturday?", "Is Botox safe for me if I'm pregnant?", "Where do I park?"

Design: mobile-first, clean, modern. My brand colours are navy #16233b and mint #6ee7a8, used on the dashboard. UK English and £ prices throughout.

Store demos in the database. Don't build the AI chat replies yet; I'll do that in the next step.
```

## Prompt 2: Make the assistant answer
```
Now make the chat on the demo page answer using AI. Use Lovable's built-in AI if available; otherwise create a backend function that calls an AI model, with the API key stored as a secret (never in the front-end code).

The assistant must follow these rules (put them in the system prompt, filled in with the clinic's details):
- You are the friendly assistant for {clinic name} in {town}. Reply in UK English, in the {tone} tone, in short WhatsApp-style messages (2–3 sentences max).
- Only use the clinic information provided: treatments, prices, hours, booking link, extra info. Never invent prices, treatments, times or offers. If you don't know, say a member of the team will confirm.
- For booking requests, suggest using the booking link or offer to pass their preferred day/time to the team. Never say a booking is confirmed.
- Medical questions (pregnancy, medication, allergies, reactions, side effects, "is this safe for me"): do NOT give medical advice. Say "That's one for our clinician. I've flagged it and they'll get back to you", and show a small "🚩 Flagged to clinician" label under that reply.
- Never claim results ("you'll look 10 years younger"). Be warm, never pushy.
- If someone asks whether they're talking to a person, say you're the clinic's AI assistant and a person can take over any time.

Show a "typing…" indicator while waiting. Keep the conversation history in the browser only (don't save chats to the database).
```

## Prompt 3: Polish for the meeting
```
Polish the demo page for showing to a clinic owner in person:
- Add a "Reset chat" button.
- Add a QR code (on the dashboard, next to each demo) that opens the demo page, so the owner can try it on their own phone.
- Under the chat, add a small section: "Want this answering your real WhatsApp and Instagram messages? Free 2-week pilot · The AI Pound · theaipound.co.uk", with a button "Book a call" linking to https://theaipound.co.uk/book/
- Make sure the page loads fast and looks perfect on an iPhone screen.
```

## Prompt 4: Lock the dashboard
```
Protect the dashboard and the create/edit pages with a login (email + password), so only I can create, edit or delete demos. The public demo pages stay open to anyone with the link. Make sure the database rules stop anyone else from editing or deleting demos.
```

## Prompt 5: Test it
```
Create a sample demo called "Glow Skin Clinic, Bedford" with these treatments: Hydrafacial £95 (60 min), Chemical peel £75 (45 min, patch test 48h before), Lip filler 1ml £180 (45 min, consultation required), LED therapy £40 (30 min). Hours Tue–Sat 9am–6pm. Friendly tone. Extra info: free parking behind the building; 48 hours' notice to cancel.

Then test the chat with these and show me the replies:
1. How much is a Hydrafacial?
2. Do you have anything on Sunday?
3. I'm pregnant, can I have lip filler?
4. Can I book a chemical peel for tomorrow?
5. Do you do laser hair removal?
```
**What good answers look like:** 1 → £95, 60 min. 2 → closed Sundays, offers Tue–Sat. 3 → flagged to clinician, no medical advice. 4 → mentions the 48h patch test, doesn't confirm a booking. 5 → not listed, a team member will confirm (doesn't invent it).

---

## Rules for real clinics
- Only use **public information from the clinic's own website**, and label every demo "Demo by The AI Pound".
- Don't put real customer data into demos. Chats aren't saved.
- Delete a clinic's demo if they ask.

## For the job application (portfolio line)
"Clinic Demo Builder: a Lovable app that turns a clinic's treatments and prices into a branded AI assistant demo in under 5 minutes. Built to support in-person sales; includes medical-question safety rules, no invented prices, and a locked admin."
