/**
 * Test script untuk trigger cron job secara manual
 * Jalankan: npm run test:cron
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function testCronJob() {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("Error: CRON_SECRET tidak ditemukan di .env.local!");
    process.exit(1);
  }

  console.log("Triggering cron job...\n");

  try {
    const response = await fetch("http://localhost:3000/api/cron", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Request failed with status ${response.status}`);
      console.error(`Response: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log("Cron job berhasil dijalankan!\n");
    console.log("Results:");
    console.log(`   - Monitors checked: ${data.checked}`);

    if (data.results && data.results.length > 0) {
      console.log("\nMonitor Status:");
      data.results.forEach((result: any) => {
        const statusEmoji = result.status === "UP" ? "🟢" : "🔴";
        console.log(`   ${statusEmoji} ${result.url}`);
        console.log(
          `      Status: ${result.status} | Latency: ${result.latency}ms`,
        );
      });
    }

    console.log("\nTips:");
    console.log(
      "- Cek Discord channel Anda untuk alert (jika ada monitor yang DOWN)",
    );
    console.log(
      "- Lihat dashboard di http://localhost:3000 untuk status terbaru",
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("\nPastikan:");
    console.log("- Development server berjalan (npm run dev)");
    console.log("- Database Supabase sudah dikonfigurasi");
    console.log("- Ada monitor aktif di database");
    process.exit(1);
  }
}

testCronJob();
