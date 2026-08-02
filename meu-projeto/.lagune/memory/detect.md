# meu-projeto Detect Map

- **Scope:** the login/signup + protected cadastro feature: `server/src/**`, `shared/src/**`, `meu-projeto/src/**`.
- **Mapped:** 2026-08-02

## Findings

### Signup reveals whether an e-mail is already registered

- **What it is:** The signup endpoint answers "credenciais inválidas" style anonymity for login, but responds with a distinct 409 "E-mail já cadastrado" when the e-mail already has an account, instead of a uniform response.
- **Why it matters:** An attacker can enumerate registered e-mail addresses one guess at a time by watching the status code, which narrows targeting for a later credential-stuffing or phishing pass against exactly the accounts confirmed to exist.
- **Evidence:** the signup service function that checks for an existing user by e-mail before creating one, and the signup route that surfaces that check as a 409.

### No Content-Security-Policy or anti-framing response headers

- **What it is:** The backend sends no `Content-Security-Policy`, `X-Frame-Options`, or `frame-ancestors` header on any response, and the frontend has no equivalent meta tag.
- **Why it matters:** These are defense-in-depth layers behind encoding, not the primary control, but their absence means a future XSS-shaped mistake has one fewer backstop, and the login/signup page can currently be framed by any other site (a clickjacking surface, since the login and signup forms are exactly the kind of interaction an attacker would want to overlay).
- **Evidence:** the Express app's middleware chain, which sets CORS headers but no other security headers; the frontend's HTML head, which carries no CSP meta tag.

### Session lifetime is absolute-only, with no idle timeout or revocation visibility

- **What it is:** A session is valid until a fixed 24-hour expiry from creation. There is no idle/sliding timeout, and no way for a user to see or revoke their other active sessions.
- **Why it matters:** A stolen session cookie stays usable for up to 24 hours regardless of inactivity, and a user who suspects their session was copied has no way to end it themselves short of the accepted single-session logout.
- **Evidence:** the sessions table and the session-lookup function, which only compares the stored `expires_at` against the current time.

## Applied sub-skills

- `.lagune/skills/credential-endpoint.md`: confirmed per-IP and per-e-mail throttling on login/signup exist and are layered correctly, but surfaced "Signup reveals whether an e-mail is already registered".
- `.lagune/skills/access-control.md`: confirmed password hashing (Argon2id), per-user data scoping on every cadastro query, session cookie flags, and mass-assignment safety (schemas whitelist exact fields) all hold; surfaced "Session lifetime is absolute-only, with no idle timeout or revocation visibility".
- `.lagune/skills/upload.md`: confirmed the cadastro endpoint is JSON-only with no multipart parser anywhere in the backend, so an uploaded file structurally cannot reach the server regardless of what a client sends. No finding; the control holds by construction.
- `.lagune/skills/browser.md`: confirmed no `dangerouslySetInnerHTML`, no unvalidated URL-scheme props, no client-side storage of the session token; surfaced "No Content-Security-Policy or anti-framing response headers".
- `.lagune/skills/react.md`: confirmed no untrusted prop spreading, Vite's `server.fs.allow` is scoped to exactly `../shared` (not widened further), and no production source-map setting is enabled. No new finding beyond what `browser.md` already surfaced.
- `.lagune/skills/crypto.md`: deterministic scan found no weak cryptography; confirmed session tokens and the cookie secret are CSPRNG-sourced (`node:crypto.randomBytes`), and Argon2id is used with tuned parameters, never a hand-rolled scheme.
- `.lagune/skills/secrets.md`: deterministic scan found no hardcoded secrets; confirmed `.env` is gitignored with only `.env.example` committed, and `COOKIE_SECRET` is loaded from the environment.
- `.lagune/skills/regex.md` (required): deterministic scan of every pattern in scope found no ReDoS-prone regular expression.
- `.lagune/skills/path.md`: confirmed the only filesystem path built at runtime (the SQLite database path) comes from a developer-controlled environment variable, never from request input, so no untrusted value reaches a file operation.

## Not determined

- Production deployment shape (same-origin reverse proxy vs. separate origins for the frontend and API) is not decided in code yet, so the CORS/cookie configuration's production behavior (the `Secure` flag activates, but the exact production `CORS_ORIGIN` value) cannot be confirmed beyond development.
