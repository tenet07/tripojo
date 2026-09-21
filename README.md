# Tripojo

Curators build trips. Hosts, guides, activity operators and drivers attach to
them as priced add-ons. Travellers book the whole thing in one payment.

```
backend/    Rails 7.1 API — models, pricing, endpoints
frontend/   React + Vite + TypeScript + Tailwind
mock-api/   A stand-in for the Rails API so the frontend runs immediately
```

## Run it right now (no Ruby needed)

```bash
cd frontend
npm install
cp .env.example .env     # already points at the mock API
npm run mock &           # http://localhost:4000
npm run dev              # http://localhost:5173
```

Open http://localhost:5173, click a trip, and add a guide or an airport car —
the basket repricing is real, served by the mock over the same routes Rails
exposes.

Accounts (mock and seeded Rails both):

| Role     | Email                   | Password    |
| -------- | ----------------------- | ----------- |
| Curator  | `meera@tripojo.test`    | `tripojo123` |
| Traveller| `traveler@tripojo.test` | `tripojo123` |
| Host     | `host@tripojo.test`     | `tripojo123` |
| Partner  | `rahul@tripojo.test`    | `tripojo123` |

## Run it against Rails

```bash
cd backend
bundle install
bin/rails db:prepare db:seed
bin/rails s                       # http://localhost:3000
```

Then point the frontend at it — one line, nothing else changes:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## The add-on model

The thing this codebase exists to get right. An add-on is a partner service
attached to a trip, and the awkward part is that add-ons don't share a unit:
a guide is charged per person, a taxi per vehicle, a room per night. So
"quantity 3" means something different for each, and the basket has to respect
that.

```
add_on_products   partner, category, title, unit
                  unit ∈ per_person | per_group | per_vehicle | per_night
add_on_tiers      label, price_cents          ← what's actually bought
trip_add_ons      trip + tier                 ← curator: what's on offer
booking_add_ons   booking + tier, qty, unit_price_cents
```

Two halves, cleanly split:

- **The curator** decides what is available and at what price (trip builder).
- **The traveller** decides how many (trip page).

Neither screen can set the other's half. Because an add-on is only four fields,
a new partner category drops in without a schema change.

Pricing is `tier.price × qty` per line, `base × travellers` for the trip, plus a
platform fee in basis points. All of it integer arithmetic in the currency's
minor unit — no floats anywhere near money.

## The server is the pricing authority

`POST /api/v1/trips/:slug/quote` takes what the traveller picked and returns
every number the UI displays. The client adds nothing up itself, so the basket
on screen and the basket charged cannot drift apart. `lib/useQuote.ts` debounces
those calls and discards out-of-order responses.

## What's verified

| Check | Command | Status |
| --- | --- | --- |
| Ruby syntax, every file | `ruby -c` across `app config db lib test` | passes |
| Pricing rules | `cd backend && ruby test/pricing_test.rb` | 12 tests, 37 assertions |
| Ruby ↔ JS pricing parity | `cd frontend && npm run check:pricing` | 10/10 cases agree to the paise |
| Types | `cd frontend && npm run lint` | clean |
| Production build | `cd frontend && npm run build` | clean |
| Full add-on flow | headless, against the mock | browse → trip → add-ons → checkout |

The flow was driven end to end in a headless browser: adding two guide places,
switching that add-on to the full-day package (quantity carries over), adding a
vehicle, removing it again (total returns exactly), changing the traveller
count, and confirming checkout re-quotes to the same figure.

**Not verified here:** Rails itself never booted. This sandbox has no network
route to rubygems.org, so `bundle install` couldn't run. The Ruby is
hand-written and syntax-checked, the pricing module is genuinely unit-tested
(it's plain Ruby by design, no Rails needed), and the mock API is a
line-for-line port proven to agree with it — but a real `rails s` run against a
real database hasn't happened. Do that first; if anything is off it will most
likely be a migration ordering detail rather than a design problem.

## What's deliberately not built

Partner onboarding UI, admin verification console, real payments, file uploads,
reviews, messaging, calendar sync. The schema has room for all of them — the
`booking_add_ons.status` column is already where partner acceptance will hang.


-------------------

Production Setup 
1. Push to GitHub
Create an empty repo on GitHub (e.g. tripojo), no README/gitignore, then:
2. Database — Neon (Singapore)
Sign up at neon.tech, create a project in the Singapore (ap-southeast-1) region.
Copy the connection string it gives you (starts postgresql://...) — that's your DATABASE_URL.
3. Backend — Render
Sign up at render.com, connect your GitHub account, pick New → Blueprint, select the tripojo repo. It'll read render.yaml and create the tripojo-api web service (free plan, Singapore region) automatically.
In that service's Environment tab, add:
DATABASE_URL → the Neon connection string
FRONTEND_ORIGINS → leave blank for now, fill in after step 4 (e.g. https://tripojo.pages.dev)
SECRET_KEY_BASE and TRIPOJO_JWT_SECRET are auto-generated by the blueprint — nothing to do.
Deploy. First boot runs rails db:prepare (migrates + seeds since the DB is empty), then starts Puma. Note the URL Render gives you, e.g. https://tripojo-api.onrender.com.
4. Frontend — Cloudflare Pages
Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git, pick the repo.
Build settings: root directory frontend, build command npm run build, output directory dist.
Environment variable: VITE_API_BASE_URL = https://tripojo-api.onrender.com/api/v1 (your actual Render URL + /api/v1).
Deploy. You'll get a *.pages.dev URL.
5. Close the loop
Go back to Render, set FRONTEND_ORIGINS to your *.pages.dev URL, and redeploy the API so CORS allows it.