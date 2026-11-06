# Motion Studio

A code-based motion graphics studio built with [Remotion](https://www.remotion.dev) — videos are React components, rendered to MP4 with headless Chromium + FFmpeg.

## Quick start

```bash
npm install
npm run dev            # open Remotion Studio (live preview + timeline)
npm run render:hello   # render the test video to out/hello-studio.mp4
```

Render any composition:

```bash
npx remotion render <CompositionId> out/<name>.mp4
```

## Project layout

```
src/
  index.ts                 # entry point (registerRoot)
  Root.tsx                 # registers all compositions (id, size, fps, duration)
  compositions/
    HelloStudio.tsx        # 3s "Hello from my studio" test video
public/                    # static assets (images, fonts, audio) via staticFile()
renders/                   # committed sample renders
out/                       # local render output (git-ignored)
remotion.config.ts         # render settings
```

## AI Business Summit story reels

Five vertical 1080×1920 Instagram Story reels live in `src/reels/` (rendered copies in `renders/ai-summit-stories/`):

| Reel | Length | Message |
| --- | --- | --- |
| Reel1-AIForYourLife | 12s | AI isn't just for business — it's for your life |
| Reel2-SaveMoney | 14s | Ask AI where your money goes |
| Reel3-SideHustle | 14s | Idea → name → price → first post |
| Reel4-FamilyFinances | 14s | Budget meal planning for the family |
| Reel5-NoTechSkills | 12s | Parents, students, employees, retirees, business owners |

- Change the summit name, tagline and call-to-action for all reels in `src/reels/brand.ts`.
- Text stays within Instagram's story safe zone (clear of the top profile bar and bottom reply bar).
- Re-render all five with `npm run render:stories`.

## Adding a new video

1. Create a component in `src/compositions/`, using `useCurrentFrame()` and `interpolate()` / `spring()` to animate.
2. Register it in `src/Root.tsx` with a `<Composition id="..." />`.
3. Preview with `npm run dev`, then render with `npx remotion render <id>`.

## Notes

- If Remotion can't download its own headless browser (e.g. restricted network), point it at an existing Chromium: `--browser-executable=/path/to/chromium`.
- Remotion has its own license — free for individuals and small teams; see https://www.remotion.dev/license.
