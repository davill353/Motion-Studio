"""Qualify clinic prospects before a visit: does their booking system already
sell an AI that answers patient messages (the thing we sell)?

Reads campaign/clinic-outreach/prospects-pipeline.csv, checks each website
(home page plus up to three "book" pages), detects the booking platform and
any chat widget, and writes campaign/clinic-outreach/qualified.csv with a
verdict per clinic:

  GO     no booking-platform AI that answers messages: our assistant fills a gap
  MAYBE  platform AI answers phone calls only, or the site could not be read
  SKIP   platform already offers AI that answers messages / WhatsApp
         (same job as ours; the clinic will just switch theirs on)

Platform facts checked November 2026 (see clinic-outreach/qualify-notes.md).
Usage: python3 scripts/qualify_clinics.py [town ...]
"""
import csv, re, ssl, sys
import urllib.request
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor

SRC = "campaign/clinic-outreach/prospects-pipeline.csv"
OUT = "campaign/clinic-outreach/qualified.csv"

# platform -> (regex, verdict, what their AI does)
PLATFORMS = {
    "phorest":   (r"phorest",                       "SKIP",  "Front Desk AI answers SMS + WhatsApp 24/7, books and answers FAQs"),
    "pabau":     (r"pabau",                         "SKIP",  "AI Receptionist + WhatsApp (Engage Plus add-on)"),
    "fresha":    (r"fresha\.com",                   "SKIP",  "AI Concierge answers calls and messages, books (add-on)"),
    "goldie":    (r"heygoldie",                     "SKIP",  "AI Receptionist replies to client texts, books"),
    "vagaro":    (r"vagaro",                        "SKIP",  "Vera chatbot replies to messages after hours"),
    "mindbody":  (r"mindbody|mindbodyonline",       "SKIP",  "AI Concierge over SMS and web chat, books"),
    "simplybook":(r"simplybook",                    "SKIP",  "AI answers customers (texts/WhatsApp, partial)"),
    "treatwell": (r"treatwell",                     "MAYBE", "AI Receptionist answers phone calls only; WhatsApp 'coming soon'"),
    "booksy":    (r"booksy",                        "MAYBE", "AI Receptionist for calls, in beta"),
    "timely":    (r"gettimely|timely\.com",         "GO",    "No receptionist AI (only an AI text-writing helper)"),
    "cliniko":   (r"cliniko",                       "GO",    "No AI of its own"),
    "setmore":   (r"setmore",                       "GO",    "Human phone answering, no AI"),
    "square":    (r"squareup\.com/appointments|square\.site", "GO", "No receptionist AI"),
    "acuity":    (r"acuityscheduling|squarespace-scheduling", "GO", "No receptionist AI"),
    "calendly":  (r"calendly",                      "GO",    "No receptionist AI"),
    "bookinbeautiful": (r"bookinbeautiful",         "GO",    "No receptionist AI found"),
}
# third-party chat / AI widgets: if present, they already have something answering
WIDGETS = {
    "tidio": r"tidio", "intercom": r"intercom", "crisp": r"crisp\.chat", "freshchat": r"freshchat",
    "drift": r"js\.driftt", "tawk": r"tawk\.to", "zendesk": r"zopim|zdassets", "livechat": r"livechatinc",
    "podium": r"podium", "hubspot-chat": r"js\.hs-scripts", "manychat": r"manychat", "botpress": r"botpress",
    "voiceflow": r"voiceflow", "chatbase": r"chatbase", "wati": r"wati\.io", "respond": r"respond\.io",
    "callpad": r"callpad", "smartsupp": r"smartsupp", "elfsight-chat": r"elfsight.*chat",
}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
RANK = {"SKIP": 0, "MAYBE": 1, "GO": 2}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
    with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
        return r.geturl(), r.read(800000).decode("utf-8", "ignore")


def book_links(base, html):
    out = []
    for href, label in re.findall(r'<a[^>]+href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', html, re.S | re.I):
        text = (href + " " + re.sub("<[^>]+>", " ", label)).lower()
        if re.search(r"book|appointment|consult|contact", text):
            u = urljoin(base, href)
            if u.startswith("http") and u not in out:
                out.append(u)
    return out[:3]


def check(row):
    url = row["website"].strip()
    res = {"platform": "", "widget": "", "whatsapp": "", "site": "ok"}
    if not url or url == "-":
        res["site"] = "no website"
        return res
    if not url.startswith("http"):
        url = "https://" + url
    pages = []
    try:
        final, html = fetch(url)
        pages.append(html)
        for u in book_links(final, html):
            # an off-site booking link already names the platform; no need to open it
            pages.append(u)
            if urlparse(u).netloc == urlparse(final).netloc:
                try:
                    pages.append(fetch(u)[1])
                except Exception:
                    pass
    except Exception as e:
        res["site"] = "unreachable"
        pages.append(url)  # the URL itself may be a booking page (e.g. gettimely, heygoldie)
    blob = " ".join(pages).lower()
    res["platform"] = ",".join(k for k, (p, _, _) in PLATFORMS.items() if re.search(p, blob))
    res["widget"] = ",".join(k for k, p in WIDGETS.items() if re.search(p, blob))
    res["whatsapp"] = "yes" if re.search(r"wa\.me/|api\.whatsapp\.com", blob) else ""
    if "instagram.com" in url or "facebook.com" in url:
        res["site"] = "social only"
    return res


def verdict(r):
    plats = [p for p in r["platform"].split(",") if p]
    if plats:
        v = min((PLATFORMS[p][1] for p in plats), key=RANK.get)
        why = "; ".join(f"{p}: {PLATFORMS[p][2]}" for p in plats)
    elif r["site"] == "unreachable":
        v, why = "MAYBE", "website would not load: ask at the door what booking system they use"
    else:
        v, why = "GO", "no booking platform with AI found on site (phone / DM / form bookings)"
    if r["widget"]:
        v = "SKIP" if v == "GO" else v
        why += f"; chat widget already on site: {r['widget']}"
    return v, why


def main():
    towns = {t.lower() for t in sys.argv[1:]}
    rows = list(csv.DictReader(open(SRC)))
    if towns:
        rows = [r for r in rows if r["town"].lower() in towns]
    with ThreadPoolExecutor(max_workers=16) as ex:
        checks = list(ex.map(check, rows))
    keys = ["verdict", "why", "town", "name", "category", "priority", "score", "rating", "reviews",
            "phone", "address", "website", "platform", "widget", "whatsapp", "site", "status", "notes", "place_id"]
    out = []
    for row, c in zip(rows, checks):
        r = {**row, **c}
        r["verdict"], r["why"] = verdict(r)
        out.append({k: r.get(k, "") for k in keys})
    out.sort(key=lambda r: (-RANK[r["verdict"]], r["town"], -int(r["score"] or 0)))
    with open(OUT, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        w.writerows(out)
    from collections import Counter
    print(f"{len(out)} clinics -> {OUT}")
    print(Counter(r["verdict"] for r in out))
    print(Counter(p for r in out for p in r["platform"].split(",") if p))


if __name__ == "__main__":
    main()
