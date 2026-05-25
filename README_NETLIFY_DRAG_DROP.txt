Diet Battle static Netlify deploy

This folder is a pure static version for Netlify drag-and-drop.
It does not use Netlify Functions, Node server, or .env files.

Before upload:

1. Open this file:
   supabase-config.json

2. Replace these values:
   https://YOUR_PROJECT_REF.supabase.co
   YOUR_SUPABASE_ANON_KEY
   https://YOUR_NETLIFY_SITE.netlify.app/dashboard

Example:

{
  "enabled": true,
  "url": "https://your-project-ref.supabase.co",
  "anonKey": "your_supabase_anon_key",
  "redirectTo": "https://your-netlify-site.netlify.app/dashboard"
}

3. In Supabase Dashboard, add this redirect URL:
   https://your-netlify-site.netlify.app/dashboard

4. Enable Kakao and Google providers in Supabase Authentication > Providers.

5. Upload diet-battle-static-new3.zip to Netlify deploy.

Check after deploy:

Open https://YOUR_NETLIFY_SITE.netlify.app/supabase-config.json in the browser.
If it does not show JSON with "enabled": true, the wrong zip was uploaded.

Important:

The Supabase anon key is visible in browser code in a pure static app.
Do not put a service_role key here.
Use Supabase Row Level Security before storing real user data in Supabase tables.

If Kakao consent returns to the login screen instead of the dashboard, check these settings:

1. Supabase Dashboard > Authentication > URL Configuration

Site URL:
https://YOUR_NETLIFY_SITE.netlify.app

Redirect URLs:
https://YOUR_NETLIFY_SITE.netlify.app/dashboard
http://127.0.0.1:4173/dashboard

2. Kakao Developers

Kakao Login Redirect URI:
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback

3. Supabase Dashboard > Authentication > Providers > Kakao

Kakao provider must be enabled.
Client ID must be Kakao REST API key.
Client Secret must match Kakao Login Client Secret if enabled.
