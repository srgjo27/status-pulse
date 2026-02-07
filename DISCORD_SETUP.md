# Setup Discord Webhook untuk StatusPulse

## Langkah-langkah Setup Discord Alert

### 1. Buat Discord Webhook

1. Buka server Discord Anda
2. Pilih channel yang ingin menerima alert
3. Klik icon ⚙️ (Settings) di sebelah nama channel
4. Pilih **Integrations** → **Webhooks**
5. Klik **New Webhook** atau **Create Webhook**
6. Berikan nama, misalnya: "StatusPulse Bot"
7. Klik **Copy Webhook URL**
8. Save

### 2. Konfigurasi Environment Variables

Buat file `.env.local` di root project Anda dan tambahkan:

```bash
# Discord Webhook URL yang sudah di-copy
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cron Secret (buat random string untuk keamanan)
CRON_SECRET=your_random_secret_key_here
```

### 3. Testing Discord Alert Secara Manual

Anda bisa test alert dengan membuat file test:

```bash
# Buat file test-discord.ts di root project
```

```typescript
// test-discord.ts
import { sendDiscordAlert } from "./utils/discord";

async function testAlert() {
  const result = await sendDiscordAlert(
    "Test Monitor",
    "https://example.com",
    "Status Code: 500",
  );
  console.log("Alert sent:", result);
}

testAlert();
```

Jalankan dengan:

```bash
npx tsx test-discord.ts
```

### 4. Verifikasi di Vercel (Untuk Production)

Jika deploy di Vercel:

1. Buka dashboard Vercel
2. Pilih project Anda
3. Go to **Settings** → **Environment Variables**
4. Tambahkan semua environment variables:
   - `DISCORD_WEBHOOK_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET`
5. Redeploy project

### 5. Setup Cron Job di Vercel

Pastikan file `vercel.json` sudah ada dengan konfigurasi cron:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Ini akan menjalankan monitoring setiap 10 menit.

### 6. Trigger Cron Secara Manual untuk Testing

Untuk test endpoint cron:

```bash
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer your_cron_secret"
```

Atau di production:

```bash
curl -X GET https://your-app.vercel.app/api/cron \
  -H "Authorization: Bearer your_cron_secret"
```

## Format Alert di Discord

Alert yang dikirim akan terlihat seperti:

```
🚨 SERVICE DOWN ALERT
Monitor **Your Monitor Name** is failing!

🌐 Target URL
https://your-monitored-site.com

❌ Error
Status Code: 500

🕐 Time
Friday, February 7, 2026 at 10:30:45 AM UTC

StatusPulse Monitoring System
```

## Troubleshooting

### Alert tidak terkirim?

1. **Cek environment variable**

   ```bash
   echo $DISCORD_WEBHOOK_URL
   ```

2. **Cek logs di Vercel**
   - Buka dashboard Vercel → Project → Logs
   - Lihat apakah ada error

3. **Test webhook URL secara langsung**

   ```bash
   curl -X POST https://discord.com/api/webhooks/your_webhook_url \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

4. **Pastikan webhook masih aktif**
   - Webhook bisa dihapus/dinonaktifkan di Discord
   - Buat webhook baru jika perlu

### Error "Unauthorized" pada cron endpoint?

- Pastikan header `Authorization: Bearer ${CRON_SECRET}` sesuai dengan environment variable

## Monitoring Logs

Sistem akan print log:

- ✅ Discord alert sent successfully for [Monitor Name]
- ❌ Discord webhook failed with status [code]
- Alert for [Monitor Name]: Sent/Failed
