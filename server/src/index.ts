import { createApp } from './app.js';
import { env } from './config/env.js';

// A bug that escapes Express's own request lifecycle (nothing inside a
// route handler, which Express 5 already routes to the error middleware)
// would otherwise crash the process silently. Log it and exit deliberately,
// rather than risk continuing in an unknown state.
process.on('uncaughtException', (err) => {
  console.error('uncaughtException, shutting down:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection, shutting down:', reason);
  process.exit(1);
});

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`server listening on http://localhost:${env.PORT}`);
});
