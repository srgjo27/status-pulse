# StatusPulse - Website Uptime Monitoring

A Next.js-based uptime monitoring system with Discord alerts integration. Monitor your websites and get instant notifications when they go down.

## Features

- 🔍 Website uptime monitoring
- 🚨 Discord webhook alerts for downtime
- 📊 Latency tracking and visualization
- ⏰ Automated cron-based monitoring
- 📱 Real-time status dashboard
- 🗄️ Supabase backend integration

## Quick Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `DISCORD_WEBHOOK_URL` - Discord webhook URL for alerts
- `CRON_SECRET` - Random secret for securing cron endpoint

### 3. Setup Discord Webhook

See [DISCORD_SETUP.md](./DISCORD_SETUP.md) for detailed instructions on:
- Creating Discord webhooks
- Configuring alert notifications
- Testing the integration

### 4. Setup Supabase Database

Create two tables in your Supabase database:

**monitors table:**
```sql
CREATE TABLE monitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  status VARCHAR(10) DEFAULT 'UP',
  active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**pings table:**
```sql
CREATE TABLE pings (
  id SERIAL PRIMARY KEY,
  monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
  latency INTEGER NOT NULL,
  status INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Testing Discord Alerts

Test your Discord integration before deploying:

```bash
# Install tsx if needed
npm install -D tsx

# Run the test script
npx tsx test-discord.ts
```

This will send test alerts to your Discord channel.

## API Endpoints

### `/api/cron` - Monitoring Cron Job

Automatically checks all active monitors and sends alerts for downtime.

**Authentication:** Requires `Authorization: Bearer ${CRON_SECRET}` header

**Schedule:** Every 10 minutes (configured in `vercel.json`)

**Manual trigger:**
```bash
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer your_cron_secret"
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The cron job will automatically run based on the schedule in `vercel.json`.

### Environment Variables (Production)

Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DISCORD_WEBHOOK_URL`
- `CRON_SECRET`

## Project Structure

```
status-pulse/
├── app/
│   ├── api/cron/         # Monitoring cron endpoint
│   ├── monitor/[id]/     # Individual monitor page
│   ├── page.tsx          # Main dashboard
│   └── supabase.ts       # Supabase client
├── components/
│   ├── AddMonitor.tsx    # Add monitor form
│   ├── LatencyChart.tsx  # Latency visualization
│   └── MonitorCard.tsx   # Monitor status card
├── utils/
│   └── discord.ts        # Discord webhook integration
├── types/
│   ├── monitor.d.ts      # Monitor type definitions
│   └── ping.d.ts         # Ping type definitions
└── test-discord.ts       # Discord alert test script
```

## How It Works

1. **Monitors** are configured with URLs to check
2. **Cron job** runs every 10 minutes checking all active monitors
3. When a monitor goes from UP → DOWN, **Discord alert** is sent
4. **Ping records** are saved with latency and status code
5. **Dashboard** displays real-time status and historical data

## Troubleshooting

### Discord alerts not working?

1. Verify `DISCORD_WEBHOOK_URL` is set correctly
2. Run test script: `npx tsx test-discord.ts`
3. Check Discord webhook is still active
4. Review logs in Vercel dashboard

### Cron job not running?

1. Verify `vercel.json` is deployed
2. Check Vercel cron logs in dashboard
3. Ensure `CRON_SECRET` is set in production
4. Test manually with curl

### Database connection issues?

1. Verify Supabase credentials
2. Check tables exist with correct schema
3. Ensure RLS policies allow operations
4. Review Supabase logs

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## License

MIT
