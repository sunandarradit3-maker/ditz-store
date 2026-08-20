# DiTz Store v2

Production-capable Next.js storefront with product catalog, cart, checkout, order tracking, customer accounts, and secure admin panel.

## Production setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Add environment variables from `.env.example` to Vercel or your VPS.
4. Deploy.

### Security baseline
- Admin credentials only from server environment variables.
- HttpOnly + SameSite=Strict signed sessions.
- Server-authoritative product pricing for checkout.
- Rate limiting and input validation.
- Security headers.
- Public tracking never exposes customer name/email/phone.

When database variables are absent the storefront stays reviewable, but checkout/account persistence is intentionally disabled rather than pretending to be production storage.
