"""Generates connect-tiktok.n8n.json: a one-off helper that signs your TikTok account in and saves the refresh token.
Run: python3 build_connect_tiktok.py"""
import json, uuid, pathlib
nodes, conns = [], {}
def node(name, type_, version, params, pos, **extra):
    n = {"parameters": params, "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "ct-" + name)), "name": name,
         "type": f"n8n-nodes-base.{type_}", "typeVersion": version, "position": pos}
    n.update(extra); nodes.append(n)
def link(a, b, out=0):
    m = conns.setdefault(a, {"main": []})["main"]
    while len(m) <= out: m.append([])
    m[out].append({"node": b, "index": 0, "type": "main"})
SHEETS = {"googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets account"}}
N8N = "https://davill353.app.n8n.cloud"

node("Start: open this link", "webhook", 2, {"httpMethod": "GET", "path": "tiktok-connect", "responseMode": "responseNode", "options": {}},
     [0, 200], webhookId=str(uuid.uuid5(uuid.NAMESPACE_URL, "tiktok-connect")))
node("TikTok callback", "webhook", 2, {"httpMethod": "GET", "path": "tiktok-callback", "responseMode": "responseNode", "options": {}},
     [0, 420], webhookId=str(uuid.uuid5(uuid.NAMESPACE_URL, "tiktok-callback")))
node("TikTok app", "code", 2, {"jsCode": f"""
// ====== EDIT THESE (TikTok developer portal > your app > Sandbox or Production > Client key / Client secret) ======
const clientKey = 'PASTE_TIKTOK_CLIENT_KEY';
const clientSecret = 'PASTE_TIKTOK_CLIENT_SECRET';
// ==================================================================================================================
const redirectUri = '{N8N}/webhook/tiktok-callback';
const q = $input.first().json.query || {{}};
const authUrl = 'https://www.tiktok.com/v2/auth/authorize/?' + new URLSearchParams({{
  client_key: clientKey, response_type: 'code', scope: 'user.info.basic,video.upload,video.publish',
  redirect_uri: redirectUri, state: Math.random().toString(36).slice(2) }}).toString();
return [{{ json: {{ step: q.code ? 'callback' : (q.error ? 'error' : 'start'), code: q.code, error: q.error_description || q.error,
  clientKey, clientSecret, redirectUri, authUrl }} }}];
""".strip()}, [240, 300])
link("Start: open this link", "TikTok app"); link("TikTok callback", "TikTok app")
node("Which step?", "switch", 3.2, {"rules": {"values": [
    {"conditions": {"options": {"caseSensitive": True, "typeValidation": "strict", "version": 2}, "combinator": "and",
        "conditions": [{"leftValue": "={{ $json.step }}", "rightValue": "start", "operator": {"type": "string", "operation": "equals"}}]},
     "renameOutput": True, "outputKey": "start"},
    {"conditions": {"options": {"caseSensitive": True, "typeValidation": "strict", "version": 2}, "combinator": "and",
        "conditions": [{"leftValue": "={{ $json.step }}", "rightValue": "callback", "operator": {"type": "string", "operation": "equals"}}]},
     "renameOutput": True, "outputKey": "callback"}]},
    "options": {"fallbackOutput": "extra", "renameFallbackOutput": "error"}}, [460, 300])
link("TikTok app", "Which step?")
node("Send to TikTok login", "respondToWebhook", 1.1, {"respondWith": "redirect", "redirectURL": "={{ $json.authUrl }}", "options": {}}, [700, 120])
link("Which step?", "Send to TikTok login", 0)
node("Swap code for tokens", "httpRequest", 4.2, {"method": "POST", "url": "https://open.tiktokapis.com/v2/oauth/token/",
    "sendBody": True, "contentType": "form-urlencoded", "bodyParameters": {"parameters": [
        {"name": "client_key", "value": "={{ $json.clientKey }}"}, {"name": "client_secret", "value": "={{ $json.clientSecret }}"},
        {"name": "code", "value": "={{ $json.code }}"}, {"name": "grant_type", "value": "authorization_code"},
        {"name": "redirect_uri", "value": "={{ $json.redirectUri }}"}]}, "options": {}}, [700, 300], onError="continueRegularOutput")
link("Which step?", "Swap code for tokens", 1)
node("Token row", "code", 2, {"jsCode": """
const j = $input.first().json;
if (!j.refresh_token) throw new Error('TikTok did not return a token: ' + JSON.stringify(j.error || j).slice(0, 300));
return [{ json: { name: 'tiktok', refresh_token: j.refresh_token, open_id: j.open_id, scope: j.scope,
  updated_at: DateTime.now().setZone('Europe/London').toFormat('yyyy-MM-dd HH:mm') } }];
""".strip()}, [920, 300], onError="continueErrorOutput")
link("Swap code for tokens", "Token row")
node("Save to sheet (TikTok tab)", "googleSheets", 4.7, {"operation": "appendOrUpdate",
    "documentId": {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"},
    "sheetName": {"__rl": True, "mode": "name", "value": "TikTok"},
    "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["name"], "schema": []}, "options": {}},
    [1140, 240], credentials=SHEETS)
link("Token row", "Save to sheet (TikTok tab)", 0)
page = lambda title, msg: ("=<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'>"
    "<body style=\"font-family:system-ui;background:#16233b;color:#fff;display:grid;place-items:center;min-height:90vh;text-align:center\">"
    f"<div><h1 style='color:#6ee7a8'>{title}</h1><p>{msg}</p></div></body>")
html = {"respondWith": "text", "options": {"responseHeaders": {"entries": [{"name": "Content-Type", "value": "text/html; charset=utf-8"}]}}}
node("Show: connected", "respondToWebhook", 1.1, {**html, "responseBody": page("TikTok connected ✅", "Your TikTok account is linked to The AI Pound Publisher. You can close this tab.")}, [1360, 240])
link("Save to sheet (TikTok tab)", "Show: connected")
node("Show: failed", "respondToWebhook", 1.1, {**html, "responseBody": page("TikTok connection failed", "{{ $json.error ? ($json.error.message || $json.error) : 'Something went wrong. Check the execution in n8n.' }}")}, [1140, 440])
link("Token row", "Show: failed", 1)
link("Which step?", "Show: failed", 2)
nodes.append({"parameters": {"content": "## Connect TikTok (run once)\n1. Paste Client key + secret in **TikTok app**\n2. Add a **TikTok** tab to your sheet with headers: name, refresh_token, open_id, scope, updated_at\n3. Publish this workflow, then open:\n" + N8N + "/webhook/tiktok-connect", "height": 220, "width": 460},
              "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "ct-note")), "name": "How to use", "type": "n8n-nodes-base.stickyNote", "typeVersion": 1, "position": [0, -40]})
wf = {"name": "The AI Pound: Connect TikTok (one-off)", "nodes": nodes, "connections": conns, "active": False,
      "settings": {"executionOrder": "v1", "timezone": "Europe/London"}, "pinData": {}}
names = {n["name"] for n in nodes}
for a, c in conns.items():
    assert a in names
    for outs in c["main"]:
        for t in outs: assert t["node"] in names, t
out = pathlib.Path(__file__).with_name("connect-tiktok.n8n.json"); out.write_text(json.dumps(wf, indent=2, ensure_ascii=False)); print("wrote", out, len(nodes), "nodes")
