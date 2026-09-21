# Seeds the exact scenario the wireframes show, so the app you boot looks
# like the design you signed off on.
#
#   bin/rails db:seed

puts "Seeding Tripojo…"

ActiveRecord::Base.transaction do
  [BookingAddOn, Booking, TripAddOn, AddOnTier, AddOnProduct, TripActivity, Trip,
   RoomType, Property, PartnerProfile, HostProfile, CuratorProfile, User].each(&:delete_all)

  # ---------------------------------------------------------------- curator
  meera = User.create!(
    name: "Meera Kapoor", email: "meera@tripojo.test",
    password: "tripojo123", role: "curator"
  )
  meera.curator_profile.update!(
    display_name: "Meera Kapoor",
    bio: "Slow, small-group trips through Indonesia and the Western Ghats. " \
         "Six years of doing this the hard way so you don't have to.",
    instagram_handle: "@meera.wanders",
    follower_count: 128_400,
    avatar_url: nil
  )

  # ------------------------------------------------------------------- host
  host_user = User.create!(
    name: "Wayan Sutedja", email: "host@tripojo.test",
    password: "tripojo123", role: "host"
  )
  host_user.host_profile.update!(
    business_name: "Sunrise Beach Hostel",
    business_type: "hostel",
    contact_phone: "+62 81 2233 4455",
    verification_status: "verified"
  )
  property = host_user.host_profile.properties.create!(
    name: "Sunrise Beach Hostel", city: "Canggu", country: "Indonesia",
    address: "Jl. Pantai Batu Bolong 88", description: "Surf-side hostel two minutes from the break.",
    status: "live"
  )
  property.room_types.create!(name: "8-bed Mixed Dorm", capacity: 8, price_per_night: 850, total_units: 3)
  property.room_types.create!(name: "Private Double Room", capacity: 2, price_per_night: 2_400, total_units: 5)

  # --------------------------------------------------------------- partners
  def partner!(name:, email:, business:, category:, city:)
    user = User.create!(name: name, email: email, password: "tripojo123", role: "partner")
    user.partner_profile.update!(
      business_name: business, primary_category: category,
      city: city, verification_status: "verified"
    )
    user.partner_profile
  end

  guide = partner!(name: "Rahul Sharma", email: "rahul@tripojo.test",
                   business: "Rahul Sharma Guiding", category: "local_guide", city: "Ubud")
  adventure = partner!(name: "Ketut Adi", email: "ketut@tripojo.test",
                       business: "Bali Adventure Co.", category: "activity", city: "Singaraja")
  taxi = partner!(name: "Made Wirawan", email: "made@tripojo.test",
                  business: "Made's Airport Taxi", category: "transport", city: "Denpasar")

  guide_product = guide.add_on_products.new(
    category: "local_guide", unit: "per_person", city: "Ubud",
    title: "Ubud culture & food walking tour",
    description: "Half or full day through the rice terraces, temples and warungs Meera actually eats at.",
    rating_cache: 4.9, reviews_count: 1_194, bookings_count: 3_100
  )
  guide_half = guide_product.add_on_tiers.build(label: "Half day · 4 hrs", price_cents: 150_000, position: 1)
  guide_full = guide_product.add_on_tiers.build(label: "Full day · 8 hrs", price_cents: 260_000, position: 2)
  guide_product.save!

  trek_product = adventure.add_on_products.new(
    category: "activity", unit: "per_person", city: "Singaraja",
    title: "Sekumpul waterfall trek + gear",
    description: "Guided descent to the falls. Boots, poles and a dry bag included.",
    rating_cache: 4.7, reviews_count: 860, bookings_count: 12_400
  )
  trek_group = trek_product.add_on_tiers.build(label: "Group trek", price_cents: 120_000, position: 1)
  trek_product.add_on_tiers.build(label: "Private trek", price_cents: 220_000, position: 2)
  trek_product.save!

  # Per-vehicle, with capacity: this is the case that breaks a naive
  # per-person basket, which is exactly why it's seeded.
  taxi_product = taxi.add_on_products.new(
    category: "transport", unit: "per_vehicle", city: "Denpasar",
    title: "Airport pickup & drop — private car",
    description: "Meet and greet at arrivals, 60 minutes free waiting, round trip.",
    rating_cache: 4.8, reviews_count: 2_451, bookings_count: 40_200
  )
  taxi_product.add_on_tiers.build(label: "Sedan · up to 3", price_cents: 120_000, max_capacity: 3, position: 1)
  taxi_suv = taxi_product.add_on_tiers.build(label: "SUV · up to 6", price_cents: 190_000, max_capacity: 6, position: 2)
  taxi_product.save!

  # The host sells a room upgrade through the same mechanism as any partner.
  host_partner = PartnerProfile.create!(
    user: host_user, business_name: "Sunrise Beach Hostel",
    primary_category: "stay_upgrade", city: "Canggu", verification_status: "verified"
  )
  room_product = host_partner.add_on_products.new(
    category: "stay_upgrade", unit: "per_night", city: "Canggu",
    title: "Private double room upgrade",
    description: "Move out of the dorm into an ensuite double with a sea view.",
    rating_cache: 4.6, reviews_count: 512, bookings_count: 8_300
  )
  room_product.add_on_tiers.build(label: "Private double", price_cents: 240_000, max_capacity: 2, position: 1)
  room_product.save!

  # ------------------------------------------------------------------- trip
  trip = meera.curator_profile.trips.create!(
    title: "Bali Waterfalls & Beach Week",
    destination: "Bali, Indonesia",
    summary: "Seven days of waterfalls, rice terraces and a lot of sitting still by the sea.",
    description: "Six nights at Sunrise Beach Hostel in Canggu, with day trips north to " \
                 "the falls and free afternoons built in on purpose.",
    start_date: Date.new(2026, 11, 12),
    end_date: Date.new(2026, 11, 18),
    base_price_cents: 1_800_000,
    capacity: 8,
    status: "published",
    rating_cache: 4.9,
    reviews_count: 1_194,
    bookings_count: 3_040
  )
  [
    [1, "Land, settle, sunset at Batu Bolong", "Airport pickup, check in, an unhurried first evening."],
    [2, "Ubud: temples and the long lunch", "Walking tour with Rahul, then nothing scheduled."],
    [3, "Sekumpul falls", "Early start north, trek down to the falls, back by dark."],
    [4, "Free day", "Surf lesson, spa, or absolutely nothing."],
    [5, "Rice terraces & Tegallalang", "Slow morning, terraces in the afternoon light."],
    [6, "Nusa Penida day trip", "Boat across, Kelingking, back for dinner."],
    [7, "Last swim and out", "Late checkout, airport drop."]
  ].each { |day, title, description| trip.trip_activities.create!(day_number: day, title: title, description: description) }

  # What Meera decided to put on offer. She offers both guide durations so
  # travellers can choose, but only the group trek and only the SUV — not
  # every tier these partners sell.
  [
    [guide_half, 10, true],
    [guide_full, 10, false],
    [trek_group, 12, false],
    [taxi_suv, 8, false],
    [room_product.add_on_tiers.first, 15, false]
  ].each_with_index do |(tier, commission, recommended), index|
    trip.trip_add_ons.create!(add_on_tier: tier, position: index + 1,
                              commission_pct: commission, recommended: recommended)
  end

  # ---------------------------------------------------------------- traveler
  traveler = User.create!(
    name: "Gunjan Solanki", email: "traveler@tripojo.test",
    password: "tripojo123", role: "traveler"
  )

  booking = Booking.build_from_selections(
    trip: trip, traveler: traveler, travelers_count: 4,
    selections: { guide_half.id => 2, taxi_suv.id => 1 },
    lead: { name: traveler.name, email: traveler.email, phone: "+91 98765 43210" }
  )
  booking.save!

  puts <<~SUMMARY

    Done.

      Curator   meera@tripojo.test      / tripojo123
      Host      host@tripojo.test       / tripojo123
      Partners  rahul@ / ketut@ / made@tripojo.test  / tripojo123
      Traveler  traveler@tripojo.test   / tripojo123

      Trip      #{trip.slug}
      Add-ons   #{trip.trip_add_ons.count} on offer
      Booking   #{booking.reference} — #{booking.total_cents / 100} #{booking.currency} for #{booking.travelers_count}
  SUMMARY
end
