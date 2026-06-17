/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIDTRANS_CLIENT_KEY: string;
  readonly VITE_MIDTRANS_SNAP_URL: string;
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
