# DiTz Store v2

Production-capable Next.js storefront with product catalog, cart, checkout, order tracking, customer accounts, and secure admin panel.

## VPS setup

```bash
cd /opt
git clone https://github.com/sunandarradit3-maker/ditz-store.git
cd ditz-store
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
npm install
npm run build
npm start
```

The setup script creates a private `.env` file on the VPS and automatically generates `SESSION_SECRET`.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Copy the project URL and **service role key** into the interactive `scripts/setup-env.sh` prompts on your VPS.
4. Do not put the service role key, admin password, or session secret in GitHub.

## Environment variables
See `.env.example` for the safe template. The real `.env` is ignored by Git and should only exist on the VPS/Vercel environment.

Required for full functionality:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_STORE_NAME`

## Security baseline
- Real `.env` and `.env.*` files are ignored by Git except `.env.example`.
- Admin credentials only come from server environment variables.
- HttpOnly + SameSite=Strict signed sessions.
- Server-authoritative product pricing for checkout.
- Rate limiting and input validation.
- Security headers.
- Public tracking never exposes customer name/email/phone.

When database variables are absent the storefront stays reviewable, but checkout/account persistence is intentionally disabled rather than pretending to be production storage.
