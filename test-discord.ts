/**
 * Test script untuk Discord alert
 * Jalankan: npx tsx test-discord.ts
 */

import { config } from "dotenv";
import { sendDiscordAlert } from "./utils/discord";

config({ path: ".env.local" });

async function testDiscordAlert() {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.error("Error: DISCORD_WEBHOOK_URL tidak ditemukan!");
    console.log("\nPastikan file .env.local ada dan berisi:");
    console.log("DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...\n");
    process.exit(1);
  }

  console.log("Discord webhook URL ditemukan");
  console.log(
    `Webhook: ${process.env.DISCORD_WEBHOOK_URL.substring(0, 50)}...`,
  );
  console.log("\nTesting Discord Alert...\n");

  // Test 1: Alert dengan status code error
  console.log("Test 1: Sending alert with 500 error...");
  const result1 = await sendDiscordAlert(
    "Example Website",
    "https://example.com",
    "Status Code: 500",
  );
  console.log(`Result: ${result1 ? "Success" : "Failed"}\n`);

  // Wait 2 seconds before next test
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Alert dengan timeout error
  console.log("Test 2: Sending alert with timeout error...");
  const result2 = await sendDiscordAlert(
    "API Server",
    "https://api.example.com/health",
    "Status Code: 0 (Timeout)",
  );
  console.log(`Result: ${result2 ? "Success" : "Failed"}\n`);

  // Wait 2 seconds before next test
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 3: Alert dengan connection refused
  console.log("Test 3: Sending alert with connection refused...");
  const result3 = await sendDiscordAlert(
    "Database Server",
    "https://db.example.com",
    "Connection Refused",
  );
  console.log(`Result: ${result3 ? "Success" : "Failed"}\n`);

  console.log("🏁 Test completed!");
  console.log("\nTips:");
  console.log("- Check your Discord channel for the alerts");
  console.log(
    "- If no alerts appear, check DISCORD_WEBHOOK_URL in your .env.local",
  );
  console.log("- Verify the webhook is still active in Discord settings");
}

testDiscordAlert().catch(console.error);
