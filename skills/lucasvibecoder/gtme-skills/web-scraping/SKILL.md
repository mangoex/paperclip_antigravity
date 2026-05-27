---
name: executing-web-scraping
description: Extracts structured data from websites, single-page applications, and mobile APIs. Use when the user requests web scraping, automated data extraction, competitor monitoring, or parsing web content.
source: https://github.com/lucasvibecoder/gtme-skills
---

# Web Scraping Skill

## 1. Trigger Phrases

Activate this skill when the user says any of:
- "scrape", "extract data from", "crawl", "pull data from [website]"
- "monitor [site] for changes", "parse this page"
- "get all the [items] from [url]", "automated data extraction"
- "reverse engineer this API", "intercept mobile app traffic"

---

## 2. Pre-Scrape Analysis Gate

**Mandatory before writing ANY scraping code.** Do not skip steps.

### Step 1: Check for a Public API
```
Google "[site name] API" or "[site name] developer docs"
IF public API exists with the data you need -> use it. Done. No scraping needed.
Common examples with APIs: Twitter/X, Reddit, GitHub, Yelp, Google Maps, LinkedIn (unofficial)
```

### Step 2: Inspect Network Traffic
```
Open target URL in browser -> DevTools (F12) -> Network tab -> filter XHR/Fetch
Navigate the page, click buttons, scroll — watch for JSON responses
IF clean JSON endpoint found:
  -> Copy the request as cURL (right-click -> Copy as cURL)
  -> Reverse-engineer it with HTTPX
  -> This is almost always faster and more reliable than HTML scraping
```

### Step 2.5: Check for Embedded JSON State
```
Before classifying as SPA, fetch the raw HTML with HTTPX (plain GET with browser headers).
Search the HTML source for embedded data:
  - <script type="application/ld+json">     -> JSON-LD structured data
  - <script id="__NEXT_DATA__">              -> Next.js hydration payload
  - window.__INITIAL_STATE__                 -> Redux/Vuex pre-loaded state
  - window.__PRELOADED_STATE__               -> Same pattern, different variable name
  - Any <script> tag containing a large JSON blob (>1KB)

IF found:
  -> Verify the JSON contains the specific fields you need
  -> Extract with regex + json.loads — no browser needed
```

### Step 3: Check robots.txt
```
Fetch https://[domain]/robots.txt
Note:
  - Disallowed paths (don't scrape these unless user explicitly overrides)
  - Crawl-delay directive (respect it — sets minimum seconds between requests)
  - Sitemap URL (useful for discovering all pages)
```

### Step 4: Classify the Target

| Signal | Classification |
|--------|---------------|
| `view-source:` shows the data in raw HTML | Static HTML |
| `view-source:` is mostly empty `<div id="root">` | JS-rendered SPA |
| Page requires login before showing data | Behind auth |
| Cloudflare challenge page, CAPTCHA, or instant 403 | Protected / anti-bot |
| Data only available in mobile app | Mobile API |
| Content is unstructured text, not in tables/lists | Unstructured |

---

## 3. Target Classification -> Tool Selection Router

Read top to bottom. Use the **first** match.

```
IF public API exists -> requests/HTTPX + API key -> DONE
IF hidden JSON endpoint found -> HTTPX + direct endpoint
IF embedded JSON state found -> HTTPX + regex + json.loads
IF static HTML + small scale (<100 pages) -> BeautifulSoup + HTTPX
IF static HTML + large scale (>100 pages) -> Scrapy
IF JS-rendered SPA -> Playwright
IF behind auth (login required) -> Playwright with session cookies
IF unstructured OR layout changes frequently -> LLM extraction (markdownify + Claude)
IF behind Cloudflare / DataDome / CAPTCHA -> Evasion techniques first
IF mobile app only (no web version) -> Mobile API interception
```

---

## 4. Extraction Workflow

Follow these steps in order. Each step has a checkpoint.

```
1. RUN PRE-SCRAPE ANALYSIS (Section 2)
   checkpoint: You know the target classification and selected tool

2. WRITE EXTRACTION SCRIPT
   -> Apply operational basics to every script:
     - Rate limiting (minimum 1s between requests unless API allows more)
     - Retry logic with backoff
     - User-Agent header (never use default python-requests UA)

3. TEST ON 5 ITEMS FIRST
   -> Run against 5 URLs/items only
   -> Print results to console for user review
   checkpoint: Output shape matches expectations, no blocks

4. IF BLOCKED -> diagnose and escalate (Section 6)
   -> Do NOT retry the same request blindly
   -> Identify block type, apply fix, re-test on 5 items

5. SCALE TO FULL DATASET
   -> Add progress logging (items scraped / total, elapsed time)
   -> Save incrementally (don't lose data on crash)

6. VALIDATE OUTPUT (Section 5)

7. EXPORT to target format (JSON lines, CSV, or user-specified)
```

---

## 5. Output Validation Checklist

Run after extraction, before delivering to user.

```
[ ] SCHEMA CHECK - Every row has expected fields? Correct types?
[ ] NULL/EMPTY CHECK - Any field with >20% null rate? Flag it.
[ ] DEDUP - Remove duplicate rows by URL or unique identifier.
[ ] ENCODING CHECK - UTF-8 throughout? No mojibake?
[ ] SAMPLE INSPECTION - Print first 5 rows for review before delivering full dataset.
```

---

## 6. Feedback Loop — Blocked Request Escalation

When a request returns 403, CAPTCHA, empty response, or redirect loop:

```
403 Forbidden:
  -> Missing headers? Add User-Agent, Accept, Accept-Language, Referer
  -> Still 403? TLS fingerprint blocked -> Switch to tls-client
  -> Still 403? IP blocked -> Add proxy rotation

CAPTCHA / Cloudflare:
  -> Simple JS challenge? Playwright with stealth plugin
  -> Turnstile / hCaptcha? Managed browser service
  -> reCAPTCHA v3? Scraping API service (ScrapingBee, Bright Data)

Empty response:
  -> JS-rendered? Switch to Playwright
  -> Geo-blocked? Try proxy in target country
  -> Rate limited silently? Add delays, reduce concurrency

429 Too Many Requests:
  -> Increase delay between requests
  -> Add jitter (random 1-3s extra)
  -> Rotate proxies if available
```
