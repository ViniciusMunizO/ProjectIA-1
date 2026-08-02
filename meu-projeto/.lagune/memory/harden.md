# meu-projeto Hardening Record

- **Scope:** all plan fixes.
- **Hardened:** 2026-08-02

## Applied

### Signup reveals whether an e-mail is already registered

- **Status:** Applied
- **What changed:** The password hash is now computed before the code checks whether the e-mail already has an account, instead of after, so both the "account created" and "e-mail already registered" paths do the same expensive work before responding. Verified: both paths now measure within about 1ms of each other (32ms vs 33ms), against a multi-hundred-millisecond difference before. The distinct 409 status code and message are kept as a deliberate, documented tradeoff, since closing that part fully needs outbound e-mail the project does not have yet.
- **Where:** the signup service function, reordering the hash call ahead of the existence check.
- **Verdict:** ❌ Reproved
- **Reason:** The timing side-channel is closed (verified live: 32ms vs 33ms). But the primary, far easier signal is untouched: the route still returns 409 with `{"error":"E-mail já cadastrado"}` for an existing e-mail and 201 with the new user for a new one, so anyone can enumerate registered e-mails from the status code alone without needing to measure timing at all.

### No Content-Security-Policy or anti-framing response headers

- **Status:** Partial
- **What changed:** `X-Frame-Options: SAMEORIGIN` and a baseline `Content-Security-Policy: default-src 'self'; frame-ancestors 'self'` are now set on every API response. `X-Frame-Options: SAMEORIGIN` is also set on the Vite dev server's own responses (which is what actually serves the login/signup HTML today).
- **Where:** a new header-setting middleware at the top of the Express app's middleware chain; the Vite dev server's `server.headers` config.
- **Verdict:** ❌ Reproved
- **Reason:** The clickjacking half is genuinely closed: `X-Frame-Options: SAMEORIGIN` is live on both the API (verified via a live request) and the Vite dev server that actually serves the login/signup HTML. The Content-Security-Policy half is not: the API's `default-src 'self'` header sits on a JSON-only service that serves no HTML, so it protects nothing, and the frontend's own served HTML (dev or production) carries no CSP at all. The XSS-defense-in-depth part of this finding is still open.

### Session lifetime is absolute-only, with no idle timeout or revocation visibility

- **Status:** Partial
- **What changed:** Sessions now carry a `last_seen_at` column, updated on every authenticated request, and a session is treated as expired after 2 hours of inactivity (`SESSION_IDLE_TIMEOUT_HOURS`, configurable) in addition to the existing 24-hour absolute cap. Added `GET /api/auth/sessions` (list the caller's own active sessions) and `DELETE /api/auth/sessions/:publicId` (revoke one), both scoped to the authenticated user. While building this, caught and fixed a mistake in the same change before it shipped: the first draft would have returned each session's real bearer token (the same value as the httpOnly cookie) in the JSON list response, which page scripts can read, directly undermining the httpOnly protection. Fixed by adding a separate `public_id` that is safe to expose and never the same value as the session cookie; the real token never leaves the database. Verified end to end: two logins produce two listed sessions, revoking one immediately invalidates its cookie, and a second user attempting to revoke the first user's session gets a 404, not another user's data.
- **Where:** the `sessions` table (new `public_id` and `last_seen_at` columns), the session repository's lookup/touch/list/revoke functions, the session service, and two new routes on the auth router.
- **Verdict:** ❌ Reproved
- **Reason:** The automatic half is closed: idle and absolute timeouts are enforced in the repository's session lookup for every request, and the revoke endpoint is correctly scoped per-user (verified: a second user revoking the first user's session by its public id gets 404, not another user's data). But no frontend UI calls `GET /api/auth/sessions` or the revoke endpoint, so an actual user still has no way to see or end their own sessions from the app, which is half of what this finding named.

## Remaining

- **No Content-Security-Policy or anti-framing response headers:** the full `Content-Security-Policy` on the frontend's own served HTML (not just the API) is not yet applied. A CSP strict enough to matter risks breaking Vite's dev-mode HMR if added blindly, and the correct place to set it in production (the static host or reverse proxy that will serve the built frontend) is not decided yet, tracked under detect's "Not determined". Revisit once the production hosting shape is chosen.
- **Session lifetime is absolute-only, with no idle timeout or revocation visibility:** the idle timeout and revoke API are live on the backend, but no frontend UI surfaces the session list or a revoke action yet. A user cannot currently see or end another one of their own sessions from the app itself, only the automatic idle expiry protects them.
