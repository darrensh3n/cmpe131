# Spartan Marketplace

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

In the output you can open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)
- Web browser

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

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
