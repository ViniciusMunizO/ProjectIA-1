# meu-projeto Security Charter

## Principles

### I. Passwords are never stored or compared in plain text

Always hash passwords with a vetted algorithm (Argon2id) before storing them. Never log, transmit, or store a password in plain text anywhere, even temporarily, and never write a custom hashing or comparison routine.

- Why: a leaked password database is a full account-takeover event for every user, and for the many people who reuse passwords, for their other accounts too.

### II. All input is untrusted until validated, both client and server

Always validate and normalize every field (email, CPF, telefone, senha) on the server, using the same rules the interface shows the user, even when the browser already checked it. Never treat a client-side check as the last line of defense.

- Why: a client-side check can be turned off, bypassed with a direct request to the API, or missing on a path someone forgot to protect. The server is the only enforcement point an attacker cannot skip.

### III. A user only ever reaches their own data

Always resolve which user a request acts as from the authenticated session, server-side, and always scope every read or write of a cadastro record to that user. Never accept a client-supplied user id or record id as authorization to act on it.

- Why: trusting a client-supplied id lets one user read or edit another user's records just by changing a number in the request, a common and easily automated attack.

### IV. Sessions are opaque, server-revocable, and never readable by page scripts

Always issue session identifiers as random opaque tokens recorded server-side, delivered only in an httpOnly, Secure, SameSite cookie. Never store a session token or any credential in localStorage, sessionStorage, or a cookie a script can read, and never use a self-contained token (such as a JWT) as the only record of a session.

- Why: a token a script can read is a token any successful script-injection bug can steal, turning one small flaw into a full account takeover. A server-side session record can also be revoked the instant a user logs out; a token that is only ever inspected, never looked up, cannot be.

### V. An unstored upload never leaves the browser

When a file is not meant to be persisted, always keep it out of the request the browser sends, and never give the server a code path capable of receiving file bytes for that flow, not merely an interface that omits the option. Always validate a file's type and size in the browser before accepting it into the form.

- Why: removing the receiving code path removes the risk entirely. A gate that only lives in the interface is one direct request away from an unvalidated file landing on the server anyway.

### VI. Secrets live only in the environment, never in code or history

Never commit a secret, session-signing secret, or database credential to the repository. Always load them from environment variables, keep the file holding real values out of version control, and commit only a placeholder example file.

- Why: a secret committed to git history stays recoverable forever, even after the file is later deleted, and is often found by automated scanners within minutes of a repository going public.

### VII. The API only answers the origins and requests it expects

Always restrict cross-origin access to a configured allowlist, and always require a same-origin signal on every request that changes data. Never leave the API open to any origin while it also relies on a cookie for authentication.

- Why: a cookie-authenticated API left open to any origin lets any website a logged-in user happens to visit silently make authenticated requests on their behalf.

## Baseline discipline

Lagune holds this charter, every principle, every time. A principle is not suspended because a control looks small, familiar, or unlikely to be hit. This is not a judgement call.

### Only the controls the project needs

Lagune recommends and applies only the controls this project's context calls for. A control the project does not need is never added for completeness, and a generic checklist is not thoroughness. Every later phase acts on what the system actually does, never on what it might hypothetically do.

- Why: effort spent on risks the project does not have buries the risks it does have. Fewer, right-sized controls are easier to apply, prove, and keep true than a checklist no one finishes.

### Prefer the simplest vetted control

When a control is needed, reach for the safest option already proven, in order: a control this project already has, then a platform or framework built-in, then a well-maintained vetted library, and only then custom code. Never hand-roll a security primitive (cryptography, escaping, authentication, sessions) that a vetted standard already provides. A new dependency is new attack surface, justified and not assumed. Code, an endpoint, or a feature the project does not use is attack surface too, so removing it is itself a control.

- Why: hand-rolled security is where subtle, unaudited bugs live, and a second control duplicating an existing one is the one that gets forgotten and drifts. Boring, standard controls are easier to audit and harder to get wrong, and less surface is less to defend.

### When a control seems skippable

A control is held even when a reason to skip it feels reasonable:

- "Too small to need a control": small gaps are where breaches start.
- "Already handled elsewhere": assumed coverage is exactly how gaps hide.
- "Unlikely to be hit": attackers target the path no one is watching.
- "It works, ship it": working and safe are different claims, and the charter requires both.

## Governance

This charter binds every later phase: detect, plan, harden, and verify all read it, and none may accept or build behavior that breaks a principle here in order to satisfy a feature request; a conflict is surfaced to the user rather than resolved by quietly weakening a rule. Amend it only by running `/lagune.charter` again, never by hand-editing this file. Re-run it when the project's data, users, or risk surface change (a new kind of data collected, a new integration, a new user role); a principle is removed only when the capability it protected is actually removed from the project, not because it has become inconvenient.

Version: 1.0.0 | Ratified: 2026-08-02
