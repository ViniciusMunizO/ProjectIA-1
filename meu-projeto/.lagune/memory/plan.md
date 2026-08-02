# meu-projeto Defense Plan

- **Scope:** all detect findings.
- **Planned:** 2026-08-02

## Fixes

### Signup reveals whether an e-mail is already registered

- **Category:** User enumeration (CWE-203: Observable Discrepancy)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N (5.3, Medium)
- **Priority:** Medium
- **Why this priority:** The signup endpoint is unauthenticated and internet-facing, and the discrepancy costs an attacker nothing to check at volume, so exposure is maximal even though the leak itself is a single yes/no fact about account existence, not account access.
- **Upholds:** None directly.
- **Fix:** Equalize the signup response so the "already registered" and "account created" paths cost the same to distinguish: match response timing between the two branches, and consider replacing the immediate 409 with a uniform "check your e-mail to finish setting up your account" response (with the existing-account case sending a "you already have an account, sign in instead" notice) once the project has outbound e-mail. Until then, at minimum equalize timing and keep the distinct status code documented as a deliberate, reviewed tradeoff rather than an oversight.
- **References:** [CWE-203: Observable Discrepancy](https://cwe.mitre.org/data/definitions/203.html), [OWASP Authentication Cheat Sheet, User Enumeration Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#user-enumeration-prevention)

### No Content-Security-Policy or anti-framing response headers

- **Category:** Missing security headers / Clickjacking (CWE-1021: Improper Restriction of Rendered UI Layers, CWE-693: Protection Mechanism Failure)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N (4.6, Medium)
- **Priority:** Medium
- **Why this priority:** Reaching a victim only takes getting them to open an attacker's page (no prior access needed), and the pages left unprotected are specifically the login and signup forms, the highest-value surface in the app for a framing or overlay trick.
- **Upholds:** None directly.
- **Fix:** Add `frame-ancestors 'self'` (and an `X-Frame-Options: SAMEORIGIN` fallback for older browsers) at the layer that actually serves the frontend's HTML, the Vite dev server response and the production static host/reverse-proxy config, since the Express API itself only ever returns JSON. Add a baseline `Content-Security-Policy` (`default-src 'self'`) alongside it. On the API, add the same headers defensively on any response path that could ever serve HTML (for example a framework-generated error page), as cheap defense in depth.
- **References:** [CWE-1021: Improper Restriction of Rendered UI Layers](https://cwe.mitre.org/data/definitions/1021.html), [OWASP Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)

### Session lifetime is absolute-only, with no idle timeout or revocation visibility

- **Category:** Insufficient session expiration (CWE-613)
- **CVSS:** CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N (3.0, Low)
- **Priority:** Low
- **Why this priority:** This finding only widens the damage of a session already stolen by some other means (there is no route to it on its own), and it guards a single-tenant hobby-scale account rather than a high-value or shared-custody asset, so it settles low even though the underlying idea (bounding a stolen session's lifetime) matters.
- **Upholds:** None directly.
- **Fix:** Track a last-activity timestamp per session and treat a session as expired after a shorter idle window (for example 2 hours) in addition to the existing 24-hour absolute cap. Add a `GET /api/auth/sessions` (list) and a way to revoke a session other than the current one, using the existing `sessions` table, which already has everything needed except the last-activity column.

## Open questions

- None. Every finding in the detect map has a planned fix above.
