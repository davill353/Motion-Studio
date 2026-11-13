"""Generates weekly-report.n8n.json: Monday performance report (YouTube, Instagram, Facebook + leads) to Telegram and a Stats tab."""
import json, uuid, pathlib
nodes, conns, chain = [], {}, []
def node(name, type_, version, params, **extra):
    x = 220 * len(nodes)
    n = {"parameters": params, "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "wr-" + name)), "name": name,
         "type": f"n8n-nodes-base.{type_}", "typeVersion": version, "position": [x, 300]}
    n.update(extra); nodes.append(n)
    if chain: conns.setdefault(chain[-1], {"main": [[]]})["main"][0].append({"node": name, "index": 0, "type": "main"})
    chain.append(name); return name
def code(name, js, **kw): return node(name, "code", 2, {"jsCode": js.strip()}, alwaysOutputData=True, **kw)
def http(name, url, cred, query=None):
    p = {"method": "GET", "url": url, "options": {}, "authentication": "predefinedCredentialType", "nodeCredentialType": list(cred)[0]}
    if query: p.update({"sendQuery": True, "queryParameters": {"parameters": [{"name": k, "value": v} for k, v in query.items()]}})
    return node(name, "httpRequest", 4.2, p, credentials=cred, onError="continueRegularOutput", alwaysOutputData=True, executeOnce=True)
FB = {"facebookGraphApi": {"id": "", "name": "Facebook Graph account"}}
YT = {"youTubeOAuth2Api": {"id": "", "name": "YouTube account"}}
SHEETS = {"googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets account"}}
S = "$('Settings').first().json"; G = f"https://graph.facebook.com/{{{{ {S}.graphVersion }}}}"
DOC = {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"}

node("Every Monday 08:38", "scheduleTrigger", 1.2, {"rule": {"interval": [{"field": "cronExpression", "expression": "38 8 * * 1"}]}})
code("Settings", r"""
// ====== EDIT THESE ======
return [{ json: {
  telegramChatId: 'PASTE_YOUR_TELEGRAM_CHAT_ID',
  instagramUserId: 'PASTE_INSTAGRAM_BUSINESS_ACCOUNT_ID',
  facebookPageId: 'PASTE_FACEBOOK_PAGE_ID',
  graphVersion: 'v21.0',
  days: 7,
}}];
""")
http("IG: recent posts", f"={G}/{{{{ {S}.instagramUserId }}}}/media", FB,
     {"fields": "id,caption,permalink,timestamp,like_count,comments_count,media_product_type", "limit": "25"})
code("IG: last 7 days", r"""
const days = $('Settings').first().json.days, cutoff = DateTime.now().minus({ days });
const posts = ($input.first().json.data || []).filter(p => DateTime.fromISO(String(p.timestamp).replace(/\+0000$/, 'Z')) >= cutoff);
return posts.length ? posts.map(p => ({ json: p })) : [{ json: { none: true } }];
""")
node("IG: views per post", "httpRequest", 4.2, {"method": "GET", "url": f"={G}/{{{{ $json.id }}}}/insights", "options": {},
     "authentication": "predefinedCredentialType", "nodeCredentialType": "facebookGraphApi", "sendQuery": True,
     "queryParameters": {"parameters": [{"name": "metric", "value": "views,reach,shares,saved"}]}},
     credentials=FB, onError="continueRegularOutput", alwaysOutputData=True)
code("IG: rows", r"""
const posts = $('IG: last 7 days').all().map(i => i.json);
if (posts[0]?.none) return [{ json: { platform: 'instagram', none: true } }];
const ins = $input.all().map(i => i.json);
return posts.map((p, i) => {
  const m = Object.fromEntries(((ins[i] || {}).data || []).map(d => [d.name, (d.values || [{}])[0].value ?? d.total_value?.value]));
  return { json: { platform: 'instagram', title: String(p.caption || '').split('\n')[0].slice(0, 80), link: p.permalink,
    posted_at: p.timestamp, views: m.views ?? null, likes: p.like_count ?? 0, comments: p.comments_count ?? 0, shares: m.shares ?? 0 } };
});
""")
http("FB: recent posts", f"={G}/{{{{ {S}.facebookPageId }}}}/posts", FB,
     {"fields": "id,permalink_url,created_time,message,shares,reactions.summary(total_count).limit(0),comments.summary(true).limit(0)",
      "since": f"={{{{ Math.floor(Date.now() / 1000) - {S}.days * 86400 }}}}", "limit": "25"})
code("FB: rows", r"""
const posts = $input.first().json.data || [];
if (!posts.length) return [{ json: { platform: 'facebook', none: true } }];
return posts.map(p => ({ json: { platform: 'facebook', title: String(p.message || '').split('\n')[0].slice(0, 80), link: p.permalink_url,
  posted_at: p.created_time, views: null, likes: p.reactions?.summary?.total_count ?? 0, comments: p.comments?.summary?.total_count ?? 0,
  shares: p.shares?.count ?? 0 } }));
""", executeOnce=True)
http("YT: my uploads list", "https://www.googleapis.com/youtube/v3/channels", YT, {"part": "contentDetails", "mine": "true"})
http("YT: latest uploads", "https://www.googleapis.com/youtube/v3/playlistItems", YT,
     {"part": "contentDetails", "maxResults": "25", "playlistId": "={{ ($json.items || [])[0]?.contentDetails?.relatedPlaylists?.uploads }}"})
http("YT: video stats", "https://www.googleapis.com/youtube/v3/videos", YT,
     {"part": "snippet,statistics", "id": "={{ ($json.items || []).map(i => i.contentDetails.videoId).join(',') }}"})
code("YT: rows", r"""
const days = $('Settings').first().json.days, cutoff = DateTime.now().minus({ days });
const vids = ($input.first().json.items || []).filter(v => DateTime.fromISO(v.snippet.publishedAt) >= cutoff);
if (!vids.length) return [{ json: { platform: 'youtube', none: true } }];
return vids.map(v => ({ json: { platform: 'youtube', title: v.snippet.title, link: 'https://youtube.com/shorts/' + v.id, posted_at: v.snippet.publishedAt,
  views: Number(v.statistics.viewCount || 0), likes: Number(v.statistics.likeCount || 0), comments: Number(v.statistics.commentCount || 0), shares: 0 } }));
""", executeOnce=True)
node("Read Leads", "googleSheets", 4.7, {"operation": "read", "documentId": DOC, "sheetName": {"__rl": True, "mode": "name", "value": "Leads"}, "options": {}},
     credentials=SHEETS, onError="continueRegularOutput", alwaysOutputData=True, executeOnce=True)
code("Build report", r"""
const st = $('Settings').first().json, tz = 'Europe/London';
const now = DateTime.now().setZone(tz), cutoff = now.minus({ days: st.days });
const rows = ['IG: rows', 'FB: rows', 'YT: rows'].flatMap(n => $(n).all().map(i => i.json)).filter(r => !r.none && r.link);
const leads = $input.all().map(i => i.json).filter(l => l.created_at && DateTime.fromFormat(String(l.created_at), 'yyyy-MM-dd HH:mm', { zone: tz }) >= cutoff);
const e = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = x => Number(x || 0).toLocaleString('en-GB');
const label = { youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook' };
const icon = { youtube: '▶️', instagram: '📸', facebook: '👍', 'guide-form': '📘', 'audit-form': '📅' };
const plat = {};
for (const r of rows) { const p = plat[r.platform] ||= { posts: 0, views: 0, hasViews: false, likes: 0, comments: 0, shares: 0 };
  p.posts++; if (r.views != null) { p.views += r.views; p.hasViews = true; } p.likes += r.likes; p.comments += r.comments; p.shares += r.shares; }
const score = r => (r.views ?? 0) + 5 * (r.likes + r.comments * 2 + r.shares * 3);
const ranked = [...rows].sort((a, b) => score(b) - score(a));
const bySource = {}; for (const l of leads) bySource[l.source] = (bySource[l.source] || 0) + 1;
const lines = [`📊 <b>The AI Pound: weekly report</b>`, `${cutoff.toFormat('d LLL')} – ${now.toFormat('d LLL yyyy')}`, ''];
if (!rows.length) lines.push('No posts in the last 7 days.');
for (const [k, p] of Object.entries(plat))
  lines.push(`${icon[k]} <b>${label[k] || k}</b>: ${p.posts} post${p.posts > 1 ? 's' : ''} · ${p.hasViews ? n(p.views) + ' views · ' : ''}${n(p.likes)} likes · ${n(p.comments)} comments${p.shares ? ' · ' + n(p.shares) + ' shares' : ''}`);
lines.push('', `🎯 <b>Leads: ${leads.length}</b>` + (leads.length ? ' (' + Object.entries(bySource).map(([s, c]) => `${icon[s] || ''} ${s} ${c}`).join(', ') + ')' : ''));
const audits = bySource['audit-form'] || 0; if (audits) lines.push(`📅 ${audits} audit request${audits > 1 ? 's' : ''}: follow up today`);
if (ranked.length) {
  const b = ranked[0], w = ranked[ranked.length - 1];
  lines.push('', `🏆 <b>Best</b>: ${e(b.title)} (${b.platform}${b.views != null ? ', ' + n(b.views) + ' views' : ''}, ${n(b.likes)} likes)\n${e(b.link)}`);
  if (ranked.length > 1) lines.push(`🔻 <b>Lowest</b>: ${e(w.title)} (${w.platform}${w.views != null ? ', ' + n(w.views) + ' views' : ''})`);
}
// one suggestion
let tip = 'Keep posting consistently: one Short a day builds the data you need.';
const top = Object.entries(plat).sort((a, b) => (b[1].views || b[1].likes * 20) - (a[1].views || a[1].likes * 20))[0];
if (ranked.length > 1) tip = `Make another video like "${ranked[0].title.slice(0, 50)}": it beat your average this week.`;
if (rows.length && leads.length === 0) tip = 'No leads this week: make sure every video ends with "Comment AUTOMATE" and pin that comment.';
if (top && rows.length) tip += ` ${label[top[0]] || top[0]} was your strongest platform.`;
lines.push('', `💡 ${e(tip)}`, '', '<i>TikTok stats aren\'t available via its API: check them in the TikTok app.</i>');
const week = cutoff.toFormat('yyyy-MM-dd');
const stats = rows.map(r => ({ week_start: week, platform: r.platform, title: r.title, link: r.link, posted_at: r.posted_at,
  views: r.views ?? '', likes: r.likes, comments: r.comments, shares: r.shares }));
stats.push({ week_start: week, platform: 'leads', title: 'Leads this week', link: '', posted_at: '', views: '', likes: '', comments: '', shares: '', leads: leads.length });
return [{ json: { text: lines.join('\n').slice(0, 3900), stats } }];
""", executeOnce=True)
node("Telegram: weekly report", "telegram", 1.2, {"chatId": f"={{{{ {S}.telegramChatId }}}}", "text": "={{ $json.text }}",
     "additionalFields": {"appendAttribution": False, "parse_mode": "HTML", "disable_web_page_preview": True}},
     credentials={"telegramApi": {"id": "", "name": "Telegram bot"}}, onError="continueRegularOutput")
code("Stats rows", "return $('Build report').first().json.stats.map(s => ({ json: s }));")
node("Save to Stats tab", "googleSheets", 4.7, {"operation": "append", "documentId": DOC, "sheetName": {"__rl": True, "mode": "name", "value": "Stats"},
     "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": [], "schema": []}, "options": {}},
     credentials=SHEETS, onError="continueRegularOutput")
wf = {"name": "The AI Pound: Weekly report", "nodes": nodes, "connections": conns, "active": False,
      "settings": {"executionOrder": "v1", "timezone": "Europe/London"}, "pinData": {}}
out = pathlib.Path(__file__).with_name("weekly-report.n8n.json"); out.write_text(json.dumps(wf, indent=2, ensure_ascii=False)); print("wrote", len(nodes), "nodes")
