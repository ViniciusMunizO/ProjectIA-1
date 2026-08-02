# Lagune History

## Closed findings

### Server discloses the framework it runs on

- **Classification:** Low
- **Category:** Information exposure through banner disclosure (CWE-200)
- **What it is:** Every response carries the default `X-Powered-By: Express` header.
- **Closed:** 2026-08-02

### Login rate limiting and account lockout are in-memory and single-instance

- **Classification:** Low
- **Category:** Improper restriction of excessive authentication attempts, durability gap (CWE-307)
- **What it is:** The per-IP rate limit and the per-e-mail failure counter both live in the process's own memory.
- **Closed:** 2026-08-02

### No process-level handler for an escaped exception

- **Classification:** Low
- **Category:** Uncaught exception / unhandled rejection (CWE-248)
- **What it is:** The server process has no `uncaughtException` or `unhandledRejection` handler.
- **Closed:** 2026-08-02
