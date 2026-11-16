# UGC ad demos: skincare and hair

Claim-safe spec ads that also work as the portfolio for the £129 three-variant UGC package.
Angle: honesty as the hook. Beauty is the most complained-about ad category in the UK, so instead
of a before/after nobody can substantiate, each ad states what is provable and sells that.

| File | Brand type | Size | Length | Format |
|---|---|---|---|---|
| skincare-no-before-after-9x16.mp4 | skincare | 1080x1920 | 21s | "This ad has no before and after" receipts format |
| skincare-no-before-after-4x5.mp4 | skincare | 1080x1350 | 21s | same cut, feed crop |
| hair-three-minute-rule-9x16.mp4 | haircare | 1080x1920 | 16s | on-screen countdown timer for conditioner dwell time |
| hair-three-minute-rule-4x5.mp4 | haircare | 1080x1350 | 16s | same cut, feed crop |

Each is labelled "example creative" on screen: no invented customer testimonial, no fabricated
results, no "clinically proven". Cloned voice (ElevenLabs), burned-in captions, music bed ducked
under speech. End card: made by The AI Pound, three ads £129.

Re-render: `python3 scripts/build_ugc_ads.py` (needs ELEVENLABS_API_KEY, stills in ugc/img).

## Other formats ready to build
- The label test: turn the bottle round, read the first four ingredients.
- Refund as hook: "if it breaks you out, send it back" said before the product appears.
- Muted ASMR cut: pump click and texture sound, text only, no voice.
- Live chat demo: a real customer question answered on screen by the brand's assistant.
