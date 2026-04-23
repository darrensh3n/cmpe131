## 🛒 Spartan Marketplace

A mobile SJSU marketplace app built for students to list items for sale, browse available items, and complete purchases securely within the school community.

### Key Features
- 📱 Mobile-first UI with Expo Router
- ⚡ FastAPI backend with REST APIs
- 💳 Stripe payment integration

## App Preview
<p align="center">
  <img src="..." width="40%" />
  <img src="..." width="40%" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/80499e7e-b47f-4766-b984-50db49779cc2" width="25%" />
  <img src="https://github.com/user-attachments/assets/b0ca97ac-c41c-4018-85cd-55fdebe6abc0" width="25%" />
</p>

Monorepo with a **frontend** (Expo/React Native) app and a **backend** (FastAPI) API.

- **`frontend/`** — Expo app (screens in `frontend/app/`, components, hooks, assets)
- **`backend/`** — FastAPI server ([backend README](backend/README.md))

## Loading the app (frontend)

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
- I recommend downloading Expo Go on your phone and scanning the qr code generated after npx expo start

Edit the app in **`frontend/app/`** (and **`frontend/components/`**, **`frontend/hooks/`**, etc.). The project uses [file-based routing](https://docs.expo.dev/router/introduction).

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

## Get a fresh frontend

To reset the frontend to a blank app (starter code moved to `frontend/app-example`):

```bash
npm run reset-project
```
