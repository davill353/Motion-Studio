# Built Live: 30-minute build challenge shorts

Faceless timed builds: your screen recording + your voice memo → a ~60s vertical short with a countdown timer, speed badge, chapter steps, captions, music, a "BUILT IN mm:ss" stamp and a "Comment AUTOMATE" end card.

## Your part
1. **Record your screen** while you build (Windows: Snipping Tool → Record, or Win + Alt + R). One take, start the recording when you start the timer.
   - Before recording: close email/WhatsApp notifications, and use a **test phone number**, never a customer's.
   - At the end, do the **live test** on screen (send a message, show the reply). Keep the phone screen mirrored or hold it up to the webcam view.
2. **Note the times** (rough is fine): when each step started, when the build was finished, and anywhere an API key or password was on screen.
3. **Record a voice memo** (40–55 seconds) talking through it: hook, each step in one line, the test, "Built in X minutes", "Comment AUTOMATE".
4. Send me the recording, the memo and your notes.

## My part
Fill in an episode file (copy `test-clinic-receptionist.json`), then:

```bash
python3 scripts/make_built_live.py builtlive/<episode>.json
```

Output: `renders/builtlive/<id>.mp4`. The build is sped up to fit the voice memo; the `realtime` parts (the live test) play at normal speed; `blur` boxes hide keys; `zooms` punch in on small text.

## Rules
- Blur every API key, password, email address and phone number.
- If it's built for an imaginary business, label it (`"label": "Demo build"`) and say "demo" in the caption.
- No made-up results ("this got a clinic 40 bookings"). Show what it does, not what it earns.
