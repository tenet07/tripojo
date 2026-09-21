// A stand-in for the Rails API, speaking the same routes and the same JSON.
//
// It exists for one reason: the Rails app needs `bundle install` and a
// database before it will answer anything, and the frontend shouldn't have
// to wait for that to be runnable. Point VITE_API_URL at this, click the
// whole flow, then point it at Rails and nothing in the client changes.
//
// Zero dependencies on purpose — `node mock-api/server.mjs` and it's up.

import http from 'node:http';
import { buildWorld, findTier } from './data.mjs';
import { quote as priceQuote, maxBasket, naturalQty } from './pricing.mjs';

const PORT = Number(process.env.PORT || 4000);
const world = buildWorld();

/* ------------------------------------------------------------------ utils */

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });

// Tokens are just the user id in base64 — this is a local stand-in, not auth.
const tokenFor = (user) => Buffer.from(`mock:${user.id}`).toString('base64');
const userFromToken = (req) => {
  const header = req.headers.authorization || '';
  const token = header.split(' ').pop();
  if (!token) return null;
  try {
    const id = Number(Buffer.from(token, 'base64').toString('utf8').split(':')[1]);
    return world.users.find((u) => u.id === id) || null;
  } catch { return null; }
};

const publicUser = (user) => ({
  id: user.id, name: user.name, email: user.email, role: user.role,
  onboarding_complete: true, onboarding_step: 'done',
});

/* ------------------------------------------------------- serialisation */

const tripCard = (trip) => ({
  id: trip.id, slug: trip.slug, title: trip.title, destination: trip.destination,
  summary: trip.summary, start_date: trip.start_date, end_date: trip.end_date,
  nights: trip.nights, base_price_cents: trip.base_price_cents, currency: trip.currency,
  capacity: trip.capacity, spots_left: trip.spots_left, status: trip.status,
  cover_image_url: trip.cover_image_url, photo: trip.photo,
  rating: trip.rating, reviews_count: trip.reviews_count, bookings_count: trip.bookings_count,
  add_on_categories: [...new Set(trip.offers.map((o) => findTier(world, o.tier_id)?.product.category).filter(Boolean))],
  curator: trip.curator,
});

// Offers grouped by product, which is how the trip page renders them.
const offerGroups = (trip) => {
  const groups = new Map();

  trip.offers
    .slice()
    .sort((a, b) => a.position - b.position)
    .forEach((offer) => {
      const found = findTier(world, offer.tier_id);
      if (!found) return;
      const { product, tier } = found;

      if (!groups.has(product.product_id)) {
        groups.set(product.product_id, {
          product_id: product.product_id, category: product.category,
          category_label: product.category_label, title: product.title,
          description: product.description, unit: product.unit, unit_label: product.unit_label,
          hero_image_url: product.hero_image_url ?? null, rating: product.rating,
          reviews_count: product.reviews_count, bookings_count: product.bookings_count,
          partner: product.partner, tiers: [],
        });
      }

      groups.get(product.product_id).tiers.push({
        trip_add_on_id: offer.id, tier_id: tier.tier_id, label: tier.label,
        price_cents: tier.price_cents, currency: tier.currency,
        max_capacity: tier.max_capacity, recommended: offer.recommended,
        commission_pct: offer.commission_pct,
      });
    });

  return [...groups.values()];
};

const tripDetail = (trip) => ({
  ...tripCard(trip),
  description: trip.description,
  itinerary: trip.itinerary,
  add_ons: offerGroups(trip),
});

// The shape Pricing expects, for the tiers this trip actually offers.
const offerSelections = (trip) =>
  trip.offers.flatMap((offer) => {
    const found = findTier(world, offer.tier_id);
    if (!found) return [];
    return [{
      key: `tier:${found.tier.tier_id}`,
      label: `${found.product.title} — ${found.tier.label}`,
      category: found.product.category,
      unit: found.product.unit,
      unit_price_cents: found.tier.price_cents,
      qty: 0,
    }];
  });

const quoteFor = (trip, travelers, selections) => {
  const offered = new Set(trip.offers.map((o) => o.tier_id));

  const lines = Object.entries(selections || {}).flatMap(([tierId, qty]) => {
    const id = Number(tierId);
    if (!offered.has(id)) return [];          // never price something not on offer
    const found = findTier(world, id);
    if (!found) return [];
    return [{
      key: `tier:${id}`,
      label: `${found.product.title} — ${found.tier.label}`,
      category: found.product.category,
      unit: found.product.unit,
      unit_price_cents: found.tier.price_cents,
      qty: Number(qty) || 0,
    }];
  });

  return priceQuote({
    base_price_cents: trip.base_price_cents,
    travelers: Number(travelers) || 1,
    currency: trip.currency,
    selections: lines,
  });
};

/* ---------------------------------------------------------------- router */

const routes = [
  ['POST', /^\/api\/v1\/auth\/login$/, async (req, res) => {
    const body = await readBody(req);
    const user = world.users.find(
      (u) => u.email === String(body.email || '').toLowerCase().trim() && u.password === body.password,
    );
    if (!user) return json(res, 401, { error: 'Invalid email or password' });
    return json(res, 200, { token: tokenFor(user), user: publicUser(user) });
  }],

  ['POST', /^\/api\/v1\/auth\/signup$/, async (req, res) => {
    const body = await readBody(req);
    if (world.users.some((u) => u.email === String(body.email || '').toLowerCase())) {
      return json(res, 422, { errors: ['Email has already been taken'] });
    }
    const user = {
      id: world.users.length + 1, name: body.name, email: String(body.email || '').toLowerCase(),
      password: body.password, role: body.role || 'traveler',
    };
    world.users.push(user);
    return json(res, 201, { token: tokenFor(user), user: publicUser(user) });
  }],

  ['GET', /^\/api\/v1\/auth\/me$/, async (req, res) => {
    const user = userFromToken(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    return json(res, 200, publicUser(user));
  }],

  ['GET', /^\/api\/v1\/trips$/, async (req, res, _m, url) => {
    let trips = world.trips.filter((t) => t.status === 'published');
    const destination = url.searchParams.get('destination');
    const category = url.searchParams.get('category');

    if (destination) {
      trips = trips.filter((t) => t.destination.toLowerCase().includes(destination.toLowerCase()));
    }
    if (category) {
      trips = trips.filter((t) => tripCard(t).add_on_categories.includes(category));
    }
    return json(res, 200, { trips: trips.map(tripCard) });
  }],

  ['POST', /^\/api\/v1\/trips\/([^/]+)\/quote$/, async (req, res, m) => {
    const trip = world.trips.find((t) => t.slug === m[1] || String(t.id) === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });
    const body = await readBody(req);
    try {
      return json(res, 200, { quote: quoteFor(trip, body.travelers, body.selections) });
    } catch (e) {
      return json(res, 422, { error: e.message });
    }
  }],

  ['POST', /^\/api\/v1\/trips\/([^/]+)\/bookings$/, async (req, res, m) => {
    const user = userFromToken(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const trip = world.trips.find((t) => t.slug === m[1] || String(t.id) === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });

    const body = await readBody(req);
    const computed = quoteFor(trip, body.travelers, body.selections);
    const reference = `TRP-${String(world.bookings.length + 1).padStart(4, '0')}${Date.now().toString(36).slice(-4).toUpperCase()}`;

    const booking = {
      reference, status: 'pending', travelers_count: computed.travelers,
      currency: computed.currency, base_total_cents: computed.base_total_cents,
      addons_total_cents: computed.addons_total_cents, fees_cents: computed.fees_cents,
      total_cents: computed.total_cents,
      lead_traveler: body.lead || { name: user.name, email: user.email, phone: null },
      trip: tripCard(trip),
      add_ons: computed.addon_lines.map((line, i) => ({
        id: i + 1, tier_id: Number(String(line.key).split(':')[1]), title: line.label,
        label: line.label, category: line.category, unit: line.unit, qty: line.qty,
        unit_price_cents: line.unit_price_cents, line_total_cents: line.line_total_cents,
        status: 'pending',
      })),
    };
    world.bookings.push(booking);
    return json(res, 201, { booking });
  }],

  ['GET', /^\/api\/v1\/trips\/([^/]+)$/, async (req, res, m) => {
    const trip = world.trips.find((t) => t.slug === m[1] || String(t.id) === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });
    return json(res, 200, { trip: tripDetail(trip) });
  }],

  ['GET', /^\/api\/v1\/bookings\/([^/]+)$/, async (req, res, m) => {
    const booking = world.bookings.find((b) => b.reference === m[1]);
    if (!booking) return json(res, 404, { error: 'Booking not found' });
    return json(res, 200, { booking });
  }],

  /* ------------------------------------------------------- curator side */

  ['GET', /^\/api\/v1\/curator\/trips$/, async (req, res) => {
    const user = userFromToken(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const trips = world.trips.filter((t) => t.curator.id === (user.curator_profile_id || 1));
    return json(res, 200, {
      trips: trips.map((t) => ({
        ...tripDetail(t),
        max_basket: maxBasket({
          base_price_cents: t.base_price_cents, travelers: t.capacity,
          currency: t.currency, offers: offerSelections(t),
        }),
      })),
    });
  }],

  ['GET', /^\/api\/v1\/curator\/trips\/([^/]+)\/add_ons\/catalogue$/, async (req, res, m) => {
    const trip = world.trips.find((t) => String(t.id) === m[1] || t.slug === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });
    const attached = new Set(trip.offers.map((o) => o.tier_id));

    return json(res, 200, {
      products: world.products.map((p) => ({
        product_id: p.product_id, category: p.category, category_label: p.category_label,
        title: p.title, description: p.description, unit: p.unit, unit_label: p.unit_label,
        city: p.city, rating: p.rating, reviews_count: p.reviews_count, partner: p.partner,
        tiers: p.tiers.map((t) => ({ ...t, attached: attached.has(t.tier_id) })),
      })),
    });
  }],

  ['GET', /^\/api\/v1\/curator\/trips\/([^/]+)\/add_ons$/, async (req, res, m) => {
    const trip = world.trips.find((t) => String(t.id) === m[1] || t.slug === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });
    return json(res, 200, {
      trip_add_ons: offerGroups(trip),
      max_basket: maxBasket({
        base_price_cents: trip.base_price_cents, travelers: trip.capacity,
        currency: trip.currency, offers: offerSelections(trip),
      }),
    });
  }],

  ['POST', /^\/api\/v1\/curator\/trips\/([^/]+)\/add_ons$/, async (req, res, m) => {
    const trip = world.trips.find((t) => String(t.id) === m[1] || t.slug === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });

    const body = await readBody(req);
    const payload = body.trip_add_on || body;
    const tierId = Number(payload.add_on_tier_id);
    if (!findTier(world, tierId)) return json(res, 422, { errors: ['Unknown add-on tier'] });
    if (trip.offers.some((o) => o.tier_id === tierId)) {
      return json(res, 422, { errors: ['Add on tier is already offered on this trip'] });
    }

    const offer = {
      id: Math.max(0, ...world.trips.flatMap((t) => t.offers.map((o) => o.id))) + 1,
      tier_id: tierId,
      position: trip.offers.length + 1,
      commission_pct: Number(payload.commission_pct ?? 10),
      recommended: Boolean(payload.recommended),
    };
    trip.offers.push(offer);
    return json(res, 201, { trip_add_on: offer });
  }],

  ['PATCH', /^\/api\/v1\/curator\/trips\/([^/]+)\/add_ons\/(\d+)$/, async (req, res, m) => {
    const trip = world.trips.find((t) => String(t.id) === m[1] || t.slug === m[1]);
    const offer = trip?.offers.find((o) => o.id === Number(m[2]));
    if (!offer) return json(res, 404, { error: 'Not found' });

    const body = await readBody(req);
    const payload = body.trip_add_on || body;
    if (payload.add_on_tier_id !== undefined) offer.tier_id = Number(payload.add_on_tier_id);
    if (payload.commission_pct !== undefined) offer.commission_pct = Number(payload.commission_pct);
    if (payload.recommended !== undefined) offer.recommended = Boolean(payload.recommended);
    return json(res, 200, { trip_add_on: offer });
  }],

  ['DELETE', /^\/api\/v1\/curator\/trips\/([^/]+)\/add_ons\/(\d+)$/, async (req, res, m) => {
    const trip = world.trips.find((t) => String(t.id) === m[1] || t.slug === m[1]);
    if (!trip) return json(res, 404, { error: 'Trip not found' });
    trip.offers = trip.offers.filter((o) => o.id !== Number(m[2]));
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    return res.end();
  }],
];

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  for (const [method, pattern, handler] of routes) {
    if (req.method !== method) continue;
    const match = url.pathname.match(pattern);
    if (match) return handler(req, res, match, url);
  }

  return json(res, 404, { error: `No route for ${req.method} ${url.pathname}` });
});

server.listen(PORT, () => {
  console.log(`Tripojo mock API on http://localhost:${PORT}`);
  console.log('Log in with meera@tripojo.test / tripojo123 (curator) or traveler@tripojo.test / tripojo123');
});
