import csv, re, ssl, sys, json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

P = "campaign/clinic-outreach/prospects-pipeline.csv"

SIG = {
    "tidio": r"tidio", "intercom": r"intercom", "crisp": r"crisp\.chat",
    "freshchat": r"freshchat|freshworks|wchat\.freshchat", "drift": r"js\.driftt|drift\.com",
    "tawk": r"tawk\.to", "zendesk": r"zopim|zendesk", "livechat": r"livechatinc",
    "podium": r"podium\.com|podium-widget", "hubspot": r"js\.hs-scripts|hubspot",
    "olark": r"olark", "smartsupp": r"smartsupp", "chatra": r"chatra",
    "jivochat": r"jivosite|jivochat", "gorgias": r"gorgias", "manychat": r"manychat",
    "botpress": r"botpress", "voiceflow": r"voiceflow", "chatbotcom": r"chatbot\.com",
    "respond": r"respond\.io", "wati": r"wati\.io", "aichat": r"ai[-_ ]?assistant|ai chat|ask ai|chat with ai",
    "whatsapp": r"wa\.me/|api\.whatsapp\.com/send",
    "messenger": r"m\.me/|fb-customerchat|facebook\.net/.*sdk",
}
BOOK = {
    "fresha": r"fresha\.com", "treatwell": r"treatwell", "phorest": r"phorest",
    "pabau": r"pabau", "cliniko": r"cliniko", "timely": r"gettimely|timely\.com",
    "booksy": r"booksy", "vagaro": r"vagaro", "mindbody": r"mindbody",
    "simplybook": r"simplybook", "calendly": r"calendly", "acuity": r"acuityscheduling|squarespace-scheduling",
    "goldie": r"heygoldie", "setmore": r"setmore", "square": r"squareup\.com/appointments",
}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def fetch(url):
    if not url.startswith("http"):
        url = "https://" + url
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
    with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
        raw = r.read(600000)
        return r.geturl(), raw.decode("utf-8", "ignore")


def scan(row):
    name, url = row["name"], row["website"].strip()
    out = {"name": name, "priority": row["priority"], "url": url, "status": "", "final_url": "",
           "booking": "", "chat": "", "ai_words": "", "whatsapp": "", "messenger": "", "notes": ""}
    try:
        final, html = fetch(url)
    except Exception as e:
        out["status"] = "unreachable"
        out["notes"] = type(e).__name__
        return out
    out["status"] = "ok"
    out["final_url"] = final
    low = html.lower()
    out["booking"] = ",".join(k for k, p in BOOK.items() if re.search(p, low))
    chats = [k for k, p in SIG.items() if k not in ("whatsapp", "messenger", "aichat") and re.search(p, low)]
    out["chat"] = ",".join(chats)
    out["ai_words"] = "yes" if re.search(SIG["aichat"], low) else ""
    out["whatsapp"] = "yes" if re.search(SIG["whatsapp"], low) else ""
    out["messenger"] = "yes" if re.search(SIG["messenger"], low) else ""
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", low, flags=re.S)
    if re.search(r"\bchatbot\b|\bvirtual assistant\b|\bai receptionist\b|\bai assistant\b", text):
        out["ai_words"] = (out["ai_words"] + ",in-copy").strip(",")
    return out


def main():
    import sys
    towns = [t.strip().lower() for t in (sys.argv[1:] or ["hitchin"])]
    rows = [r for r in csv.DictReader(open(P))]
    hit = [r for r in rows if r["town"].strip().lower() in towns
           and r["website"] and r["website"].strip() not in ("-", "")]
    with ThreadPoolExecutor(max_workers=8) as ex:
        res = list(ex.map(scan, hit))
    keys = ["name", "priority", "url", "status", "final_url", "booking", "chat", "ai_words", "whatsapp", "messenger", "notes"]
    out_path = "campaign/clinic-outreach/bot-audit-" + "-".join(towns) + ".csv"
    with open(out_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        w.writerows(res)
    ok = [r for r in res if r["status"] == "ok"]
    print(f"scanned {len(res)} sites, {len(ok)} reachable -> {out_path}")
    for r in res:
        flags = []
        if r["chat"]: flags.append("chat:" + r["chat"])
        if r["ai_words"]: flags.append("ai:" + r["ai_words"])
        if r["whatsapp"]: flags.append("whatsapp")
        if r["booking"]: flags.append("book:" + r["booking"])
        print(f"  {r['name'][:38]:38} {r['status']:12} {' '.join(flags) or '-'}")


if __name__ == "__main__":
    main()
