#!/usr/bin/env python3
"""Harvest published contact emails from Priority A clinic websites."""
import csv, re, subprocess, pathlib, concurrent.futures as cf
from urllib.parse import urlparse

SRC = "campaign/clinic-outreach/prospects-pipeline.csv"
OUT = pathlib.Path("campaign/clinic-outreach/prospects-priority-a-emails.csv")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36"
BAD_DOMAINS = {"mysite.com", "domain.com", "example.com", "sentry.io", "wixpress.com",
               "email.com", "yourdomain.com", "website.com", "squarespace.com", "shopify.com"}
BAD_LOCAL = {"user", "example", "your", "email", "name", "test"}
BAD_EXT = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js", ".ico")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

def fetch(url, timeout=14):
    try:
        r = subprocess.run(["curl", "-sL", "--max-time", str(timeout), "-A", UA, url],
                           capture_output=True, text=True, errors="ignore")
        return r.stdout or ""
    except Exception:
        return ""

def clean(hits, site_host):
    out = []
    for e in hits:
        e = e.strip().strip(".,;:").lower()
        if any(e.endswith(x) for x in BAD_EXT):
            continue
        local, _, dom = e.partition("@")
        if not local or not dom or "." not in dom:
            continue
        if dom in BAD_DOMAINS or local in BAD_LOCAL:
            continue
        if len(local) > 40 or len(dom) > 40:
            continue
        score = 0
        if site_host and (dom == site_host or dom.endswith("." + site_host) or site_host.endswith("." + dom)):
            score += 2
        if local in ("info", "hello", "enquiries", "enquiry", "contact", "reception", "admin", "clinic"):
            score += 2
        out.append((score, e))
    out.sort(key=lambda t: -t[0])
    seen, res = set(), []
    for _, e in out:
        if e not in seen:
            seen.add(e); res.append(e)
    return res

def probe(row):
    url = row["website"].strip()
    if not url:
        return dict(row, email="", alternatives="", source_url="")
    if not url.startswith("http"):
        url = "https://" + url
    host = urlparse(url).netloc.lower().replace("www.", "")
    html = fetch(url)
    emails = clean(EMAIL.findall(html), host)
    src = url
    if not emails:
        for path in ("/contact", "/contact-us", "/contact.html", "/book"):
            h = fetch(url.rstrip("/") + path)
            if not h:
                continue
            emails = clean(EMAIL.findall(h), host)
            if emails:
                src = url.rstrip("/") + path
                break
    return dict(row, email=(emails[0] if emails else ""), alternatives=";".join(emails[1:3]), source_url=src)

rows = [r for r in csv.DictReader(open(SRC)) if r["priority"] == "A"]
print(f"priority A: {len(rows)}")
with cf.ThreadPoolExecutor(max_workers=16) as ex:
    res = list(ex.map(probe, rows))
found = [r for r in res if r["email"]]
print(f"found an address: {len(found)} ({len(found)/len(rows)*100:.0f}%)")

cols = ["name", "town", "drive_day", "category", "rating", "reviews", "phone", "email",
        "alternatives", "website", "source_url", "address", "first_line", "priority", "status"]
with OUT.open("w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    for r in found:
        w.writerow(r)
print("written:", OUT, "rows", len(found))
