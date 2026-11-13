"""Generates ugc-scripts.n8n.json: brief form -> AI writes UGC ad scripts -> rule check + AI compliance review -> Telegram approval -> sheet."""
import json, uuid, pathlib
nodes, conns, chain = [], {}, []
def node(name, type_, version, params, after=None, out=0, pos=None, **extra):
    n = {"parameters": params, "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "ugc-" + name)), "name": name,
         "type": f"n8n-nodes-base.{type_}", "typeVersion": version, "position": pos or [220 * len(nodes), 300]}
    n.update(extra); nodes.append(n)
    src = after if after is not None else (chain[-1] if chain else None)
    if src:
        m = conns.setdefault(src, {"main": []})["main"]
        while len(m) <= out: m.append([])
        m[out].append({"node": name, "index": 0, "type": "main"})
    chain.append(name); return name
def code(name, js, **kw): return node(name, "code", 2, {"jsCode": js.strip()}, **kw)
TG = {"telegramApi": {"id": "", "name": "Telegram bot"}}
OA = {"openAiApi": {"id": "", "name": "OpenAI account"}}
SHEETS = {"googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets account"}}
S = "$('Settings').first().json"
DOC = {"__rl": True, "mode": "url", "value": "PASTE_GOOGLE_SHEET_URL"}
TAB = {"__rl": True, "mode": "name", "value": "Ad Scripts"}
def opt(*xs): return {"values": [{"option": x} for x in xs]}
F = lambda label, t="text", req=False, **kw: {"fieldLabel": label, "fieldType": t, "requiredField": req, **kw}

node("UGC brief form", "formTrigger", 2.2, {
  "formTitle": "UGC ad script brief",
  "formDescription": "The AI Pound: compliant UGC-style ad scripts for UK health & beauty brands. Scripts arrive on Telegram for review.",
  "formFields": {"values": [
    F("Brand name", req=True), F("Product or service", req=True),
    F("Category", "dropdown", True, fieldOptions=opt("Skincare / cosmetics", "Weight management / wellness", "Hair loss / hair transplant clinic", "Other health & beauty")),
    F("Target audience", placeholder="e.g. women 30-45 in the UK with dry, sensitive skin"),
    F("Key benefit or offer", "textarea", True, placeholder="What should viewers feel or do? Any offer?"),
    F("Evidence the brand holds for its claims", "textarea", placeholder="e.g. 2025 consumer study (n=112), dermatologist tested. Leave blank if none."),
    F("Tone", "dropdown", fieldOptions=opt("Friendly & relatable", "Expert & reassuring", "Energetic & fun")),
    F("Video length", "dropdown", fieldOptions=opt("15 seconds", "30 seconds", "45 seconds")),
    F("Number of scripts", "dropdown", fieldOptions=opt("3", "2", "1"))]},
  "responseMode": "onReceived",
  "options": {"respondWithOptions": {"values": {"respondWith": "text", "formSubmittedText": "Thanks! Your scripts and compliance check will arrive on Telegram in about a minute."}}}},
  pos=[0, 300], webhookId=str(uuid.uuid5(uuid.NAMESPACE_URL, "ugc-form")))
code("Settings", r"""
// ====== EDIT THESE ======
return [{ json: {
  telegramChatId: 'PASTE_YOUR_TELEGRAM_CHAT_ID',
  model: 'gpt-4o-mini',   // any OpenAI chat model you have access to
}}];
""")
code("Brief", r"""
const f = $('UGC brief form').first().json;
const g = k => String(f[k] ?? '').trim();
return [{ json: { brand: g('Brand name'), product: g('Product or service'), category: g('Category'), audience: g('Target audience'),
  benefit: g('Key benefit or offer'), evidence: g('Evidence the brand holds for its claims'), tone: g('Tone') || 'Friendly & relatable',
  length: g('Video length') || '30 seconds', count: Number(g('Number of scripts') || 3),
  batch: 'B' + Date.now().toString(36) } }];
""")
RULES = ("UK rules you must follow (ASA/CAP Code, ASA cosmetic-interventions guidance, Human Medicines Regulations 2012): "
 "1) No guaranteed, permanent or specific results and no 'risk-free' or 'no side effects' claims. "
 "2) Cosmetics may make cosmetic claims only (looks/feels), never medical claims (treats, cures, heals) unless licensed. "
 "3) Never name, show or imply prescription-only medicines (e.g. semaglutide, Ozempic, Wegovy, Mounjaro, tirzepatide, Botox, finasteride, 'the jab', 'skinny pen'). "
 "4) Weight management: no amount or rate of weight loss, no before/after that exaggerates, nothing aimed at under-18s. "
 "5) Cosmetic interventions incl. hair transplants: don't trivialise surgery, no time-limited or pressure offers, no under-18s, no guaranteed outcomes; before/after only if real, unedited and representative. "
 "6) Objective claims (e.g. 'clinically proven', percentages) only if the brand's stated evidence supports them. "
 "7) It's an ad: the caption must start with 'Ad |' and the creator must not be presented as an unpaid customer. Never invent testimonials or reviews.")
node("AI: write scripts", "httpRequest", 4.2, {"method": "POST", "url": "https://api.openai.com/v1/chat/completions", "options": {"timeout": 120000},
  "authentication": "predefinedCredentialType", "nodeCredentialType": "openAiApi", "sendBody": True, "contentType": "json", "specifyBody": "json",
  "jsonBody": "={{ JSON.stringify({ model: " + S + ".model, temperature: 0.8, response_format: { type: 'json_object' }, messages: [ { role: 'system', content: "
    + json.dumps("You are a senior UK UGC ad scriptwriter. Write scroll-stopping, natural, first-person UGC-style short video ad scripts for TikTok, Reels and Shorts. " + RULES +
    " Return only JSON: {\"scripts\":[{\"angle\":\"\",\"hook\":\"first 2 seconds, spoken\",\"script\":[{\"time\":\"0-3s\",\"visual\":\"\",\"line\":\"\"}],\"on_screen_text\":[\"\"],\"cta\":\"\",\"caption\":\"Ad | ...\",\"claims\":[\"each objective claim made\"]}]}. Each script must use a different angle.")
    + " }, { role: 'user', content: 'Brief: ' + JSON.stringify($json) } ] }) }}"},
  credentials=OA, onError="continueRegularOutput")
code("Scripts", r"""
const b = $('Brief').first().json;
let out = [];
try { out = JSON.parse($input.first().json.choices[0].message.content).scripts || []; }
catch (e) { throw new Error('The AI did not return scripts: ' + JSON.stringify($input.first().json.error || $input.first().json).slice(0, 300)); }
return [{ json: { scripts: out.slice(0, b.count) } }];
""")
node("AI: compliance review", "httpRequest", 4.2, {"method": "POST", "url": "https://api.openai.com/v1/chat/completions", "options": {"timeout": 120000},
  "authentication": "predefinedCredentialType", "nodeCredentialType": "openAiApi", "sendBody": True, "contentType": "json", "specifyBody": "json",
  "jsonBody": "={{ JSON.stringify({ model: " + S + ".model, temperature: 0, response_format: { type: 'json_object' }, messages: [ { role: 'system', content: "
    + json.dumps("You are a strict UK advertising compliance reviewer for health and beauty ads. " + RULES +
    " Review every script line, on-screen text, CTA and caption against these rules and the brand's stated evidence. Return only JSON: {\"reviews\":[{\"index\":0,\"verdict\":\"pass\"|\"needs_changes\",\"issues\":[{\"quote\":\"\",\"rule\":\"\",\"why\":\"\",\"fix\":\"\"}]}]}. Flag anything doubtful.")
    + " }, { role: 'user', content: 'Brand evidence: ' + ($('Brief').first().json.evidence || 'none provided') + '\\nCategory: ' + $('Brief').first().json.category + '\\nScripts: ' + JSON.stringify($json.scripts) } ] }) }}"},
  credentials=OA, onError="continueRegularOutput")
code("Combine + rule check", r"""
const b = $('Brief').first().json, scripts = $('Scripts').first().json.scripts;
let reviews = [];
try { reviews = JSON.parse($input.first().json.choices[0].message.content).reviews || []; } catch (e) { reviews = []; }
const hard = [
  [/guarantee/i, 'Guaranteed results'], [/\b(cure|cures|cured|heals?|treats?)\b/i, 'Medical claim'],
  [/permanent(ly)?\b/i, 'Permanent results claim'], [/risk[- ]free|no side[- ]effects/i, 'Risk-free / no side effects'],
  [/semaglutide|tirzepatide|ozempic|wegovy|mounjaro|saxenda|liraglutide|botox|botulinum|finasteride|dutasteride/i, 'Prescription-only medicine'],
  [/(skinny|weight[- ]?loss|fat)[- ]?(jab|pen|injection)|\bthe jab\b/i, 'Implied prescription-only medicine'],
  [/(lose|lost|losing|drop(ped)?|shed)\s+\d+\s*(stone|st|lbs?|kg|pounds)|\d+\s*(lbs?|kg|stone)\s+(off|lost|down)/i, 'Specific weight-loss amount'],
  [/\b(today only|ends (tonight|soon)|limited time|last chance|only \d+ (left|spaces|slots))\b/i, 'Time-limited / pressure offer'],
  [/\b(teen|teenager|under[- ]?18|school)\b/i, 'Possible appeal to under-18s'],
];
const soft = [[/clinically (proven|tested)|\d+\s?%|dermatologist/i, 'Objective claim: needs evidence'], [/before (and|&) after/i, 'Before/after: must be real, unedited, representative']];
const out = scripts.map((s, i) => {
  const all = [s.hook, ...(s.script || []).map(l => l.line + ' ' + l.visual), ...(s.on_screen_text || []), s.cta, s.caption].join(' \n ');
  const issues = [];
  for (const [re, why] of hard) { const m = all.match(re); if (m) issues.push({ rule: why, quote: m[0], why: 'Rule check (brand.md §6)', fix: 'Remove or rephrase', hard: true }); }
  for (const [re, why] of soft) { const m = all.match(re); if (m && (!b.evidence || /before/i.test(why))) issues.push({ rule: why, quote: m[0], why: b.evidence ? 'Check it matches the stated evidence' : 'No evidence provided in the brief', fix: 'Remove, or confirm evidence', hard: !b.evidence && !/before/i.test(why) }); }
  const r = reviews.find(x => Number(x.index) === i) || reviews[i] || { verdict: 'unknown', issues: [] };
  for (const x of r.issues || []) issues.push({ ...x, hard: false });
  let caption = String(s.caption || '');
  if (!/^\s*ad\s*\|/i.test(caption)) { caption = 'Ad | ' + caption; issues.push({ rule: 'Ad label', quote: '', why: 'Caption missing "Ad |"', fix: 'Added automatically', hard: false }); }
  const verdict = issues.some(x => x.hard) ? 'blocked' : (r.verdict === 'pass' && !issues.filter(x => x.rule !== 'Ad label').length) ? 'pass' : 'needs_changes';
  return { ...s, caption, verdict, issues, index: i };
});
return [{ json: { scripts: out } }];
""")
code("One message per script", r"""
const b = $('Brief').first().json, list = $input.first().json.scripts;
const e = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const badge = { pass: '✅ PASS', needs_changes: '⚠️ NEEDS CHANGES', blocked: '⛔ BLOCKED' };
return list.map((s, i) => ({ json: {
  script_id: `${b.batch}-${i + 1}`,
  text: [`🎬 <b>${e(b.brand)}: script ${i + 1}/${list.length}</b> · ${badge[s.verdict]}`, `<i>${e(s.angle)}</i>`, '',
    `<b>Hook:</b> ${e(s.hook)}`, '', ...(s.script || []).map(l => `<b>${e(l.time)}</b> ${e(l.line)}\n   🎥 ${e(l.visual)}`), '',
    `<b>On-screen:</b> ${e((s.on_screen_text || []).join(' / '))}`, `<b>CTA:</b> ${e(s.cta)}`, `<b>Caption:</b> ${e(s.caption)}`,
    ...(s.issues.length ? ['', '<b>Compliance notes:</b>', ...s.issues.map(x => `${x.hard ? '⛔' : '•'} ${e(x.rule)}${x.quote ? ': "' + e(x.quote) + '"' : ''}${x.fix ? ' → ' + e(x.fix) : ''}`)] : ['', '✅ No compliance issues found.'])
  ].join('\n').slice(0, 3900),
  row: { script_id: `${b.batch}-${i + 1}`, created_at: DateTime.now().setZone('Europe/London').toFormat('yyyy-MM-dd HH:mm'), brand: b.brand, product: b.product,
    category: b.category, angle: s.angle, hook: s.hook, script: (s.script || []).map(l => `[${l.time}] ${l.line} (${l.visual})`).join('\n'),
    caption: s.caption, verdict: s.verdict, issues: s.issues.map(x => x.rule + (x.quote ? ': ' + x.quote : '')).join('; '), status: 'awaiting review' } } }));
""")
node("Telegram: send scripts", "telegram", 1.2, {"chatId": f"={{{{ {S}.telegramChatId }}}}", "text": "={{ $json.text }}",
     "additionalFields": {"appendAttribution": False, "parse_mode": "HTML"}}, credentials=TG, onError="continueRegularOutput")
code("Rows", "return $('One message per script').all().map(i => ({ json: i.json.row }));")
node("Save to Ad Scripts tab", "googleSheets", 4.7, {"operation": "append", "documentId": DOC, "sheetName": TAB,
     "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": [], "schema": []}, "options": {}},
     credentials=SHEETS, onError="continueRegularOutput")
node("Ask: approve for the client?", "telegram", 1.2, {"operation": "sendAndWait", "chatId": f"={{{{ {S}.telegramChatId }}}}",
     "message": "={{ '📝 ' + $('Brief').first().json.brand + ': ' + $('Rows').all().length + ' scripts ready. Pass: ' + $('Rows').all().filter(r => r.json.verdict === 'pass').length + ', needs changes: ' + $('Rows').all().filter(r => r.json.verdict === 'needs_changes').length + ', blocked: ' + $('Rows').all().filter(r => r.json.verdict === 'blocked').length + '.\\n\\nApprove the PASS scripts to send to the client? (Compliance checks are guidance, not legal advice.)' }}",
     "responseType": "approval", "approvalOptions": {"values": {"approvalType": "double", "approveLabel": "Approve", "disapproveLabel": "Rework"}},
     "options": {"limitWaitTime": {"values": {"limitType": "afterTimeInterval", "resumeAmount": 3, "resumeUnit": "days"}}}},
     credentials=TG, executeOnce=True, webhookId=str(uuid.uuid5(uuid.NAMESPACE_URL, "ugc-approve")))
code("Status update", r"""
const ok = $input.first().json.data?.approved === true;
return $('Rows').all().map(({ json: r }) => ({ json: { script_id: r.script_id,
  status: !ok ? 'rework' : r.verdict === 'pass' ? 'approved' : 'not sent (' + r.verdict + ')' } }));
""")
node("Update statuses", "googleSheets", 4.7, {"operation": "update", "documentId": DOC, "sheetName": TAB,
     "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": ["script_id"], "schema": []}, "options": {}},
     credentials=SHEETS, onError="continueRegularOutput")
nodes.append({"parameters": {"content": "## UGC script writer\nForm → AI writes scripts → rule check + AI compliance review → Telegram → Ad Scripts tab → approve.\nCompliance output is guidance, not legal advice.", "height": 140, "width": 520},
              "id": str(uuid.uuid5(uuid.NAMESPACE_URL, "ugc-note")), "name": "Note", "type": "n8n-nodes-base.stickyNote", "typeVersion": 1, "position": [0, 60]})
wf = {"name": "The AI Pound: UGC ad scripts (with compliance check)", "nodes": nodes, "connections": conns, "active": False,
      "settings": {"executionOrder": "v1", "timezone": "Europe/London"}, "pinData": {}}
out = pathlib.Path(__file__).with_name("ugc-scripts.n8n.json"); out.write_text(json.dumps(wf, indent=2, ensure_ascii=False)); print("wrote", len(nodes), "nodes")
