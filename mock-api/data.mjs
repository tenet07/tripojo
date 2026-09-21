// In-memory mirror of backend/db/seeds.rb, so the mock API and a freshly
// seeded Rails database show the same world.
//
// Money is in paise, exactly as the real API returns it.

export function buildWorld() {
  const partners = {
    guide: { id: 1, name: 'Rahul Sharma Guiding', verified: true },
    adventure: { id: 2, name: 'Bali Adventure Co.', verified: true },
    taxi: { id: 3, name: "Made's Airport Taxi", verified: true },
    hostel: { id: 4, name: 'Sunrise Beach Hostel', verified: true },
  };

  const products = [
    {
      product_id: 1, partner: partners.guide, category: 'local_guide', category_label: 'Local Guide',
      title: 'Ubud culture & food walking tour',
      description: 'Half or full day through the rice terraces, temples and warungs Meera actually eats at.',
      unit: 'per_person', unit_label: 'per person', city: 'Ubud',
      rating: 4.9, reviews_count: 1194, bookings_count: 3100,
      tiers: [
        { tier_id: 11, label: 'Half day · 4 hrs', price_cents: 150000, currency: 'INR', max_capacity: null },
        { tier_id: 12, label: 'Full day · 8 hrs', price_cents: 260000, currency: 'INR', max_capacity: null },
      ],
    },
    {
      product_id: 2, partner: partners.adventure, category: 'activity', category_label: 'Activity',
      title: 'Sekumpul waterfall trek + gear',
      description: 'Guided descent to the falls. Boots, poles and a dry bag included.',
      unit: 'per_person', unit_label: 'per person', city: 'Singaraja',
      rating: 4.7, reviews_count: 860, bookings_count: 12400,
      tiers: [
        { tier_id: 21, label: 'Group trek', price_cents: 120000, currency: 'INR', max_capacity: null },
        { tier_id: 22, label: 'Private trek', price_cents: 220000, currency: 'INR', max_capacity: null },
      ],
    },
    {
      product_id: 3, partner: partners.taxi, category: 'transport', category_label: 'Transport',
      title: 'Airport pickup & drop — private car',
      description: 'Meet and greet at arrivals, 60 minutes free waiting, round trip.',
      unit: 'per_vehicle', unit_label: 'per vehicle', city: 'Denpasar',
      rating: 4.8, reviews_count: 2451, bookings_count: 40200,
      tiers: [
        { tier_id: 31, label: 'Sedan · up to 3', price_cents: 120000, currency: 'INR', max_capacity: 3 },
        { tier_id: 32, label: 'SUV · up to 6', price_cents: 190000, currency: 'INR', max_capacity: 6 },
      ],
    },
    {
      product_id: 4, partner: partners.hostel, category: 'stay_upgrade', category_label: 'Stay Upgrade',
      title: 'Private double room upgrade',
      description: 'Move out of the dorm into an ensuite double with a sea view.',
      unit: 'per_night', unit_label: 'per night', city: 'Canggu',
      rating: 4.6, reviews_count: 512, bookings_count: 8300,
      tiers: [
        { tier_id: 41, label: 'Private double', price_cents: 240000, currency: 'INR', max_capacity: 2 },
      ],
    },
  ];

  const curator = {
    id: 1, display_name: 'Meera Kapoor', instagram_handle: '@meera.wanders',
    follower_count: 128400, avatar_url: null,
  };

  const trips = [
    {
      id: 1, slug: 'bali-waterfalls-beach-week-bali-indonesia',
      title: 'Bali Waterfalls & Beach Week', destination: 'Bali, Indonesia',
      summary: 'Seven days of waterfalls, rice terraces and a lot of sitting still by the sea.',
      description: 'Six nights at Sunrise Beach Hostel in Canggu, with day trips north to the falls and free afternoons built in on purpose.',
      start_date: '2026-11-12', end_date: '2026-11-18', nights: 6,
      base_price_cents: 1800000, currency: 'INR', capacity: 8, spots_left: 4,
      status: 'published', cover_image_url: null, photo: 'jungle',
      rating: 4.9, reviews_count: 1194, bookings_count: 3040,
      curator,
      itinerary: [
        { id: 1, day_number: 1, title: 'Land, settle, sunset at Batu Bolong', description: 'Airport pickup, check in, an unhurried first evening.' },
        { id: 2, day_number: 2, title: 'Ubud: temples and the long lunch', description: 'Walking tour with Rahul, then nothing scheduled.' },
        { id: 3, day_number: 3, title: 'Sekumpul falls', description: 'Early start north, trek down to the falls, back by dark.' },
        { id: 4, day_number: 4, title: 'Free day', description: 'Surf lesson, spa, or absolutely nothing.' },
        { id: 5, day_number: 5, title: 'Rice terraces & Tegallalang', description: 'Slow morning, terraces in the afternoon light.' },
        { id: 6, day_number: 6, title: 'Nusa Penida day trip', description: 'Boat across, Kelingking, back for dinner.' },
        { id: 7, day_number: 7, title: 'Last swim and out', description: 'Late checkout, airport drop.' },
      ],
      // Which tiers Meera switched on, mirroring the seed.
      offers: [
        // Both guide durations are offered, so the traveller picks the
        // package; only the SUV is offered for transport, so they don't.
        { id: 101, tier_id: 11, position: 1, commission_pct: 10, recommended: true },
        { id: 107, tier_id: 12, position: 2, commission_pct: 10, recommended: false },
        { id: 102, tier_id: 21, position: 3, commission_pct: 12, recommended: false },
        { id: 103, tier_id: 32, position: 4, commission_pct: 8, recommended: false },
        { id: 104, tier_id: 41, position: 5, commission_pct: 15, recommended: false },
      ],
    },
    {
      id: 2, slug: 'spiti-valley-roadtrip-himachal-pradesh',
      title: 'Spiti Valley Roadtrip', destination: 'Himachal Pradesh, India',
      summary: 'Six days of high desert, monasteries and very cold mornings.',
      description: 'Manali to Kaza and back, with acclimatisation days built in.',
      start_date: '2026-12-03', end_date: '2026-12-09', nights: 6,
      base_price_cents: 1420000, currency: 'INR', capacity: 6, spots_left: 6,
      status: 'published', cover_image_url: null, photo: 'mountain',
      rating: 4.8, reviews_count: 862, bookings_count: 1010,
      curator: { id: 2, display_name: 'Arjun Rana', instagram_handle: '@himalayan.roam', follower_count: 64200, avatar_url: null },
      itinerary: [
        { id: 8, day_number: 1, title: 'Manali, acclimatise', description: 'Arrive, walk slowly, sleep early.' },
        { id: 9, day_number: 2, title: 'Over Kunzum La', description: 'The long drive in.' },
      ],
      offers: [{ id: 105, tier_id: 32, position: 1, commission_pct: 8, recommended: false }],
    },
    {
      id: 3, slug: 'goa-sunset-surf-camp-goa-india',
      title: 'Goa Sunset Surf Camp', destination: 'Goa, India',
      summary: 'Four days of beginner-friendly surf and long evenings.',
      description: 'Two sessions a day, board and wetsuit included.',
      start_date: '2026-10-15', end_date: '2026-10-19', nights: 4,
      base_price_cents: 860000, currency: 'INR', capacity: 10, spots_left: 7,
      status: 'published', cover_image_url: null, photo: 'surf',
      rating: 4.7, reviews_count: 2451, bookings_count: 8200,
      curator: { id: 3, display_name: 'Nikhil Dsouza', instagram_handle: '@surf.souls', follower_count: 41800, avatar_url: null },
      itinerary: [{ id: 10, day_number: 1, title: 'First paddle out', description: 'Theory, then straight in.' }],
      offers: [{ id: 106, tier_id: 11, position: 1, commission_pct: 10, recommended: false }],
    },
  ];

  const users = [
    { id: 1, name: 'Meera Kapoor', email: 'meera@tripojo.test', password: 'tripojo123', role: 'curator', curator_profile_id: 1 },
    { id: 2, name: 'Wayan Sutedja', email: 'host@tripojo.test', password: 'tripojo123', role: 'host' },
    { id: 3, name: 'Rahul Sharma', email: 'rahul@tripojo.test', password: 'tripojo123', role: 'partner' },
    { id: 4, name: 'Gunjan Solanki', email: 'traveler@tripojo.test', password: 'tripojo123', role: 'traveler' },
  ];

  return { products, trips, users, bookings: [] };
}

export function findTier(world, tierId) {
  for (const product of world.products) {
    const tier = product.tiers.find((t) => t.tier_id === Number(tierId));
    if (tier) return { product, tier };
  }
  return null;
}
