"""Generates social-publisher.n8n.json. Run: python3 build_workflow.py"""
import json, uuid, pathlib

nodes, conns = [], {}

def node(name, type_, version, params, pos, creds=None, on_error=None, extra=None):
    n = {"parameters": params, "id": str(uuid.uuid5(uuid.NAMESPACE_URL, name)), "name": name,
         "type": f"n8n-nodes-base.{type_}", "typeVersion": version, "position": pos}
    if creds: n["credentials"] = creds
    if on_error: n["onError"] = on_error
    if extra: n.update(extra)
    nodes.append(n)
    return name

def link(a, b, out=0, inp=0):
    conns.setdefault(a, {"main": []})
    m = conns[a]["main"]
    while len(m) <= out: m.append([])
    m[out].append({"node": b, "index": inp, "type": "main"})

def code(name, js, pos, **kw):
    return node(name, "code", 2, {"jsCode": js.strip()}, pos, **kw)

S = "$('Settings').first().json"
P = "$('Prepare video').first().json"
GV = f"{S}.graphVersion"

CRED_SHEETS = {"googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets account"}}
CRED_TG = {"telegramApi": {"id": "", "name": "Telegram bot"}}
CRED_GH = {"githubApi": {"id": "", "name": "GitHub account"}}
CRED_YT = {"youTubeOAuth2Api": {"id": "", "name": "YouTube account"}}
CRED_META_Q = {"facebookGraphApi": {"id": "", "name": "Facebook Graph account (Page token)"}}
CRED_META_H = {"httpHeaderAuth": {"id": "", "name": "Meta Page token (OAuth header)"}}

def http(name, pos, method, url, *, auth=None, query=None, headers=None, body=None, json_body=None,
         binary_field=None, multipart=None, file_out=None, creds=None, on_error="continueRegularOutput"):
    p = {"method": method, "url": url, "options": {}}
    if auth:
        kind, ctype = auth
        p["authentication"] = kind
        p["nodeCredentialType" if kind == "predefinedCredentialType" else "genericAuthType"] = ctype
    if query:
        p["sendQuery"] = True
        p["queryParameters"] = {"parameters": [{"name": k, "value": v} for k, v in query.items()]}
    if headers:
        p["sendHeaders"] = True
        p["headerParameters"] = {"parameters": [{"name": k, "value": v} for k, v in headers.items()]}
    if json_body is not None:
        p.update({"sendBody": True, "contentType": "json", "specifyBody": "json", "jsonBody": json_body})
    if body is not None:
        p.update({"sendBody": True, "contentType": "form-urlencoded",
                  "bodyParameters": {"parameters": [{"name": k, "value": v} for k, v in body.items()]}})
    if multipart is not None:
        params = []
        for k, v in multipart.items():
            if v == "@binary":
                params.append({"parameterType": "formBinaryData", "name": k, "inputDataFieldName": "video"})
            else:
                params.append({"name": k, "value": v})
        p.update({"sendBody": True, "contentType": "multipart-form-data", "bodyParameters": {"parameters": params}})
    if binary_field:
        p.update({"sendBody": True, "contentType": "binaryData", "inputDataFieldName": binary_field})
    if file_out:
        p["options"] = {"response": {"response": {"responseFormat": "file", "outputPropertyName": file_out}}}
    return node(name, "httpRequest", 4.2, p, pos, creds=creds, on_error=on_error)

# ---------------------------------------------------------------- trigger + settings
node("Every 15 minutes", "scheduleTrigger", 1.2,
     {"rule": {"interval": [{"field": "minutes", "minutesInterval": 15}]}}, [0, 300])

code("Settings", r"""
// ====== EDIT THESE ======
return [{ json: {
  githubOwner: 'davill353',
  githubRepo: 'Motion-Studio',
  githubBranch: 'claude/jolly-tesla-g7il83', // branch the videos live on (change to 'main' once merged)
  telegramChatId: 'PASTE_YOUR_TELEGRAM_CHAT_ID',
  facebookPageId: 'PASTE_FACEBOOK_PAGE_ID',
  instagramUserId: 'PASTE_INSTAGRAM_BUSINESS_ACCOUNT_ID',
  graphVersion: 'v21.0',
  youtubePrivacy: 'private',       // 'private' for testing, then 'public'
  youtubeCategoryId: '28',         // 28 = Science & Technology, 27 = Education
  tiktokMode: 'inbox',             // 'inbox' = draft in your TikTok inbox; 'direct' = publish (needs TikTok audit)
  tiktokPrivacy: 'SELF_ONLY',      // used in direct mode; 'PUBLIC_TO_EVERYONE' after audit
  tiktokClientKey: 'PASTE_TIKTOK_CLIENT_KEY',       // TikTok developer portal > your app > Client key
  tiktokClientSecret: 'PASTE_TIKTOK_CLIENT_SECRET', // keep private; only stored in your n8n
  timezone: 'Europe/London',
}}];
""", [220, 300])
link("Every 15 minutes", "Settings")

node("Read content calendar", "googleSheets", 4.7, {
    "operation": "read",
    "documentId": {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"},
    "sheetName": {"__rl": True, "mode": "name", "value": "Calendar"},
    "options": {}}, [440, 300], creds=CRED_SHEETS)
link("Settings", "Read content calendar")

code("Pick next due post", r"""
// Picks the earliest row with status "ready" whose publish_at time has passed (UK time).
// Accepts the date formats Google Sheets tends to send back.
const tz = $('Settings').first().json.timezone;
const now = DateTime.now().setZone(tz);
const formats = ['yyyy-MM-dd HH:mm', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd H:mm', 'dd/MM/yyyy HH:mm', 'dd/MM/yyyy HH:mm:ss',
  'd/M/yyyy H:mm', 'd/M/yyyy H:mm:ss', 'dd/MM/yyyy', 'd/M/yyyy', 'yyyy-MM-dd'];
const parseWhen = (v) => {
  if (typeof v === 'number') return DateTime.fromMillis(Math.round((v - 25569) * 86400000), { zone: 'utc' }).setZone(tz, { keepLocalTime: true });
  const t = String(v ?? '').trim();
  if (/^\d+(\.\d+)?$/.test(t)) return parseWhen(Number(t));           // Sheets serial date
  for (const f of formats) { const d = DateTime.fromFormat(t, f, { zone: tz }); if (d.isValid) return d; }
  return DateTime.fromISO(t, { zone: tz });
};
const rows = $input.all().map(i => i.json);
const due = rows
  .filter(r => String(r.status || '').trim().toLowerCase() === 'ready')
  .map(r => ({ ...r, _when: parseWhen(r.publish_at) }))
  .filter(r => r._when.isValid && r._when <= now)
  .sort((a, b) => a._when - b._when);
if (!due.length) {
  // Nothing to post. Explain why in the execution log (open this node to read it).
  console.log('No post due. Rows seen:', rows.map(r => `${r.post_id}: status="${r.status}", publish_at="${r.publish_at}" -> ${parseWhen(r.publish_at).isValid ? parseWhen(r.publish_at).toFormat('yyyy-MM-dd HH:mm') : 'UNREADABLE DATE'}`));
  return [];
}
const { _when, ...post } = due[0];      // one post per run keeps things safe and simple
return [{ json: post }];
""", [660, 300])
link("Read content calendar", "Pick next due post")

code("Compliance check", r"""
// Mirrors brand.md section 6. Blocks the post if anything fails.
const p = $input.first().json;
const caps = {
  youtube_title: p.title, caption_youtube: p.caption_youtube, caption_instagram: p.caption_instagram,
  caption_facebook: p.caption_facebook, caption_tiktok: p.caption_tiktok,
};
const issues = [];
for (const [k, v] of Object.entries(caps)) if (!String(v || '').trim()) issues.push(`${k} is empty`);
if (!String(p.video_path || '').trim()) issues.push('video_path is empty');
const all = Object.values(caps).join(' \n ');
const banned = [
  [/guarantee/i, 'guaranteed results'],
  [/\b(cure|cures|cured)\b/i, 'medical claim ("cure")'],
  [/miracle/i, 'hype claim ("miracle")'],
  [/lose\s+\d+\s*(stone|st|lbs?|kg|pounds)/i, 'specific weight-loss amount'],
  [/semaglutide|tirzepatide|ozempic|wegovy|mounjaro|saxenda|liraglutide|botox|botulinum|finasteride/i, 'prescription-only medicine'],
  [/(skinny|weight[- ]?loss|fat)\s*(jab|pen|injection)|\bthe jab\b/i, 'implied prescription-only medicine'],
  [/\[(add|link|todo|result)\]|\bTODO\b/i, 'unfilled placeholder'],
];
for (const [re, why] of banned) if (re.test(all)) issues.push(`Blocked phrase: ${why}`);
if (String(p.is_demo || '').trim().toLowerCase().startsWith('y')) {
  for (const k of ['caption_youtube', 'caption_instagram', 'caption_facebook', 'caption_tiktok'])
    if (!/demo/i.test(String(p[k] || ''))) issues.push(`${k} must say it's a demo`);
}
if (String(p.title || '').length > 100) issues.push('YouTube title is over 100 characters');
for (const k of ['caption_instagram', 'caption_tiktok']) if (String(p[k] || '').length > 2200) issues.push(`${k} is over 2200 characters`);
return [{ json: { ...p, compliance_ok: issues.length === 0, issues } }];
""", [880, 300])
link("Pick next due post", "Compliance check")

node("Passes compliance?", "if", 2.2, {"conditions": {
    "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict", "version": 2},
    "conditions": [{"id": "c1", "leftValue": "={{ $json.compliance_ok }}", "rightValue": True,
                    "operator": {"type": "boolean", "operation": "true", "singleValue": True}}],
    "combinator": "and"}, "options": {}}, [1100, 300])
link("Compliance check", "Passes compliance?")

# --- blocked path
code("Mark blocked", r"""
const p = $input.first().json;
return [{ json: { post_id: p.post_id, status: 'blocked', notes: p.issues.join('; ') } }];
""", [1320, 560])
link("Passes compliance?", "Mark blocked", out=1)
SHEET_UPDATE = lambda: {
    "operation": "update",
    "documentId": {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"},
    "sheetName": {"__rl": True, "mode": "name", "value": "Calendar"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["post_id"], "schema": []},
    "options": {}}
node("Sheet: mark blocked", "googleSheets", 4.7, SHEET_UPDATE(), [1540, 560], creds=CRED_SHEETS, on_error="continueRegularOutput")
link("Mark blocked", "Sheet: mark blocked")
node("Telegram: blocked", "telegram", 1.2, {
    "chatId": f"={{{{ {S}.telegramChatId }}}}",
    "text": "=⛔ Post {{ $('Mark blocked').first().json.post_id }} was NOT published.\n\nCompliance issues:\n{{ $('Mark blocked').first().json.notes }}\n\nFix the row in the sheet and set status back to ready.",
    "additionalFields": {"appendAttribution": False, "parse_mode": "HTML"}}, [1760, 560], creds=CRED_TG)
link("Sheet: mark blocked", "Telegram: blocked")

# --- approval
node("Ask for approval", "telegram", 1.2, {
    "operation": "sendAndWait",
    "chatId": f"={{{{ {S}.telegramChatId }}}}",
    "message": "=📣 Ready to post: {{ $json.title }}\n\n🎬 {{ $json.video_path }}\n🏷 Demo: {{ $json.is_demo }}\n\n▶️ YouTube: {{ $json.caption_youtube }}\n\n📸 Instagram: {{ $json.caption_instagram }}\n\n👍 Facebook: {{ $json.caption_facebook }}\n\n🎵 TikTok: {{ $json.caption_tiktok }}",
    "responseType": "approval",
    "approvalOptions": {"values": {"approvalType": "double", "approveLabel": "Post it", "disapproveLabel": "Not now"}},
    "options": {"limitWaitTime": {"values": {"limitType": "afterTimeInterval", "resumeAmount": 12, "resumeUnit": "hours"}}}},
    [1320, 200], creds=CRED_TG, extra={"webhookId": str(uuid.uuid5(uuid.NAMESPACE_URL, "approval-webhook"))})
link("Passes compliance?", "Ask for approval", out=0)

node("Approved?", "if", 2.2, {"conditions": {
    "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
    "conditions": [{"id": "c2", "leftValue": "={{ $json.data?.approved === true }}", "rightValue": True,
                    "operator": {"type": "boolean", "operation": "true", "singleValue": True}}],
    "combinator": "and"}, "options": {}}, [1540, 200])
link("Ask for approval", "Approved?")

code("Mark declined", r"""
const p = $('Compliance check').first().json;
return [{ json: { post_id: p.post_id, status: 'declined', notes: 'Declined (or no answer) in Telegram' } }];
""", [1760, 400])
link("Approved?", "Mark declined", out=1)
node("Sheet: mark declined", "googleSheets", 4.7, SHEET_UPDATE(), [1980, 400], creds=CRED_SHEETS, on_error="continueRegularOutput")
link("Mark declined", "Sheet: mark declined")

# --- download + prepare
POST = "$('Compliance check').first().json"
http("Download video from GitHub", [1760, 200], "GET",
     f"=https://api.github.com/repos/{{{{ {S}.githubOwner }}}}/{{{{ {S}.githubRepo }}}}/contents/{{{{ {POST}.video_path }}}}",
     auth=("predefinedCredentialType", "githubApi"), query={"ref": f"={{{{ {S}.githubBranch }}}}"},
     headers={"Accept": "application/vnd.github.raw"}, file_out="video", creds=CRED_GH, on_error=None)
link("Approved?", "Download video from GitHub", out=0)

code("Prepare video", r"""
// Re-saves the downloaded file as a proper MP4 (GitHub labels it application/vnd.github.raw,
// and n8n keeps that label in its stored copy, which YouTube rejects).
const post = $('Compliance check').first().json;
const buffer = await this.helpers.getBinaryDataBuffer(0, 'video');
const size = buffer.length;
if (size > 64 * 1024 * 1024) throw new Error('Video is over 64 MB; TikTok single-chunk upload needs <= 64 MB.');
const fileName = post.video_path.split('/').pop() || 'video.mp4';
const video = await this.helpers.prepareBinaryData(buffer, fileName, 'video/mp4');
return [{ json: { ...post, size }, binary: { video } }];
""", [1980, 200])
link("Download video from GitHub", "Prepare video")

# ---------------------------------------------------------------- YouTube
node("YouTube: upload Short", "youTube", 1, {
    "resource": "video", "operation": "upload",
    "title": f"={{{{ {P}.title }}}}",
    "regionCode": "GB",
    "categoryId": f"={{{{ {S}.youtubeCategoryId }}}}",
    "binaryProperty": "video",
    "options": {
        "description": f"={{{{ {P}.caption_youtube }}}}",
        "privacyStatus": f"={{{{ {S}.youtubePrivacy }}}}",
        "selfDeclaredMadeForKids": False,
        "tags": f"={{{{ {P}.tags || '' }}}}"}},
    [2260, -100], creds=CRED_YT, on_error="continueRegularOutput")
link("Prepare video", "YouTube: upload Short")
code("YouTube result", r"""
const j = $input.first().json;
const id = j.id || j.uploadId;
return [{ json: id ? { platform: 'youtube', ok: true, url: `https://youtube.com/shorts/${id}` }
                   : { platform: 'youtube', ok: false, error: JSON.stringify(j.error || j).slice(0, 300) } }];
""", [2480, -100])
link("YouTube: upload Short", "YouTube result")

# ---------------------------------------------------------------- Facebook
http("Facebook: upload video", [2260, 100], "POST",
     f"=https://graph-video.facebook.com/{{{{ {GV} }}}}/{{{{ {S}.facebookPageId }}}}/videos",
     auth=("predefinedCredentialType", "facebookGraphApi"),
     multipart={"source": "@binary", "description": f"={{{{ {P}.caption_facebook }}}}", "title": f"={{{{ {P}.title }}}}"},
     creds=CRED_META_Q)
link("Prepare video", "Facebook: upload video")
code("Facebook result", r"""
const j = $input.first().json;
const page = $('Settings').first().json.facebookPageId;
return [{ json: j.id ? { platform: 'facebook', ok: true, url: `https://www.facebook.com/${page}/videos/${j.id}` }
                     : { platform: 'facebook', ok: false, error: JSON.stringify(j.error || j).slice(0, 300) } }];
""", [2480, 100])
link("Facebook: upload video", "Facebook result")

# ---------------------------------------------------------------- Instagram
http("Instagram: create Reel container", [2260, 300], "POST",
     f"=https://graph.facebook.com/{{{{ {GV} }}}}/{{{{ {S}.instagramUserId }}}}/media",
     auth=("predefinedCredentialType", "facebookGraphApi"),
     json_body=f"={{{{ JSON.stringify({{ media_type: 'REELS', upload_type: 'resumable', share_to_feed: true, caption: {P}.caption_instagram }}) }}}}",
     creds=CRED_META_Q)
link("Prepare video", "Instagram: create Reel container")
code("Attach video (Instagram)", r"""
const j = $input.first().json;
return [{ json: { container_id: j.id, error: j.id ? undefined : (j.error || j) }, binary: $('Prepare video').first().binary }];
""", [2480, 300])
link("Instagram: create Reel container", "Attach video (Instagram)")
http("Instagram: upload video", [2700, 300], "POST",
     f"=https://rupload.facebook.com/ig-api-upload/{{{{ {GV} }}}}/{{{{ $json.container_id }}}}",
     auth=("genericCredentialType", "httpHeaderAuth"),
     headers={"offset": "0", "file_size": f"={{{{ {P}.size }}}}"}, binary_field="video", creds=CRED_META_H)
link("Attach video (Instagram)", "Instagram: upload video")
node("Wait 30 seconds", "wait", 1.1, {"amount": 30, "unit": "seconds"}, [2920, 300],
     extra={"webhookId": str(uuid.uuid5(uuid.NAMESPACE_URL, "ig-wait"))})
link("Instagram: upload video", "Wait 30 seconds")
IGC = "$('Attach video (Instagram)').first().json.container_id"
http("Instagram: check processing", [3140, 300], "GET",
     f"=https://graph.facebook.com/{{{{ {GV} }}}}/{{{{ {IGC} }}}}",
     auth=("predefinedCredentialType", "facebookGraphApi"), query={"fields": "status_code,status"}, creds=CRED_META_Q)
link("Wait 30 seconds", "Instagram: check processing")
node("Instagram ready?", "if", 2.2, {"conditions": {
    "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
    "conditions": [{"id": "c3", "leftValue": "={{ $json.status_code }}", "rightValue": "FINISHED",
                    "operator": {"type": "string", "operation": "equals"}}],
    "combinator": "and"}, "options": {}}, [3360, 300])
link("Instagram: check processing", "Instagram ready?")
node("Keep waiting?", "if", 2.2, {"conditions": {
    "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
    "conditions": [{"id": "c4", "leftValue": "={{ $json.status_code === 'IN_PROGRESS' && $runIndex < 20 }}", "rightValue": True,
                    "operator": {"type": "boolean", "operation": "true", "singleValue": True}}],
    "combinator": "and"}, "options": {}}, [3580, 460])
link("Instagram ready?", "Keep waiting?", out=1)
link("Keep waiting?", "Wait 30 seconds", out=0)
http("Instagram: publish", [3580, 200], "POST",
     f"=https://graph.facebook.com/{{{{ {GV} }}}}/{{{{ {S}.instagramUserId }}}}/media_publish",
     auth=("predefinedCredentialType", "facebookGraphApi"), query={"creation_id": f"={{{{ {IGC} }}}}"}, creds=CRED_META_Q)
link("Instagram ready?", "Instagram: publish", out=0)
http("Instagram: get link", [3800, 200], "GET",
     "=https://graph.facebook.com/{{ " + GV + " }}/{{ $json.id }}",
     auth=("predefinedCredentialType", "facebookGraphApi"), query={"fields": "permalink"}, creds=CRED_META_Q)
link("Instagram: publish", "Instagram: get link")
code("Instagram result", r"""
const j = $input.first().json;
return [{ json: j.permalink ? { platform: 'instagram', ok: true, url: j.permalink }
  : { platform: 'instagram', ok: false, error: JSON.stringify(j.error || j.status || j).slice(0, 300) } }];
""", [4020, 300])
link("Instagram: get link", "Instagram result")
link("Keep waiting?", "Instagram result", out=1)

# ---------------------------------------------------------------- TikTok
node("TikTok: read saved token", "googleSheets", 4.7, {
    "operation": "read",
    "documentId": {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"},
    "sheetName": {"__rl": True, "mode": "name", "value": "TikTok"},
    "options": {}}, [2260, 560], creds=CRED_SHEETS, on_error="continueRegularOutput")
link("Prepare video", "TikTok: read saved token")
http("TikTok: refresh access token", [2480, 560], "POST", "https://open.tiktokapis.com/v2/oauth/token/",
     body={"client_key": f"={{{{ {S}.tiktokClientKey }}}}", "client_secret": f"={{{{ {S}.tiktokClientSecret }}}}",
           "grant_type": "refresh_token", "refresh_token": "={{ $json.refresh_token }}"})
link("TikTok: read saved token", "TikTok: refresh access token")
code("TikTok: token row", r"""
const j = $input.first().json;
if (!j.refresh_token) return [{ json: { name: 'tiktok', last_error: JSON.stringify(j.error || j).slice(0, 200) } }];
return [{ json: { name: 'tiktok', refresh_token: j.refresh_token, open_id: j.open_id, scope: j.scope,
  updated_at: DateTime.now().setZone('Europe/London').toFormat('yyyy-MM-dd HH:mm') } }];
""", [2700, 560])
link("TikTok: refresh access token", "TikTok: token row")
node("TikTok: save new token", "googleSheets", 4.7, {
    "operation": "appendOrUpdate",
    "documentId": {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"},
    "sheetName": {"__rl": True, "mode": "name", "value": "TikTok"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["name"], "schema": []},
    "options": {}}, [2920, 560], creds=CRED_SHEETS, on_error="continueRegularOutput")
link("TikTok: token row", "TikTok: save new token")
http("TikTok: start upload", [3140, 560], "POST",
     f"=https://open.tiktokapis.com/v2/post/publish/{{{{ {S}.tiktokMode === 'direct' ? '' : 'inbox/' }}}}video/init/",
     headers={"Authorization": "=Bearer {{ $('TikTok: refresh access token').first().json.access_token }}"},
     json_body=(f"={{{{ JSON.stringify(Object.assign("
                f"{{ source_info: {{ source: 'FILE_UPLOAD', video_size: {P}.size, chunk_size: {P}.size, total_chunk_count: 1 }} }}, "
                f"{S}.tiktokMode === 'direct' ? {{ post_info: {{ title: {P}.caption_tiktok, privacy_level: {S}.tiktokPrivacy, "
                f"disable_comment: false, disable_duet: false, disable_stitch: false }} }} : {{}})) }}}}"))
link("TikTok: save new token", "TikTok: start upload")
code("Attach video (TikTok)", r"""
const j = $input.first().json;
return [{ json: { upload_url: j.data?.upload_url, publish_id: j.data?.publish_id, error: j.data?.upload_url ? undefined : (j.error || j) },
          binary: $('Prepare video').first().binary }];
""", [3360, 560])
link("TikTok: start upload", "Attach video (TikTok)")
http("TikTok: upload video", [3580, 560], "PUT", "={{ $json.upload_url }}",
     headers={"Content-Type": "video/mp4",
              "Content-Range": f"=bytes 0-{{{{ {P}.size - 1 }}}}/{{{{ {P}.size }}}}"},
     binary_field="video")
link("Attach video (TikTok)", "TikTok: upload video")
code("TikTok result", r"""
// Reports what TikTok actually did with the upload (from the status check).
const a = $('Attach video (TikTok)').first().json;
const s = $input.first().json;
const status = s.data?.status, why = s.data?.fail_reason;
const labels = { SEND_TO_USER_INBOX: 'in your TikTok inbox (Inbox > notifications) as a draft',
  PUBLISH_COMPLETE: 'published', PROCESSING_UPLOAD: 'uploaded, still processing',
  PROCESSING_DOWNLOAD: 'still processing' };
if (a.publish_id && status && status !== 'FAILED')
  return [{ json: { platform: 'tiktok', ok: true, url: labels[status] || status, publish_id: a.publish_id } }];
return [{ json: { platform: 'tiktok', ok: false, error: why || JSON.stringify(a.error || s.error || s).slice(0, 300), publish_id: a.publish_id } }];
""", [3800, 560])
node("Wait 30s (TikTok)", "wait", 1.1, {"amount": 30, "unit": "seconds"}, [3800, 660],
     extra={"webhookId": str(uuid.uuid5(uuid.NAMESPACE_URL, "tt-wait"))})
link("TikTok: upload video", "Wait 30s (TikTok)")
http("TikTok: check status", [4020, 660], "POST", "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
     headers={"Authorization": "=Bearer {{ $('TikTok: refresh access token').first().json.access_token }}"},
     json_body="={{ JSON.stringify({ publish_id: $('Attach video (TikTok)').first().json.publish_id }) }}")
link("Wait 30s (TikTok)", "TikTok: check status")
link("TikTok: check status", "TikTok result")

# ---------------------------------------------------------------- collect + report
node("Collect results", "merge", 3.2, {"numberInputs": 4}, [4240, 200])
link("YouTube result", "Collect results", inp=0)
link("Facebook result", "Collect results", inp=1)
link("Instagram result", "Collect results", inp=2)
link("TikTok result", "Collect results", inp=3)

code("Build summary", r"""
const post = $('Compliance check').first().json;
const r = Object.fromEntries($input.all().map(i => [i.json.platform, i.json]));
const fmt = p => r[p] ? (r[p].ok ? r[p].url : `FAILED: ${r[p].error}`) : 'no result';
const allOk = ['youtube', 'facebook', 'instagram', 'tiktok'].every(p => r[p]?.ok);
const tz = $('Settings').first().json.timezone;
const tiktokDraft = $('Settings').first().json.tiktokMode !== 'direct';
const row = {
  post_id: post.post_id,
  status: allOk ? 'posted' : 'partly posted',
  youtube_url: fmt('youtube'), instagram_url: fmt('instagram'), facebook_url: fmt('facebook'), tiktok_status: fmt('tiktok'),
  posted_at: DateTime.now().setZone(tz).toFormat('yyyy-MM-dd HH:mm'),
};
const text = [
  `${allOk ? '✅' : '⚠️'} ${post.title}`, '',
  `▶️ YouTube: ${row.youtube_url}`, `📸 Instagram: ${row.instagram_url}`,
  `👍 Facebook: ${row.facebook_url}`, `🎵 TikTok: ${row.tiktok_status}`,
  ...(tiktokDraft && r.tiktok?.ok ? ['', 'Open TikTok → inbox → finish the post. Caption to paste:', post.caption_tiktok] : []),
].join('\n');
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
return [{ json: { ...row, _summary: esc(text).slice(0, 3800) } }];
""", [4460, 200])
link("Collect results", "Build summary")
code("Row for sheet", r"""
const { _summary, ...row } = $input.first().json;
return [{ json: row }];
""", [4680, 200])
link("Build summary", "Row for sheet")
node("Sheet: save links", "googleSheets", 4.7, SHEET_UPDATE(), [4900, 200], creds=CRED_SHEETS, on_error="continueRegularOutput")
link("Row for sheet", "Sheet: save links")
node("Telegram: posted summary", "telegram", 1.2, {
    "chatId": f"={{{{ {S}.telegramChatId }}}}",
    "text": "={{ $('Build summary').first().json._summary }}",
    "additionalFields": {"appendAttribution": False, "parse_mode": "HTML"}}, [5120, 200], creds=CRED_TG)
link("Sheet: save links", "Telegram: posted summary")

notes = [
    ("1. Settings: edit your IDs here first", [140, 120]),
    ("2. Compliance gate (brand.md §6), then Telegram approval", [880, 100]),
    ("3. Posts to all four platforms in parallel; a failure on one doesn't stop the others", [2260, -260]),
]
for i, (t, pos) in enumerate(notes):
    nodes.append({"parameters": {"content": f"## {t}", "height": 120, "width": 420},
                  "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"note{i}")), "name": f"Note {i+1}",
                  "type": "n8n-nodes-base.stickyNote", "typeVersion": 1, "position": pos})

wf = {"name": "The AI Pound: Social Publisher (YouTube, Instagram, Facebook, TikTok)",
      "nodes": nodes, "connections": conns, "active": False,
      "settings": {"executionOrder": "v1", "timezone": "Europe/London"}, "pinData": {}}

# sanity checks
names = {n["name"] for n in nodes}
assert len(names) == len(nodes), "duplicate node names"
for a, c in conns.items():
    assert a in names, a
    for outs in c["main"]:
        for t in outs: assert t["node"] in names, t["node"]
out = pathlib.Path(__file__).with_name("social-publisher.n8n.json")
out.write_text(json.dumps(wf, indent=2, ensure_ascii=False))
print(f"wrote {out} with {len(nodes)} nodes")
