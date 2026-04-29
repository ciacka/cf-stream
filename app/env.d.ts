/// <reference types="../worker-configuration.d.ts" />

declare namespace Cloudflare {
  interface Env {
    CF_ACCOUNT_ID: string;
    CF_API_TOKEN: string;
  }
}
