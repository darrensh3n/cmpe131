## 🛒 Spartan Marketplace

A mobile marketplace app built for **San José State University students** to buy, sell, save, message, and securely purchase items within the SJSU community.

---

## ✨ Features
- 📱 **Mobile-first marketplace** built with Expo and React Native
- 🛍️ **Browse and sell listings** with images, prices, categories, and descriptions
- ❤️ **Wishlist** to save and remove favorite items
- 💬 **Buyer-seller messaging** with live chat updates
- 🔐 **SJSU-only authentication** using Supabase Auth
- 💳 **Stripe checkout support** with a mock payment flow for demos
- 👤 **User profiles** with optional avatar uploads

---

## App Preview

<p align="center">
  <img src="https://github.com/user-attachments/assets/060ce388-2cc6-4fac-9edb-a8f1b58ac7f8" width="25%"/>
  <img src="https://github.com/user-attachments/assets/b0ca97ac-c41c-4018-85cd-55fdebe6abc0" width="25%" />
</p>

---

## Tech Stack

- **Frontend:** Expo, React Native, Expo Router
- **Backend:** FastAPI
- **Database/Auth:** Supabase
- **Payments:** Stripe
- **Realtime:** Supabase Realtime

---

## Project Structure

```text
.
├── frontend/              # Expo app screens, components, hooks, and services
├── backend/               # FastAPI server for payments and webhooks
├── supabase/schema.sql    # Database tables, policies, and realtime setup
├── app.json               # Expo app configuration
└── README.md
```

Monorepo with a **frontend** (Expo/React Native) app and a **backend** (FastAPI) API.


---

## Starting the frontend

From the **project root**:

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the Expo dev server

   ```bash
   npx expo start
   ```

   Or with tunnel: `npx expo start --tunnel`

In the output you can open the app in 

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Go](https://expo.dev/go)
- Web browser
- **Recommended**: Open with Expo Go and scan the QR code

Edit the app in **`frontend/app/`** (and **`frontend/components/`**, **`frontend/hooks/`**, etc.). The project uses [file-based routing](https://docs.expo.dev/router/introduction).

---

## Running the backend

See [backend/README.md](backend/README.md). From the project root:

```bash
cd backend
python -m venv .venv    # Or python3 if python doesn't work
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000 · Docs: http://localhost:8000/docs

---

## Supabase setup
1. Create a [Supabase](https://supabase.com) project and open **Project Settings → API** for the project URL and `anon` public key.
2. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates `listings`, `saved_listings`, `conversations`, and `messages`, enables **Row Level Security**, and adds `messages` / `conversations` to the **Realtime** publication for live chat.
3. Copy [`.env.example`](.env.example) to `.env` at the repo root and set:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
4. **Storage (profile photos):** The app uploads avatars to a bucket named `avatars`. Create that bucket in Supabase (public read is typical for avatars), add policies so authenticated users can upload to their own path, and ensure a `profiles` table with at least `id` (uuid, references `auth.users`) and `avatar_url` (text), with RLS as you prefer—the client upserts `profiles` after upload.

---

## Authentication
Auth is handled entirely in the app with **Supabase Auth** (`@supabase/supabase-js`).
- **Email / password** — Sign up and sign in require an **`@sjsu.edu`** address. Password reset uses `reset-password` deep links (`Linking.createURL`).
- **Google** — `signInWithOAuth` with the Google provider; the hosted domain hint is `sjsu.edu`. After OAuth, users whose email is not `@sjsu.edu` are signed out (Google provider guard in auth state).
- **Deep links** — OAuth and email verification callbacks are completed with `exchangeCodeForSession` on the URL from Expo Linking (see `frontend/context/auth.tsx`). Configure **Redirect URLs** in Supabase (Auth → URL configuration) to match your app scheme, e.g. `spartanmarketplace://…` from `app.json` `scheme`, plus any Expo dev URLs you use.
Enable **Email** and **Google** providers in the Supabase dashboard and add the Google OAuth client IDs Google requires.

---

## Stripe Setup (optional — for real payments)

The app includes a mock payment flow for demos. To enable real Stripe payments instead:

1. Create a free [Stripe account](https://dashboard.stripe.com/register)
2. Go to **Developers → API keys** in the Stripe dashboard (make sure you're in **Test mode** — toggle in the top right)
3. Copy your **Secret key** (`sk_test_...`) and **Publishable key** (`pk_test_...`)
4. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) to receive webhooks locally:
   ```bash
   brew install stripe/stripe-cli/stripe   # macOS
   stripe login
   stripe listen --forward-to localhost:8000/webhooks/stripe
   ```
   The CLI will print a webhook signing secret (`whsec_...`) — copy it.
5. Add your keys to `backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
6. Use Stripe's test card number `4242 4242 4242 4242` with any future expiry date and any CVC to complete test purchases.

