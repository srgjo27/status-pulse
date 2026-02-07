# Panduan Testing Sistem StatusPulse

Setelah berhasil test Discord alert, ikuti langkah-langkah berikut untuk test sistem monitoring secara lengkap.

## ✅ Langkah 1: Pastikan Database Supabase Sudah Setup

### Buat Tabel di Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Go to **SQL Editor**
4. Jalankan query berikut:

```sql
-- Buat tabel monitors
CREATE TABLE monitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  status VARCHAR(10) DEFAULT 'UP',
  active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel pings
CREATE TABLE pings (
  id SERIAL PRIMARY KEY,
  monitor_id INTEGER REFERENCES monitors(id) ON DELETE CASCADE,
  latency INTEGER NOT NULL,
  status INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat index untuk performa
CREATE INDEX idx_pings_monitor_id ON pings(monitor_id);
CREATE INDEX idx_pings_created_at ON pings(created_at DESC);
```

### Disable RLS (untuk development)

Jika menggunakan Row Level Security (RLS), disable untuk development:

```sql
ALTER TABLE monitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE pings DISABLE ROW LEVEL SECURITY;
```

Atau buat policy yang allow all:

```sql
-- Enable RLS
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all on monitors" ON monitors FOR ALL USING (true);
CREATE POLICY "Allow all on pings" ON pings FOR ALL USING (true);
```

## ✅ Langkah 2: Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di http://localhost:3000

## ✅ Langkah 3: Tambah Monitor Melalui UI

1. Buka http://localhost:3000 di browser
2. Klik tombol **"Add Monitor"**
3. Isi form:
   - **Name**: contoh "Google"
   - **URL**: contoh "https://google.com"
4. Klik **Add Monitor**

### Monitor untuk Testing Alert

Untuk test Discord alert, tambahkan URL yang **akan gagal**:

- ❌ **Bad Monitor**: `http://localhost:9999` (port yang tidak ada)
- ❌ **Invalid URL**: `https://definitely-not-a-real-website-12345.com`
- ❌ **Timeout URL**: `https://httpstat.us/524` (akan timeout)

Dan tambahkan juga URL yang **berhasil**:

- ✅ **Good Monitor**: `https://google.com`
- ✅ **Good Monitor**: `https://github.com`

## ✅ Langkah 4: Test Manual dengan Cron Script

Trigger cron job secara manual untuk memeriksa semua monitor:

```bash
npm run test:cron
```

Output yang diharapkan:

```
🔄 Triggering cron job...

✅ Cron job berhasil dijalankan!

📊 Results:
   - Monitors checked: 3

📋 Monitor Status:
   🟢 https://google.com
      Status: UP | Latency: 120ms
   🔴 http://localhost:9999
      Status: DOWN | Latency: 5ms
```

**Yang terjadi:**

1. Sistem akan check semua monitor yang aktif
2. Jika ada monitor berubah dari UP → DOWN, Discord alert akan terkirim
3. Data ping disimpan ke database
4. Status monitor diupdate

## ✅ Langkah 5: Verifikasi Discord Alert

Setelah menjalankan cron:

1. **Cek Discord channel** - Seharusnya ada alert untuk monitor yang DOWN
2. **Cek console log** - Akan ada log seperti:
   ```
   ✅ Discord alert sent successfully for [Monitor Name]
   Alert for [Monitor Name]: Sent
   ```

## ✅ Langkah 6: Test Perubahan Status UP → DOWN

Untuk test alert secara real-time:

### Metode 1: Tambah Monitor dengan URL Invalid

1. Tambah monitor dengan URL yang pasti gagal: `http://localhost:9999`
2. Tunggu atau jalankan `npm run test:cron`
3. Alert pertama kali **tidak akan muncul** (karena status awal adalah UP)
4. Jalankan cron lagi: `npm run test:cron`
5. Sekarang alert **akan muncul** (karena berubah dari UP → DOWN)

### Metode 2: Update Monitor Existing

1. Buka Supabase Dashboard → Table Editor → `monitors`
2. Ubah status monitor menjadi `UP` secara manual
3. Jalankan `npm run test:cron`
4. Monitor akan dicheck dan berubah ke `DOWN` (jika URL memang gagal)
5. Discord alert akan terkirim

### Metode 3: Test dengan Monitor yang Nyata

1. Tambahkan monitor dengan URL real yang berjalan (contoh: website Anda sendiri)
2. Pastikan statusnya UP dengan jalankan cron
3. **Matikan website/server Anda**
4. Jalankan cron lagi: `npm run test:cron`
5. Discord alert akan terkirim!

## ✅ Langkah 7: Verifikasi di Dashboard

Setelah cron berjalan, refresh dashboard (http://localhost:3000) dan cek:

- ✅ Status monitor berubah sesuai hasil check
- ✅ Last checked timestamp terupdate
- ✅ Latency tercatat

## 📊 Monitoring & Debugging

### Check Logs di Console

Development server akan menampilkan log:

```
✅ Discord alert sent successfully for Bad Monitor
Alert for Bad Monitor: Sent
```

### Check Database di Supabase

1. **Table `monitors`** - Cek kolom `status` dan `last_checked`
2. **Table `pings`** - Cek history ping dengan latency dan status code

Query untuk cek recent pings:

```sql
SELECT
  m.name,
  p.status,
  p.latency,
  p.created_at
FROM pings p
JOIN monitors m ON p.monitor_id = m.id
ORDER BY p.created_at DESC
LIMIT 20;
```

## 🚀 Deploy ke Production (Vercel)

Setelah test lokal berhasil:

1. **Push ke GitHub**

   ```bash
   git add .
   git commit -m "Setup monitoring with Discord alerts"
   git push
   ```

2. **Deploy di Vercel**
   - Import project dari GitHub
   - Set environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `DISCORD_WEBHOOK_URL`
     - `CRON_SECRET`

3. **Vercel akan otomatis setup Cron Job**
   - Berdasarkan config di `vercel.json`
   - Cron akan berjalan setiap 10 menit
   - Tidak perlu trigger manual

4. **Test Production Cron**
   ```bash
   curl -X GET https://your-app.vercel.app/api/cron \
     -H "Authorization: Bearer your_cron_secret"
   ```

## 🐛 Troubleshooting

### Monitor tidak muncul di dashboard?

- Cek koneksi Supabase
- Pastikan tabel `monitors` ada
- Cek console browser untuk error

### Discord alert tidak terkirim?

- Pastikan monitor berubah dari UP → DOWN (bukan DOWN → DOWN)
- Cek DISCORD_WEBHOOK_URL di environment
- Jalankan `npm run test:discord` untuk test webhook

### Cron endpoint return 401?

- Pastikan header Authorization benar
- Format: `Bearer ${CRON_SECRET}`

### Database error?

- Cek RLS policies
- Pastikan anon key punya permission
- Test query manual di Supabase SQL Editor

## 📋 Checklist Test Lengkap

- [ ] ✅ Database tabel sudah dibuat
- [ ] ✅ Development server berjalan
- [ ] ✅ Bisa tambah monitor via UI
- [ ] ✅ Cron job bisa dijalankan manual (`npm run test:cron`)
- [ ] ✅ Monitor status terupdate di database
- [ ] ✅ Discord alert terkirim untuk monitor DOWN
- [ ] ✅ Dashboard menampilkan status real-time
- [ ] ✅ Ping history tersimpan di database
- [ ] ✅ Ready untuk deploy!

## 🎯 Tips Testing

1. **Gunakan URL yang cepat** untuk testing (google.com, github.com)
2. **Tambahkan beberapa monitor** untuk test multiple checks
3. **Simulasikan downtime** dengan URL invalid atau port yang tidak ada
4. **Check Discord setelah setiap test** untuk konfirmasi alert
5. **Monitor console logs** untuk debugging

Selamat mencoba! 🚀
