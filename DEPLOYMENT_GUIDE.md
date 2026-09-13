# Deployment Guide — Shopno Bilash Properties

Self-contained guide to finish going live, in case you're doing the rest without Claude.

---

## 1. Admin Panel Access (works right now)

- URL: `https://yourdomain.com/login` → click the **Staff** tab
- Email: `admin@shopnobilash.test`
- Password: `ShopnoBilash@2026`
- **Change this password immediately after your first real login** (once signed in, look for a profile/settings page to set your own password — never share this default one).

Owner/Customer login is the same `/login` page, **Property Owner** tab, using a phone number + 4-digit PIN (each owner sets their own PIN on first login).

There is **no visible "Admin" link anywhere on the public site** — this is intentional. Bookmark `/login` yourself.

---

## 2. What's already done

- Code lives on GitHub: `https://github.com/akib239/Shopno-Bilash-Proparties`
- Dev-only "Continue as ... (dev)" login shortcuts are fully disabled by default (require an explicit local-only env var that is never set in production).
- Login rate limiting is stored in the database (not in server memory), so it works correctly on serverless hosting.
- Reviewed for common web vulnerabilities (auth bypass, IDOR, SQL injection, file upload, exposed secrets) — nothing found.

## 3. What's NOT done yet — required before Admin/Owner Portal will work live

**The database is still SQLite (a local file).** Netlify (and most serverless hosts) don't have a persistent disk, so SQLite will not work there. The public marketing pages will still look fine without this, but Admin and Owner Portal login/data will not.

### Step A — Get a real online database (free)

1. Go to [neon.tech](https://neon.tech) → sign up (GitHub login is fine) → create a project.
2. Copy the **connection string** it gives you (starts with `postgresql://`).

### Step B — Switch the app to that database

In `prisma/schema.prisma`, find:
```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
Change `"sqlite"` to `"postgresql"`.

Then, in a terminal in this project folder:
```bash
# Put the Neon connection string in .env.local as DATABASE_URL first, then:
npx prisma migrate deploy
node scripts/export-data.mjs backup.json
node scripts/import-data.mjs backup.json
```
This applies the database structure to Neon, then copies your current demo data (units, sales, cost allocations, everything) into it. Test locally with `npm run dev` afterward to confirm Admin/Portal still work — now against Neon instead of the local file.

### Step C — Buy a domain and connect it

1. Buy a domain anywhere (Namecheap, GoDaddy, etc.).
2. In Netlify: **Site settings → Domain management → Add a domain** → follow Netlify's instructions (usually adding a couple of DNS records, or pointing nameservers at Netlify). Free SSL (https) is automatic, just takes a little time after DNS updates.

### Step D — Set environment variables in Netlify

**Site settings → Environment variables** → add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Neon connection string from Step A |
| `AUTH_SECRET` | a fresh random 32+ character string — generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (don't reuse your local dev one) |
| `ADMIN_BOOTSTRAP_EMAIL` | `admin@shopnobilash.test` (or change it) |
| `ADMIN_BOOTSTRAP_PASSWORD_HASH` | only matters if Neon's database is ever freshly re-seeded from scratch — otherwise the login the export/import already carried over is what's used |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (your real domain, once bought) |

**Do NOT set** `NEXT_PUBLIC_ENABLE_DEV_LOGIN` — leaving it unset is what keeps the dev-login shortcut off.

### Step E — Deploy

Netlify → **Import from Git → GitHub** → select the repo → it auto-detects Next.js → Deploy.

---

## 4. Publishing future code changes

There's no way for Claude to push directly to your GitHub (no stored login). The flow going forward:
1. Make/request a code change.
2. Open **GitHub Desktop** → review the changed files → **Commit** → **Push origin**.
3. Netlify redeploys automatically on every push — no manual step needed there.

---

## 5. Checklist before calling it fully "live"

- [ ] Changed the admin password from the default above
- [ ] Decided what to do with the current demo data (a demo project "Silver Oak Residency", demo customers/owners, a couple of test expense rows named "nice"/"sakib" under Admin → Finance → Expenses) — clear it or keep it, but know it's there
- [ ] Reviewed the Privacy Policy / Terms pages — they currently say retention details are "pending legal adviser confirmation"; get real legal sign-off before relying on them
- [ ] Tested the Enquire/Contact form end-to-end with a real submission
- [ ] Confirmed you're not relying on SMS/WhatsApp/email notifications actually sending — the code records that a notification *should* go out, but no email/SMS provider is wired up yet (this was a deliberate "don't fake it" decision, not a bug)
