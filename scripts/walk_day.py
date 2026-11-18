"""Build the Sandy / Potton / Biggleswade walk day, re-scored on the five-question test.

Reads the qualified pipeline, groups doors into the four stops, geocodes them once
(cached in walk-day-coords.json), then writes the map and two printable PDFs.
"""
import csv, json, os, re, time
import urllib.parse, urllib.request

SRC = "campaign/clinic-outreach/qualified.csv"
CACHE = "campaign/clinic-outreach/walk-day-coords.json"

# platform -> what a five-question test can now do about it
TEST_PLATFORMS = {"phorest", "fresha", "pabau", "goldie", "vagaro", "mindbody",
                  "simplybook", "booksy", "treatwell"}
GO_PLATFORMS = {"timely", "setmore", "square", "acuity", "cliniko", "calendly", "bookinbeautiful"}

HOME_STREETS = ("glebe rd", "ribble mead", "winston cres", "collings cres", "ickwell rd",
                "bellflower gdns", "sunflower croft", "chapman cl", "jacobs cl", "longfield rd",
                "coltsfoot", "the woodlands", "poppy fld", "riverside gardens", "beeston")

RESTORED = {"azalea beauty salon", "beauty & aesthetics by jo", "le roux beauty",
            "pretty & polished", "the beauty spot sandy"}

LUNCH = {"name": "O' Sarracino", "addr": "5 Sun Street, Market Square, Potton SG19 2LR",
         "why": "sit down, eat, no pitching. On the square where stop 2 ends."}
PARK_SANDY = {"name": "Sandy Town Centre car park", "addr": "High Street, Sandy SG19 1AG"}
PARK_BIGG = {"name": "Biggleswade town centre parking", "addr": "near Shortmead Street, SG18 0AP"}


def score(platform):
    p = (platform or "").split(",")[0].strip()
    if p in TEST_PLATFORMS:
        return "TEST", f"{p} sells message AI - send the five questions before you accept it"
    if p in GO_PLATFORMS:
        return "GO", f"{p} has no message AI - the gap is real"
    if p:
        return "ASK", f"{p} - ask what it answers"
    return "GO", "no booking platform on site - phone, DM or form bookings"


def group(r):
    a = r["address"].lower()
    if "potton" in a:
        return "2 Potton"
    if any(s in a for s in HOME_STREETS):
        return "5 home"
    if r["town"] == "Sandy":
        return "1 Sandy"
    if r["town"] == "Biggleswade":
        if re.search(r"sg18 0", a) and not any(v in a for v in ("langford", "caldecote", "northill")):
            return "3 Biggleswade"
        return "4 edges"
    return ""


def load():
    rows = list(csv.DictReader(open(SRC)))
    keep = []
    for r in rows:
        if r["town"] not in ("Sandy", "Biggleswade"):
            continue
        g = group(r)
        if not g:
            continue
        v, why = score(r["platform"])
        keep.append({**{k: r[k] for k in ("name", "address", "phone", "platform", "website", "rating", "reviews")},
                     "group": g, "verdict": v, "why": why,
                     "restored": r["name"].strip().lower() in RESTORED})
    keep.sort(key=lambda r: (r["group"], -(float(r["reviews"] or 0))))
    return keep


def geocode(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q + ", UK", "format": "json", "limit": 1})
    req = urllib.request.Request(url, headers={"User-Agent": "theaipound-walkday/1.0 (david@theaipound.co.uk)"})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=25))
        if d:
            return float(d[0]["lat"]), float(d[0]["lon"])
    except Exception:
        pass
    return None, None


def coords(doors):
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    todo = []
    for d in doors:
        key = d["address"]
        if key not in cache:
            todo.append(key)
    for k in todo:
        lat, lon = geocode(k)
        if lat is None:
            lat, lon = geocode(k.split(",")[-2].strip() if "," in k else k)
        cache[k] = [lat, lon]
        time.sleep(1.1)
    for extra in (LUNCH, PARK_SANDY, PARK_BIGG):
        key = extra["addr"]
        if key not in cache:
            lat, lon = geocode(key)
            cache[key] = [lat, lon]
            time.sleep(1.1)
    json.dump(cache, open(CACHE, "w"), indent=0)
    for d in doors:
        d["lat"], d["lon"] = cache.get(d["address"], [None, None])
    return cache


if __name__ == "__main__":
    doors = load()
    c = coords(doors)
    from collections import Counter
    print(len(doors), "doors")
    print(Counter(d["group"] for d in doors))
    print(Counter(d["verdict"] for d in doors))
    print("restored:", [d["name"] for d in doors if d["restored"]])
    miss = [d["name"] for d in doors if not d["lat"]]
    print("no coords:", len(miss), miss[:6])
    json.dump(doors, open("campaign/clinic-outreach/walk-day.json", "w"), indent=1)
