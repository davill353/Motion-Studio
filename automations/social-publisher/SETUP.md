# Social Publisher: setup guide

One workflow that posts a video to **YouTube Shorts, Instagram Reels, Facebook and TikTok** at the same time. It runs a compliance check first and asks for your approval on Telegram before anything goes out.

## How it works

```
Every 15 min → read "Calendar" sheet → next post with status "ready" and publish time passed
  → Compliance check (brand.md §6)
      ✗ → mark "blocked" in sheet + Telegram message with the reasons
      ✓ → Telegram: [Post it] [Not now]   (waits up to 12 hours)
            Not now → mark "declined"
            Post it → download video from GitHub
                      ├─ YouTube: upload Short
                      ├─ Facebook: upload video to your Page
                      ├─ Instagram: create Reel → upload → wait until processed → publish
                      └─ TikTok: refresh token → upload (draft in your inbox, or direct post after audit)
                      → save all four links to the sheet + Telegram summary
```

If one platform fails, the others still post, and the summary tells you which one failed and why.

## Files

| File | What it is |
| --- | --- |
| `social-publisher.n8n.json` | The workflow. Import it into n8n (Workflows → ⋯ → Import from file). |
| `content-calendar-template.csv` | Sheet template, pre-filled with case study #1 (status `draft`, so it won't post until you change it). |
| `build_workflow.py` | Generates the JSON. Edit it and re-run if you change the workflow structure. |

## What's been tested

- ✅ Imports cleanly into the current n8n release.
- ✅ A full run with every outside service replaced by a stand-in: picking the due post, the compliance gate, approval, downloading, all four branches in parallel, the Instagram "wait until processed" loop, combining the results, the sheet update and the Telegram summary. The blocked path was tested too.
- ⚠️ **Not tested against the live platforms.** That needs your accounts and keys. Do your first run with the safe settings below.

---

## Step 1: The Google Sheet

1. Create a Google Sheet and name the tab **`Calendar`**.
2. File → Import → upload `content-calendar-template.csv` → "Replace current sheet".
3. Columns:
   - `post_id`: any unique ID
   - `publish_at`: UK time, format `2026-11-10 18:30`
   - `status`: `draft` (ignored), `ready` (will post); the workflow then sets `posted`, `partly posted`, `blocked` or `declined`
   - `video_path`: path in your GitHub repo, e.g. `renders/case-studies/CaseStudy01-Vertical.mp4`
   - `title`: YouTube title (max 100 characters)
   - `caption_youtube`, `caption_instagram`, `caption_facebook`, `caption_tiktok`
   - `tags`: YouTube tags, comma-separated
   - `is_demo`: `yes` / `no`. If `yes`, every caption must contain the word "demo" or the post is blocked.
   - The remaining columns are filled in by the workflow.

## Step 2: Credentials in n8n

Create these in n8n (Credentials → Add credential). The names in brackets are what the workflow expects; after import, open each red node and pick your credential.

### Google Sheets ("Google Sheets account")
Google Sheets OAuth2 API. Sign in with Google.

### Telegram ("Telegram bot")
Use your existing bot token. To get your chat ID, message your bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id`.

### GitHub ("GitHub account")
GitHub API credential with a **fine-grained personal access token**: repository access to `davill353/Motion-Studio` only, with permission **Contents: Read-only**.

### YouTube ("YouTube account")
1. In Google Cloud Console, create a project and enable **YouTube Data API v3**.
2. Set up the OAuth consent screen (External) and add yourself as a test user.
3. Create OAuth client credentials (Web application) using n8n's redirect URL (shown in the n8n credential screen).
4. In n8n, create a YouTube OAuth2 API credential with that client ID and secret, then sign in with the Google account that owns your channel.
5. ⚠️ **Until Google audits your API project, uploads are locked to private.** Apply via the "YouTube API Services – Audit and Quota Extension" form. Meanwhile, set `youtubePrivacy: 'private'` (the default) and make videos public by hand.

### Meta: Facebook Page + Instagram (two credentials, same token)
1. Go to developers.facebook.com → Create app (type: Business). Add **Facebook Login for Business** and **Instagram Graph API**.
2. In Graph API Explorer, generate a user token with: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`.
3. Exchange it for a **long-lived** token, then call `GET /me/accounts` and copy your **Page access token** (made from a long-lived user token, it doesn't expire).
4. Get your IDs:
   - Facebook Page ID: from `/me/accounts`
   - Instagram user ID: `GET /<PAGE_ID>?fields=instagram_business_account`
5. Create **two** credentials in n8n:
   - **"Facebook Graph account (Page token)"**: type *Facebook Graph API*, Access Token = Page token (n8n tests it on Save)
   - **"Meta Page token (OAuth header)"**: type *Header Auth*, Name `Authorization`, Value = `OAuth <Page token>` (used for the Instagram video upload)
6. Your app can post to your own Page and Instagram account in development mode. You only need Meta app review if other people's accounts will use it.

### TikTok ("TikTok app secrets")
1. Go to developers.tiktok.com → Create app → add **Login Kit** and **Content Posting API** (enable "Direct Post" if you want it later). Scopes: `video.upload` (and `video.publish` for direct posting).
2. Authorise your own TikTok account once to get a **refresh token**. TikTok's OAuth uses `client_key`, so do this step outside n8n (TikTok's docs walk through it), or ask me to add a small one-off "Connect TikTok" workflow.
3. In n8n, create a *Custom Auth* credential named **"TikTok app secrets"** with:
   ```json
   { "qs": { "client_key": "YOUR_CLIENT_KEY", "client_secret": "YOUR_CLIENT_SECRET", "refresh_token": "YOUR_REFRESH_TOKEN" } }
   ```
   The workflow uses it to get a fresh access token each run (they last 24 hours; refresh tokens last a year).
   ⚠️ This is the one part I couldn't check against TikTok directly. If the "TikTok: refresh access token" node returns an error, tell me what it says and I'll switch it to the fallback method.
4. **Until TikTok audits your app**, keep `tiktokMode: 'inbox'`. Videos land in your TikTok inbox as drafts, and the Telegram summary gives you the caption to paste. After approval, switch to `tiktokMode: 'direct'` and `tiktokPrivacy: 'PUBLIC_TO_EVERYONE'`.

## Step 3: Settings

Open the **Settings** node and fill in `telegramChatId`, `facebookPageId`, `instagramUserId`, and check `githubBranch`. The videos are currently on `claude/jolly-tesla-g7il83`; change this to `main` once you merge.

## Step 4: First test

1. Keep `youtubePrivacy: 'private'` and `tiktokMode: 'inbox'`.
2. In the sheet, set the case study row to `status = ready` with a `publish_at` in the past.
3. In n8n, click **Execute workflow**. Approve on Telegram, then check the four results.
4. ⚠️ Facebook and Instagram post **publicly** straight away. If you'd rather test quietly, use a test Page / Instagram account first, or delete the posts afterwards.
5. When it all works, toggle the workflow **Active**. It then checks the sheet every 15 minutes.

## Limits to know

- One post per run (every 15 min), on purpose, so you approve one at a time.
- Videos must be ≤ 64 MB (all current renders are about 4–12 MB) and committed to GitHub.
- Instagram Reels: 3 s – 15 min, vertical 9:16 recommended. YouTube Shorts: vertical, up to 3 min.
- Facebook posts to your Page as a video, not as a Facebook Reel. Ask if you want the Reels endpoint instead.
- API rules change. If a platform starts returning errors, the Telegram summary shows the message.
