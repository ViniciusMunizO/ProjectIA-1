# React and Vite vulnerabilities

> - This knowledge extends your judgment. Apply what fits the project and keep reasoning beyond the list.
> - Source: React documentation (react.dev) and Vite documentation (vitejs.dev).

## Rules

- This skill audits and explains.
- By default, it never rewrites your code.

## What to look for

### `dangerouslySetInnerHTML`

React auto-escapes every value interpolated in JSX as a text node, but `dangerouslySetInnerHTML={{ __html: ... }}` bypasses that and calls the DOM's `innerHTML` sink directly. A component that renders a CMS field, a markdown conversion, a user bio, or any API response through it is a plain HTML-injection sink, no different from raw `innerHTML`, but the prop's name gets copy-pasted often enough that the word "dangerous" stops registering.

Safer shape: render content as plain text through ordinary JSX interpolation (`{value}`). When markup is genuinely required, sanitize with a vetted library (for example DOMPurify) immediately before the value enters `dangerouslySetInnerHTML`, not earlier in the pipeline.

Does not close it: sanitizing once when the content is saved (for example on submit) and trusting it from then on. A later change to the sanitizer's allowlist, or a second write path that skips it, reopens the sink. Sanitize at the render boundary, right before the prop, not at ingestion.

### URL-valued props and the `javascript:` scheme

JSX escapes text nodes, but it does not validate the scheme of a URL handed to `href`, `src`, `action`, or `formAction`. A value such as `javascript:fetch(...)` assigned to an anchor's `href` from user input runs on click exactly as it would in a hand-written `<a>` tag: JSX stops HTML injection, not URL-scheme injection.

Safer shape: validate that a URL prop's scheme is `http`/`https` (or a project-specific allowlist) before it reaches the element, and prefer a relative, app-built path over a full URL taken from input.

### The Virtual DOM is not a trust boundary

It is a common assumption that the Virtual DOM's diff itself keeps untrusted values safe, since it decides what touches the real DOM. Diffing only decides which nodes to add, remove, or update. It carries no notion of trust: a value that reaches the DOM through `dangerouslySetInnerHTML`, a ref-based direct write, or a portal is patched into the page exactly as given.

Safer shape: treat "does this value pass through JSX interpolation as a text node" as the actual safety boundary, not "does this value pass through React." A `ref` used to call `.innerHTML`/`.setAttribute` directly, and content rendered through a portal, opt back out of React's default escaping and need the same scrutiny as hand-written DOM code.

### Untrusted objects spread into props

Spreading an object built from external input, a URL query string, a JSON API response, a websocket message, straight into a DOM element or a component (`<div {...data} />`) can attach a `dangerouslySetInnerHTML`, an `onClick`/`onError` handler, or an `href` the code never explicitly wrote, whenever the spread source controls which keys it contains.

Safer shape: destructure the expected props out of the external object and pass those through explicitly. Never spread an untrusted object directly onto a JSX element, or onto a component that might forward it to one.

### Client-exposed environment variables

Vite inlines every environment variable prefixed `VITE_` (or matching a widened `envPrefix`) directly into the built client bundle as plain text, readable by anyone who opens the page's JavaScript. A secret, private API key, or internal URL that ends up with that prefix ships to every visitor, and because it still looks like an ordinary variable in code, it is easy to treat as a server-side secret by mistake.

Safer shape: keep secrets, private keys, and internal URLs out of the `VITE_` convention entirely, and proxy any call that needs a real credential through a backend the browser never sees.

### Vite dev server exposure

The dev server binds to `localhost` by default, but `server.host: true` (or `--host`) exposes it, along with its file-serving and HMR websocket, to the whole network. Past Vite versions also carried directory-traversal issues in `server.fs`, letting a crafted request read files outside the project root when `server.fs.strict` was disabled or `server.fs.allow` was too broad, a bug in the dev server itself, not only a misconfiguration.

Safer shape: keep `server.fs.strict` enabled (its default) and `server.fs.allow` scoped to the project root, only set `server.host` when the network is trusted, and keep the `vite` package patched.

### Production source maps

`build.sourcemap: true` ships a full `.map` file next to the production bundle, deobfuscating the built JavaScript back into original source, comments, internal file paths, and any logic the project never meant to publish. A frontend build is often treated as "just assets," so this ships to production more often than an equivalent backend source dump would be allowed.

Safer shape: disable source maps for production builds, or restrict them to a monitoring pipeline's private upload and confirm the `.map` file itself is never served publicly. Check that error-tracking tooling uploads maps to its own backend rather than serving them alongside the bundle.

## How to act on the result

- **In detect (detection):** each pattern you confirm is a finding. Describe it in plain language: what it is (the React or Vite behavior being abused), why it matters (the concrete impact, for example script execution in the user's session or a leaked credential), and the evidence (the component, prop, or config where it lives). It flows through detect's normal steps and is tracked like any other finding.
- **In verify (proof):** the control holds only when the unsafe pattern is gone or properly guarded (plain JSX interpolation in place of `dangerouslySetInnerHTML`, a scheme check on a URL prop, no untrusted spread onto an element, a secret moved out of the `VITE_` convention, the dev server scoped and patched, or source maps kept out of the production bundle). If the dangerous pattern still reaches untrusted input, or a secret is still inlined into the client bundle, the risk is not closed: record it as such and point back to harden.
