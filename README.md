# Motion-Studio

The codebase behind [theaipound.co.uk](https://theaipound.co.uk) and the publishing pipeline that puts The AI Pound's videos on four platforms.

## What's in here

`docs/` is the website, served by GitHub Pages from this folder:

```
docs/
  index.html                 home: what I do, the three services and their prices
  pilot/                     clinic pilot page: WhatsApp enquiry assistant, two weeks free
  guide/                     free guide landing page (form posts to n8n)
  book/                      free 15-minute audit booking page (form posts to n8n)
  shop/                      the Etsy range, with links to the listings
  privacy/  terms/           policies
  logo.png  robots.txt  sitemap.xml
```

Plain HTML and CSS, no build step, no framework. Edit the file, commit, push, and it's live in about a minute.

## The forms

Both forms post straight to n8n webhooks, which write the lead to a Google Sheet, label where it came from, and notify by Telegram. If a form ever looks broken, check the workflow before the page.

## The publisher

Videos live in `renders/`. A row in a Google Sheet queues a post: title, captions and tags per platform, video path, publish time. The n8n workflow then:

1. Checks the video is committed here, and refuses to publish a file that only exists on a local machine.
2. Uploads and publishes to TikTok, YouTube Shorts, Instagram and Facebook.
3. Writes the live links back to the sheet row.

Nothing publishes without an approval from the owner's phone first. Commit history is the audit trail, so the pipeline can always prove which version of a video went out.

## Working method

Some commits are authored as `Linda (AI Pound)`: an AI agent acting on my instruction, with every change reviewed and approved by me before it ships. That's the same principle the client systems run on.
