/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Absolute URL of the deployed API (e.g. https://sistema-vmo-server.onrender.com/api).
  // Unset in local dev, where requests to /api are proxied by Vite instead
  // — see api-client.ts.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
