# Cloudflare Edge Hardening + Speed

Two layers: **config you click in the dashboard** (no code, can't break your app) and
**headers/cache rules you ship in the repo** (can break things — roll out in the order below).

Do the dashboard layer first. It's free, instant, and reversible.

---

## PART 1 — DASHBOARD SETTINGS (do this today)

### SSL / TLS
- Encryption mode: **Full (Strict)** — not Flexible. Flexible leaves the hop between Cloudflare
  and your origin unencrypted and allows redirect loops.
- **Always Use HTTPS**: ON
- **Automatic HTTPS Rewrites**: ON
- **Minimum TLS Version**: 1.2
- **HSTS**: enable only *after* you're certain HTTPS works everywhere. Start `max-age` at
  `300`, confirm nothing breaks for a week, then raise to `31536000` and add `includeSubDomains`.
  HSTS is very hard to undo — browsers cache it.

### Security
- **WAF → Managed Rules**: enable the Cloudflare Free Managed Ruleset (blocks a large slice of
  automated OWASP-style probing).
- **Bot Fight Mode**: ON (verify Googlebot and your payment provider's webhooks still get through —
  check the WAF events log after 24h).
- **Turnstile**: add to signup, login, password reset, contact, and review forms. Free,
  no puzzles, far better UX than reCAPTCHA. Verify the token **server-side** — a client-side-only
  check is decorative.
- **Rate limiting rule** (free tier gives you one — spend it on login):
  - Expression: `http.request.uri.path contains "/login"` and method `POST`
  - Rate: 5 requests per 10 minutes per IP
  - Action: Block, 1 hour
- **Scrape Shield → Email Obfuscation**: ON
- Block your admin path by country/IP if you only administer from one place:
  - Custom rule: `http.request.uri.path contains "/admin" and ip.src ne <your.ip>` → Block
  - (Belt and braces only — server-side auth is still mandatory.)

### Origin protection
If your app runs on Workers/Pages, this is handled. If it runs on your own server:
- Your origin IP must not be publicly reachable. Use **Cloudflare Tunnel** or firewall the origin
  to Cloudflare IP ranges only. Otherwise attackers hit the IP directly and bypass everything above.
- Check for DNS records that leak the real IP (old `ftp.`, `mail.`, `direct.`, `cpanel.` A records).

### Speed
- **Brotli**: ON
- **HTTP/3 (QUIC)**: ON
- **0-RTT Connection Resumption**: ON
- **Early Hints**: ON
- **Tiered Cache**: ON (Smart Tiered Cache)
- **Images**: use Cloudflare Images or Image Resizing if available on your plan — it's the single
  biggest LCP win on a product-heavy store.
- **Auto Minify**: skip it. Your build tool already minifies; edge minification occasionally
  breaks inline scripts.

---

## PART 2 — CACHE RULES (the biggest speed lever, and the biggest footgun)

Create these in **Caching → Cache Rules**, in this order. The bypass rules must come first.

**Rule 1 — Never cache private pages (highest priority)**
```
(http.request.uri.path contains "/cart") or
(http.request.uri.path contains "/checkout") or
(http.request.uri.path contains "/account") or
(http.request.uri.path contains "/api/") or
(http.request.uri.path contains "/admin") or
(http.cookie contains "session")
→ Bypass cache
```
Get this wrong and one customer sees another customer's cart. Test it before anything else:
log in as two different users in two browsers and confirm each sees their own cart.

**Rule 2 — Cache static assets hard**
```
(http.request.uri.path matches "\.(js|css|woff2|svg|png|jpg|jpeg|webp|avif|ico)$")
→ Eligible for cache, Edge TTL 1 year, Browser TTL 1 year
```
Only safe if your build fingerprints filenames (`app.a3f9c1.js`). If it doesn't, cap at 1 hour.

**Rule 3 — Cache product/category HTML briefly** (optional, only if those pages are identical
for every logged-out visitor — no "Hi Sarah", no personalised recommendations)
```
(http.request.uri.path contains "/products/") and not (http.cookie contains "session")
→ Edge TTL 5 minutes, Browser TTL 0
```

---

## PART 3 — SECURITY HEADERS

If you're on **Cloudflare Pages**, put this file at the root of your build output directory as
`_headers`. If you're on **Workers** or a framework with its own middleware, set the same
headers there instead.

```
/*
  Strict-Transport-Security: max-age=300
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

Notes:
- `X-Frame-Options: DENY` stops clickjacking. If your payment provider needs to frame a page of
  yours, change that one route to `SAMEORIGIN` — don't remove it globally.
- Raise `Strict-Transport-Security` to `max-age=31536000; includeSubDomains` only after a week
  of clean HTTPS, as above.
- `payment=(self)` keeps the Payment Request API working; if your checkout embeds a provider
  iframe that needs it, add that origin: `payment=(self "https://checkout.provider.com")`.

### Content-Security-Policy — add this LAST, and in report-only mode first

CSP is the strongest header here and the one most likely to white-screen your store, because
e-commerce sites load payment iframes, analytics, chat widgets, and fonts from many origins.

**Step 1** — ship report-only for a week (blocks nothing, logs everything):
```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-src https:; connect-src 'self' https:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'
```

**Step 2** — check your browser console on every page (especially checkout) and add each blocked
origin explicitly. Typical final shape:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.yourstore.com; font-src 'self'; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'
```

**Step 3** — only once the report-only version logs zero violations for a week, rename the header
to `Content-Security-Policy`.

Do not let an agent write your CSP in one shot and deploy it. Go through the report-only stage.

---

## PART 4 — WHAT THIS DOES AND DOESN'T BUY YOU

**Genuinely closed off:** automated vulnerability scanners, credential-stuffing bots, most
injection attempts, DDoS, clickjacking, MIME sniffing, mixed content, direct-to-origin attacks,
and the XSS classes CSP covers.

**Still open, because no edge config can fix them:**
- **Broken authorisation in your own code** — the #1 way real stores get breached. Cloudflare
  will happily forward a perfectly-formed request from User A asking for User B's order.
  That's Phase 1 Group A in the playbook.
- **Leaked credentials** — an admin password in a phishing email, or an API key in a screenshot.
- **A compromised dependency** in your supply chain.
- **Your own laptop** being compromised.

Which is why the honest version of "no one can hack my website anymore" is: *you eliminate the
attacks that scanners and bots run automatically against every site on the internet, and you
reduce the rest to a handful of paths that require a targeted, skilled attacker.* That's a
realistic and very good outcome. Anyone who tells you they can deliver more than that in a
script is selling something.
