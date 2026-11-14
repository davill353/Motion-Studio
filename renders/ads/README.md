# Video ads

| File | What it is |
| --- | --- |
| `ad-clinic-pilot-01.mp4` | 19.6s vertical ad (1080x1920, 30fps, silent) for the free two-week clinic pilot. Silent by design: add David's voiceover with `scripts/generate_vo.py` |
| `ad-ugc-lane-01.mp4` | 20.6s vertical ad for the £129 UGC ad service, built by `ad-src/build_ad_ugc_lane.py`. Leads with the rejected-ad problem and the compliance check |

Built from `ad-src/build_ad_clinic_pilot.py`, which renders five branded frames from the two stills and assembles them with 0.3s crossfades.

## To re-cut

Swap `s1.png` and `s2.png` for real footage stills (or film clips and cut them to the same durations), edit the headline strings in the script, re-run it, then lay the voiceover on top. Keep the end card as it is: it carries the offer, the URL and the comment prompt.

## Claims in this cut

Free two-week pilot, no card, 45-minute setup, approval on every reply, prices from the owner's own sheet, clinical questions routed to a person. Nothing here needs a claim audit: no prices promised, no results promised, no comparison to a named competitor.

## Re-cuts

| File | What it is |
| --- | --- |
| `../ai-pound-shorts-vo/03-Restaurant-Part1-RECUT-25s.mp4` | 25.6s re-cut of the restaurant demo. Same voiceover lines, new opening on the £10.90 order, five cards plus a follow card. Built by `scripts/build_recut_restaurant.py` |
