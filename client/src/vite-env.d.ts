/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV: boolean;
  readonly VITE_API_URL: `${string}://${string}`;
  readonly VITE_TG_APP_URL: `${string}://${string}`;
  readonly VITE_TESTNET: boolean;
  readonly VITE_GLITCHTIP_DSN: string;
  readonly VITE_TELEMETREE_PROJECT_ID: string;
  readonly VITE_TELEMETREE_API_KEY: string;
  readonly BASE_URL: `${string}://${string}`;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
