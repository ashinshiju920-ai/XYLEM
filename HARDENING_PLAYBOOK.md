# Antigravity Hardening Playbook

Run these phases **in order**. Each one is a separate agent task on a separate git branch.
Do not skip Phase 0. Do not run two phases at once.

**Before you start anything:**

```bash
git add -A && git commit -m "baseline before hardening"
git tag baseline-pre-hardening
git push origin --tags
```

That tag is your undo button for the entire project. Also set Antigravity's autonomy preset to
**Review-driven** (not full auto) for Phases 1–3.

---

## PHASE 0 — AUDIT ONLY (no code changes)

> **This is the most important phase.** You get a map of the actual problems instead of an agent
> guessing. Read the output yourself before approving anything.

### Prompt to paste

```
READ-ONLY AUDIT. You may not edit, create, delete, move, or format any file in this task.
Output is a report only.

Read AGENTS.md first and follow it.

Produce a single Artifact called SECURITY_AUDIT.md with these sections:

## 1. Stack inventory
Framework, runtime, package manager, database, ORM, auth library, payment provider,
hosting target, build tool. List every dependency with its version and flag any that are
unmaintained or have known advisories (run the lockfile audit command for this package manager).

## 2. Attack surface map
Every route/endpoint in the app, in a table:
| method | path | auth required? | who can access | reads/writes what | input validated? |
Mark any endpoint where an authenticated user could access another user's data by changing an
ID in the request (IDOR). This is the highest-priority category — check every single one.

## 3. Trust-boundary violations
Find every place the server trusts a value that came from the browser. Specifically check:
price, quantity, discount/coupon, shipping cost, tax, currency, total, user_id, order_id, role,
is_admin, stock level. Quote the file:line for each.

## 4. Injection risks
Every string-concatenated SQL query, every raw HTML injection point, every eval / new Function /
shell exec / unsanitised dangerouslySetInnerHTML. file:line each.

## 5. Auth & session findings
Password hashing algorithm and cost. Cookie flags actually set. Token storage location.
Session rotation on login (yes/no). Password reset token entropy and expiry.
CSRF protection present (yes/no) and mechanism.

## 6. Secrets exposure
Any credential, key, token, or connection string hardcoded in source, config, or committed
.env files. ALSO scan git history for secrets that were committed and later removed.
Report file:line and which key it is — NEVER print the secret value itself.

## 7. Headers & transport
Which security headers the app currently sets. Which are missing.
CORS configuration as it exists today.

## 8. Error & logging leakage
Any place a stack trace, SQL error, file path, or internal detail reaches the client in
production mode. Any place a secret, token, password, or full card detail could be logged.

## 9. Dead code candidates
Run static analysis (knip, depcheck, ts-prune, or the equivalent for this stack) and report:
unused exports, unused files, unused dependencies, unreachable routes, duplicate
implementations of the same logic. For each, state your confidence and how you verified it,
including whether it could be referenced dynamically (string imports, config, env-driven).
DO NOT DELETE ANYTHING. This is a list for me to approve.

## 10. Performance baseline
Use the browser tool. For home, a category page, a product page, and the cart:
LCP, INP, CLS, total JS (KB), total requests, largest 5 assets by size, number of
third-party scripts and what each one is. Screenshot each page.
Then list the top 10 slowest things and what's causing each.

## 11. Prioritised fix list
Rank every finding by (exploitability x blast radius) for security, and
(user-visible gain / risk of breaking something) for performance.
Split into: CRITICAL / HIGH / MEDIUM / LOW.
For each: the fix in one sentence, files touched, and risk of regression.

Do not fix anything. Stop when the report is written.
```

**Then: read the report yourself.** Anything the agent marks CRITICAL in checkout or payments —
decide personally whether an agent should touch it at all.

---

## PHASE 1 — SECURITY FIXES (one sub-phase at a time)

Branch: `security/phase-1`

### Prompt to paste

```
Read AGENTS.md and SECURITY_AUDIT.md. Follow AGENTS.md exactly.

Fix ONLY the findings I have marked approved below, in this order, committing after each group
and stopping for my review between groups:

GROUP A — Authorisation / IDOR
Add server-side ownership checks to every endpoint identified in audit section 2.
Pattern: resolve the resource, compare its owner to the authenticated session, return 404
(not 403 — don't confirm the resource exists) on mismatch. Do not change any response shape
for legitimate requests.

GROUP B — Trust boundary
Recompute server-side, from the database, every value listed in audit section 3.
The client may send product IDs and quantities only. Verify that legitimate carts produce
byte-identical totals to before — show me a before/after comparison for 5 real cart states.

GROUP C — Injection
Parameterise every query from audit section 4. Add schema validation (zod or this project's
existing validator) at each route boundary. Validation must reject only genuinely invalid
input — if any currently-working request would now be rejected, stop and tell me instead.

GROUP D — Auth & sessions
Apply audit section 5 fixes. If this requires invalidating existing sessions or rehashing
passwords, STOP and tell me the migration plan first — do not execute it.

GROUP E — Rate limiting
Add rate limiting + backoff to login, signup, password reset, and discount-code endpoints only.
Do not rate limit browsing or checkout.

GROUP F — Error handling & logging
Ensure production error responses are generic. Redact secrets and PII from logs.

For every group: run the golden path from AGENTS.md before and after, attach screenshots,
and report in the AGENTS.md reporting format.

Do NOT touch payment, webhook, or order-creation code. List what you would have changed there
and leave it for me.
```

---

## PHASE 2 — DEAD CODE REMOVAL (highest regression risk — go slow)

Branch: `cleanup/phase-2`

> Do this **after** security, never before, and never in the same branch. Approve the list
> line by line. If in doubt about any single item, keep it — dead code is not a bug, it's clutter.

### Prompt to paste

```
Read AGENTS.md. Remove ONLY the items from SECURITY_AUDIT.md section 9 that I have explicitly
approved below:

[paste your approved list here — nothing else gets deleted]

Rules:
- Before deleting each item, grep the ENTIRE repo (including config, CI, env files, HTML
  templates, and string literals) to prove nothing references it, and include that proof in
  your report.
- Delete unused npm dependencies before deleting source files.
- One commit per logical deletion, so any single one can be reverted alone.
- After each deletion: run the full build, run the test suite, and walk the golden path.
  If anything at all differs, revert that deletion immediately and mark the item KEEP.
- If a file is only referenced dynamically or you're under 95% confident, DO NOT delete it —
  mark it KEEP and explain why.

Report: what was deleted, KB removed from the bundle, what you kept and why.
```

---

## PHASE 3 — PERFORMANCE

Branch: `perf/phase-3`

### Prompt to paste

```
Read AGENTS.md section 5. Apply behaviour-preserving performance work only, in this order,
measuring before and after each step with the browser tool:

1. Cache headers: hashed static assets immutable 1 year; HTML no-cache.
   Never cache authenticated or personalised responses.
2. Images: convert to AVIF/WebP with fallbacks, set explicit width/height on every image to
   eliminate CLS, lazy-load everything below the fold, preload + fetchpriority="high" on the
   LCP image only. Do not change which images are shown, their crop, or their position.
3. Fonts: self-host, subset to the characters actually used, font-display: swap, preload only
   the above-the-fold font. Rendered text must look identical — screenshot-diff to prove it.
4. JavaScript: defer/async non-critical scripts, route-level code splitting, remove unused
   polyfills. Do not defer anything required for first render.
5. Third-party scripts: list each one with its KB cost and blocking behaviour. Propose loading
   each on idle or on first interaction. Do NOT remove any of them — that's my decision.
6. Database: fix N+1 queries on product listing, product detail, and cart. Add indexes on
   columns used in WHERE/JOIN/ORDER BY on those paths. Read paths only — no writes, no schema
   changes beyond index creation, and show me each CREATE INDEX before running it.

After each numbered step: golden path walk, screenshots, and the metric table
(LCP / INP / CLS / JS KB / requests) before vs after. If a step makes any metric worse or
changes any pixel, revert it and tell me.
```

---

## PHASE 4 — REGRESSION SAFETY NET

Branch: `test/phase-4`

```
Read AGENTS.md. Write automated end-to-end tests covering the 10 golden path steps, plus:
- an authenticated user attempting to read another user's order (must fail)
- a tampered cart payload with a modified price (must be recomputed, not trusted)
- an invalid and an expired discount code
- a checkout attempt with an out-of-stock item
Use the test framework already in this project. Do not modify application code to make tests
pass — if a test fails, report the failure as a bug.
```

---

## FINAL HUMAN CHECKLIST (do not delegate these)

- [ ] Every secret found in Phase 0 has been **rotated at the provider**, not just removed from code
- [ ] Payment provider is in live mode with live keys, and webhook signature verification is tested
- [ ] You personally placed a real test order end to end after all phases
- [ ] Database backups are automated and you have **restored one** to verify it works
- [ ] Admin accounts have unique strong passwords + 2FA
- [ ] You know how to roll back: `git revert <sha>` per commit, or redeploy the `baseline-pre-hardening` tag
