"""Generates leads.n8n.json: website lead forms + keyword comment replies (Instagram, Facebook, YouTube)."""
import json, uuid, pathlib
nodes, conns = [], {}
def node(name, type_, version, params, pos, **extra):
    n = {"parameters": params, "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "leads-" + name)), "name": name,
         "type": f"n8n-nodes-base.{type_}", "typeVersion": version, "position": pos}
    n.update(extra); nodes.append(n); return name
def link(a, b, out=0, inp=0):
    m = conns.setdefault(a, {"main": []})["main"]
    while len(m) <= out: m.append([])
    m[out].append({"node": b, "index": inp, "type": "main"})
def code(name, js, pos, **kw): return node(name, "code", 2, {"jsCode": js.strip()}, pos, **kw)
SHEETS = {"googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets account"}}
TG = {"telegramApi": {"id": "", "name": "Telegram bot"}}
FB = {"facebookGraphApi": {"id": "", "name": "Facebook Graph account"}}
YT = {"youTubeOAuth2Api": {"id": "", "name": "YouTube account"}}
S = "$('Settings').first().json"
SHEET_DOC = {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"}
LEADS_TAB = {"__rl": True, "mode": "name", "value": "Leads"}
def append_leads(name, pos):
    return node(name, "googleSheets", 4.7, {"operation": "append", "documentId": SHEET_DOC, "sheetName": LEADS_TAB,
        "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": [], "schema": []}, "options": {}},
        pos, credentials=SHEETS, onError="continueRegularOutput")
def telegram(name, pos, text_expr):
    return node(name, "telegram", 1.2, {"chatId": f"={{{{ {S}.telegramChatId }}}}", "text": text_expr,
        "additionalFields": {"appendAttribution": False, "parse_mode": "HTML"}}, pos, credentials=TG, onError="continueRegularOutput")
def http(name, pos, method, url, cred, query=None, json_body=None):
    p = {"method": method, "url": url, "options": {}, "authentication": "predefinedCredentialType",
         "nodeCredentialType": list(cred)[0]}
    if query: p.update({"sendQuery": True, "queryParameters": {"parameters": [{"name": k, "value": v} for k, v in query.items()]}})
    if json_body: p.update({"sendBody": True, "contentType": "json", "specifyBody": "json", "jsonBody": json_body})
    return node(name, "httpRequest", 4.2, p, pos, credentials=cred, onError="continueRegularOutput")

SETTINGS_JS = r"""
// ====== EDIT THESE ======
return [{ json: {
  telegramChatId: 'PASTE_YOUR_TELEGRAM_CHAT_ID',
  instagramUserId: 'PASTE_INSTAGRAM_BUSINESS_ACCOUNT_ID',
  facebookPageId: 'PASTE_FACEBOOK_PAGE_ID',
  graphVersion: 'v21.0',
  ownUsernames: ['theaipound', 'The AI Pound'],   // never reply to ourselves
  guideUrl: 'theaipound.co.uk/guide',
  bookUrl: 'theaipound.co.uk/book',
  maxAgeDays: 7,                                  // only reply to comments from the last 7 days
}}];
"""

# ---------------- A. Website forms ----------------
node("Guide form", "webhook", 2, {"httpMethod": "POST", "path": "lead-guide", "responseMode": "responseNode", "options": {}},
     [0, 0], webhookId=str(uuid.uuid5(uuid.NAMESPACE_URL, "lead-guide")))
node("Audit form", "webhook", 2, {"httpMethod": "POST", "path": "lead-book", "responseMode": "responseNode", "options": {}},
     [0, 200], webhookId=str(uuid.uuid5(uuid.NAMESPACE_URL, "lead-book")))
code("Settings (forms)", SETTINGS_JS, [220, 100])
link("Guide form", "Settings (forms)"); link("Audit form", "Settings (forms)")
code("Lead from form", r"""
const w = $('Guide form').isExecuted ? $('Guide form').first().json : $('Audit form').first().json;
const b = w.body || {};
const isBook = String(w.webhookUrl || '').includes('lead-book') || !$('Guide form').isExecuted;
const clean = v => String(v ?? '').trim().slice(0, 1000);
const spam = !!clean(b.website) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean(b.email));
const row = {
  lead_id: 'L' + Date.now().toString(36),
  created_at: DateTime.now().setZone('Europe/London').toFormat('yyyy-MM-dd HH:mm'),
  source: isBook ? 'audit-form' : 'guide-form', keyword: '',
  name: clean(b.name), username: '', email: clean(b.email), phone: clean(b.phone),
  business: clean(b.business), message: clean(b.message), times: clean(b.times),
  marketing_ok: b.marketing === 'yes' ? 'yes' : 'no', comment_id: '', link: '', status: 'new',
};
return [{ json: { row, spam, redirect: isBook ? 'https://theaipound.co.uk/book/thanks/' : 'https://theaipound.co.uk/guide/thanks/' } }];
""", [440, 100])
link("Settings (forms)", "Lead from form")
node("Send to thank-you page", "respondToWebhook", 1.1, {"respondWith": "redirect", "redirectURL": "={{ $json.redirect }}", "options": {}}, [660, 100])
link("Lead from form", "Send to thank-you page")
node("Real person?", "if", 2.2, {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
    "conditions": [{"id": "s1", "leftValue": "={{ $('Lead from form').first().json.spam }}", "rightValue": False,
                    "operator": {"type": "boolean", "operation": "false", "singleValue": True}}], "combinator": "and"}, "options": {}}, [880, 100])
link("Send to thank-you page", "Real person?")
code("Form lead row", "return [{ json: $('Lead from form').first().json.row }];", [1100, 40])
link("Real person?", "Form lead row", 0)
append_leads("Save form lead", [1320, 40]); link("Form lead row", "Save form lead")
telegram("Telegram: new form lead", [1540, 40], r"""={{ (() => { const r = $('Form lead row').first().json; const e = t => String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
return (r.source === 'audit-form' ? '📅 <b>Audit request</b>' : '📘 <b>Guide download</b>') + '\n\n' + e(r.name) + ' · ' + e(r.email) + (r.phone ? ' · ' + e(r.phone) : '') +
 (r.business ? '\n🏷 ' + e(r.business) : '') + (r.message ? '\n💬 ' + e(r.message) : '') + (r.times ? '\n🕒 ' + e(r.times) : '') + '\n✉️ Marketing OK: ' + r.marketing_ok; })() }}""")
link("Save form lead", "Telegram: new form lead")

# ---------------- B. Keyword comments ----------------
node("Every 10 minutes", "scheduleTrigger", 1.2, {"rule": {"interval": [{"field": "minutes", "minutesInterval": 10}]}}, [0, 600])
code("Settings", SETTINGS_JS, [220, 600]); link("Every 10 minutes", "Settings")
node("Read Leads", "googleSheets", 4.7, {"operation": "read", "documentId": SHEET_DOC, "sheetName": LEADS_TAB, "options": {}},
     [440, 600], credentials=SHEETS, alwaysOutputData=True, onError="continueRegularOutput")
link("Settings", "Read Leads")
code("Ready", "return [{ json: { known: $input.all().map(i => String(i.json.comment_id || '')).filter(Boolean) } }];", [660, 600])
link("Read Leads", "Ready")
G = f"https://graph.facebook.com/{{{{ {S}.graphVersion }}}}"
# Instagram
http("IG: recent posts", [880, 460], "GET", f"={G}/{{{{ {S}.instagramUserId }}}}/media", FB,
     query={"fields": "id,permalink,timestamp", "limit": "10"})
link("Ready", "IG: recent posts")
code("IG: one item per post", "return ($input.first().json.data || []).map(p => ({ json: p }));", [1100, 460])
link("IG: recent posts", "IG: one item per post")
http("IG: comments", [1320, 460], "GET", f"={G}/{{{{ $json.id }}}}/comments", FB,
     query={"fields": "id,text,username,timestamp", "limit": "50"})
link("IG: one item per post", "IG: comments")
code("IG: normalise", r"""
const posts = $('IG: one item per post').all();
return $input.all().flatMap((it, i) => (it.json.data || []).map(c => ({ json: {
  platform: 'instagram', comment_id: c.id, username: c.username || '', text: c.text || '', created: c.timestamp, link: posts[i]?.json.permalink || '' } })));
""", [1540, 460])
link("IG: comments", "IG: normalise")
# Facebook
http("FB: recent posts + comments", [880, 620], "GET", f"={G}/{{{{ {S}.facebookPageId }}}}/posts", FB,
     query={"fields": "id,permalink_url,comments.limit(50){id,message,from,created_time}", "limit": "10"})
link("Ready", "FB: recent posts + comments")
code("FB: normalise", r"""
return ($input.first().json.data || []).flatMap(p => ((p.comments || {}).data || []).map(c => ({ json: {
  platform: 'facebook', comment_id: c.id, username: (c.from || {}).name || '', text: c.message || '', created: c.created_time, link: p.permalink_url || '' } })));
""", [1100, 620])
link("FB: recent posts + comments", "FB: normalise")
# YouTube
http("YT: my channel", [880, 780], "GET", "https://www.googleapis.com/youtube/v3/channels", YT, query={"part": "id", "mine": "true"})
link("Ready", "YT: my channel")
http("YT: recent comments", [1100, 780], "GET", "https://www.googleapis.com/youtube/v3/commentThreads", YT,
     query={"part": "snippet", "allThreadsRelatedToChannelId": "={{ ($json.items || [])[0]?.id }}", "maxResults": "50", "order": "time"})
link("YT: my channel", "YT: recent comments")
code("YT: normalise", r"""
return ($input.first().json.items || []).map(t => { const c = t.snippet.topLevelComment; const s = c.snippet; return { json: {
  platform: 'youtube', comment_id: c.id, username: s.authorDisplayName || '', text: s.textOriginal || s.textDisplay || '', created: s.publishedAt,
  link: s.videoId ? 'https://youtube.com/shorts/' + s.videoId : '' } }; });
""", [1320, 780])
link("YT: recent comments", "YT: normalise")
node("All comments", "merge", 3.2, {"numberInputs": 3}, [1760, 620])
link("IG: normalise", "All comments", inp=0); link("FB: normalise", "All comments", inp=1); link("YT: normalise", "All comments", inp=2)
code("Find keyword comments", r"""
const st = $('Settings').first().json;
const known = new Set($('Ready').first().json.known);
const own = st.ownUsernames.map(u => u.toLowerCase());
const cutoff = DateTime.now().minus({ days: st.maxAgeDays });
const seen = new Set(); const out = [];
for (const { json: c } of $input.all()) {
  if (!c.comment_id || known.has(String(c.comment_id)) || seen.has(c.comment_id)) continue;
  if (own.includes(String(c.username).toLowerCase())) continue;
  const when = DateTime.fromISO(String(c.created).replace(/\+0000$/, 'Z'));
  if (when.isValid && when < cutoff) continue;
  const kw = /\bautomate\b/i.test(c.text) ? 'AUTOMATE' : /\baudit\b/i.test(c.text) ? 'AUDIT' : null;
  if (!kw) continue;
  seen.add(c.comment_id);
  const hi = c.platform === 'instagram' && c.username ? `@${c.username}` : (c.username || 'there').split(' ')[0];
  const reply = kw === 'AUTOMATE'
    ? `Thanks ${hi}! 🙌 Here's your free guide, "5 AI automations UK small businesses can set up this month": ${st.guideUrl}`
    : `Thanks ${hi}! 🙌 Book your free 15-minute workflow audit here: ${st.bookUrl}`;
  out.push({ json: { ...c, keyword: kw, reply } });
}
return out.slice(0, 20);
""", [1980, 620])
link("All comments", "Find keyword comments")
# log + notify
code("Comment lead rows", r"""
return $input.all().map(({ json: c }) => ({ json: {
  lead_id: 'C' + String(c.comment_id).slice(-10), created_at: DateTime.now().setZone('Europe/London').toFormat('yyyy-MM-dd HH:mm'),
  source: c.platform, keyword: c.keyword, name: '', username: c.username, email: '', phone: '', business: '', message: String(c.text).slice(0, 500),
  times: '', marketing_ok: 'no', comment_id: String(c.comment_id), link: c.link, status: 'auto-replied' } }));
""", [2200, 480])
link("Find keyword comments", "Comment lead rows")
append_leads("Save comment leads", [2420, 480]); link("Comment lead rows", "Save comment leads")
code("Telegram text", r"""
const e = t => String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const icon = { instagram: '📸', facebook: '👍', youtube: '▶️' };
return $('Comment lead rows').all().map(({ json: r }) => ({ json: { text:
  `🔥 <b>New lead: ${e(r.keyword)}</b>\n${icon[r.source] || ''} ${e(r.source)} · ${e(r.username)}\n💬 "${e(r.message.slice(0, 200))}"\n🔗 ${e(r.link)}\n\nAuto-reply sent with the ${r.keyword === 'AUDIT' ? 'booking' : 'guide'} link. Follow up personally if they're a good fit.` } }));
""", [2640, 480])
link("Save comment leads", "Telegram text")
telegram("Telegram: new comment lead", [2860, 480], "={{ $json.text }}"); link("Telegram text", "Telegram: new comment lead")
# replies
node("Which platform?", "switch", 3.2, {"rules": {"values": [
    {"conditions": {"options": {"caseSensitive": True, "typeValidation": "strict", "version": 2}, "combinator": "and",
        "conditions": [{"leftValue": "={{ $json.platform }}", "rightValue": p, "operator": {"type": "string", "operation": "equals"}}]},
     "renameOutput": True, "outputKey": p} for p in ["instagram", "facebook", "youtube"]]}, "options": {}}, [2200, 760])
link("Find keyword comments", "Which platform?")
http("IG: reply", [2420, 660], "POST", f"={G}/{{{{ $json.comment_id }}}}/replies", FB, query={"message": "={{ $json.reply }}"})
link("Which platform?", "IG: reply", 0)
http("FB: reply", [2420, 780], "POST", f"={G}/{{{{ $json.comment_id }}}}/comments", FB, query={"message": "={{ $json.reply }}"})
link("Which platform?", "FB: reply", 1)
http("YT: reply", [2420, 900], "POST", "https://www.googleapis.com/youtube/v3/comments", YT,
     json_body="={{ JSON.stringify({ snippet: { parentId: $json.comment_id, textOriginal: $json.reply } }) }}")
nodes[-1]["parameters"]["sendQuery"] = True
nodes[-1]["parameters"]["queryParameters"] = {"parameters": [{"name": "part", "value": "snippet"}]}
link("Which platform?", "YT: reply", 2)

for i, (t, pos) in enumerate([("A. Website forms → Leads tab + Telegram", [0, -160]), ("B. Keyword comments (AUTOMATE / AUDIT) → reply + Leads tab + Telegram", [0, 440])]):
    nodes.append({"parameters": {"content": f"## {t}", "height": 100, "width": 520}, "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"leads-note{i}")),
                  "name": f"Note {i+1}", "type": "n8n-nodes-base.stickyNote", "typeVersion": 1, "position": pos})
wf = {"name": "The AI Pound: Leads (forms + comment replies)", "nodes": nodes, "connections": conns, "active": False,
      "settings": {"executionOrder": "v1", "timezone": "Europe/London"}, "pinData": {}}
names = {n["name"] for n in nodes}; assert len(names) == len(nodes)
for a, c in conns.items():
    assert a in names, a
    for outs in c["main"]:
        for t in outs: assert t["node"] in names, t
out = pathlib.Path(__file__).with_name("leads.n8n.json"); out.write_text(json.dumps(wf, indent=2, ensure_ascii=False)); print("wrote", len(nodes), "nodes")
