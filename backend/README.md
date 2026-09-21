# Tripojo API (Rails)

A Rails 7.1 API-only backend for Tripojo. Stateless JWT auth, SQLite for
local dev (swap for Postgres in production by changing `config/database.yml`
and the `pg` gem).

## Data model

```
User (role: curator | host | traveler | admin)
├── CuratorProfile (1:1)      -- bio, socials, follower_count
│   └── Trip (1:many)         -- curated group trip
│       └── TripActivity      -- day-by-day itinerary line items
├── HostProfile (1:1)         -- business info, verification
│   └── Property (1:many)     -- hostel/hotel/homestay listing
│       └── RoomType          -- bookable unit + price
Booking (Trip <-> traveler User)  -- modeled now, no UI yet (see roadmap)
```

Every curator/host gets their profile row created automatically on signup
(see `User#create_role_profile!`), so the frontend always has something to
`PATCH` during onboarding instead of juggling "does this exist yet."

## Setup

Requires Ruby 3.3.x and a working `bundle`/`gem` toolchain with access to
rubygems.org (this repo was written in a sandbox that couldn't reach
rubygems, so `bundle install` has not been run yet — do that on your own
machine).

```bash
cd backend
bundle install
bin/rails db:prepare   # creates + migrates storage/development.sqlite3
bin/rails db:seed      # demo curator + host accounts, see output for creds
bin/rails s             # starts on http://localhost:3000
```

Demo logins after seeding:
- Curator: `curator@tripojo.dev` / `password123`
- Host: `host@tripojo.dev` / `password123`

## API surface (MVP)

| Method | Path                              | Auth      | Purpose                          |
|--------|-----------------------------------|-----------|-----------------------------------|
| POST   | /api/v1/auth/signup               | -         | Create account (role: curator/host/traveler) |
| POST   | /api/v1/auth/login                | -         | Returns `{ token, user }`        |
| GET    | /api/v1/auth/me                   | Bearer    | Current user + onboarding status |
| GET/PATCH | /api/v1/curator/profile         | curator   | Onboarding step 1-2              |
| GET/POST/PATCH/DELETE | /api/v1/curator/trips | curator   | Onboarding step 3 + trip CRUD    |
| GET/PATCH | /api/v1/host/profile            | host      | Onboarding step 1-2              |
| GET/POST/PATCH/DELETE | /api/v1/host/properties | host  | Onboarding step 3 + listing CRUD |

All authenticated requests send `Authorization: Bearer <token>`.

## Roadmap hooks already in the schema

- `Booking` model exists (trip <-> traveler) so the 6-month booking/payment
  milestone doesn't need a schema rewrite.
- `Property#amenities` is a JSON array column — easy to extend without a
  migration.
- `verification_status` on `HostProfile` is a string enum
  (`unverified/pending/verified`) ready to wire up to a real KYC/ID-check
  provider later (see the PDF's Identity & KYC section).
