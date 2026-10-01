import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const testSecretDefaults = {
  RESEND_API_KEY: "test-resend-key",
  FROM_EMAIL: "57 Test <test@why57.com>",
  FOUNDER_REPLY_TO: "founder-test@why57.com",
  SLACK_WEBHOOK_URL: "https://hooks.slack.test/services/test",
  LEAD_LOG_WEBHOOK_URL: "https://sheets.test/lead-log",
  LEAD_LOG_WEBHOOK_SECRET: "test-log-secret",
  STAGING_SUBMISSION_TOKEN: "test-submission-token",
  TEST_EMAIL_ALLOWLIST: "lead-test@example.com"
};

for (const [key, value] of Object.entries(testSecretDefaults)) {
  if (!process.env[key]) process.env[key] = value;
}

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.lead-intake.jsonc" },
      miniflare: {
        bindings: {
          DELIVERY_MODE: "test",
          RESEND_API_KEY: "test-resend-key",
          FROM_EMAIL: "57 Test <test@why57.com>",
          FOUNDER_REPLY_TO: "founder-test@why57.com",
          SLACK_WEBHOOK_URL: "https://hooks.slack.test/services/test",
          LEAD_LOG_WEBHOOK_URL: "https://sheets.test/lead-log",
          LEAD_LOG_WEBHOOK_SECRET: "test-log-secret",
          STAGING_SUBMISSION_TOKEN: "test-submission-token",
          TEST_EMAIL_ALLOWLIST: "lead-test@example.com"
        }
      }
    })
  ]
});
