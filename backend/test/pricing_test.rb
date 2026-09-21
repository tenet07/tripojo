# frozen_string_literal: true

# Runs without Rails: the pricing module is deliberately plain Ruby, so the
# basket rule can be tested with nothing but the stdlib.
#
#   ruby test/pricing_test.rb
require "minitest/autorun"
require_relative "../app/lib/tripojo/pricing"

class PricingTest < Minitest::Test
  P = Tripojo::Pricing

  # ₹18,000 per person, in paise.
  BASE = 1_800_000

  def guide(qty)      = { key: "guide", unit: "per_person",  unit_price_cents: 150_000, qty: qty }
  def trek(qty)       = { key: "trek",  unit: "per_person",  unit_price_cents: 120_000, qty: qty }
  def taxi(qty)       = { key: "taxi",  unit: "per_vehicle", unit_price_cents: 190_000, qty: qty }
  def room(qty)       = { key: "room",  unit: "per_night",   unit_price_cents: 240_000, qty: qty }

  def test_base_only
    q = P.quote(base_price_cents: BASE, travelers: 4)

    assert_equal 7_200_000, q.base_total_cents
    assert_equal 0, q.addons_total_cents
    assert_equal 7_200_000, q.subtotal_cents
    assert_equal 360_000, q.fees_cents          # 5% of 72,000
    assert_equal 7_560_000, q.total_cents
    assert_equal 1_890_000, q.per_traveler_cents
  end

  def test_per_person_addon_multiplies_by_quantity_not_by_travellers
    # Two of four travellers take the guide. The other two do not pay for it.
    q = P.quote(base_price_cents: BASE, travelers: 4, selections: [guide(2)])

    assert_equal 300_000, q.addons_total_cents
    assert_equal 7_500_000, q.subtotal_cents
  end

  def test_mixed_units_in_one_basket
    q = P.quote(base_price_cents: BASE, travelers: 4,
                selections: [guide(2), trek(4), taxi(1), room(6)])

    expected_addons = 300_000 + 480_000 + 190_000 + 1_440_000
    assert_equal expected_addons, q.addons_total_cents
    assert_equal 7_200_000 + expected_addons, q.subtotal_cents
    assert_equal 4, q.lines.length
  end

  def test_zero_quantity_lines_are_dropped_entirely
    q = P.quote(base_price_cents: BASE, travelers: 2, selections: [guide(0), taxi(1)])

    assert_equal 1, q.lines.length
    assert_equal "taxi", q.lines.first.key
    assert_equal 190_000, q.addons_total_cents
  end

  def test_removing_an_addon_returns_the_basket_to_its_previous_total
    before = P.quote(base_price_cents: BASE, travelers: 4, selections: [guide(2)])
    added  = P.quote(base_price_cents: BASE, travelers: 4, selections: [guide(2), trek(3)])
    after  = P.quote(base_price_cents: BASE, travelers: 4, selections: [guide(2), trek(0)])

    refute_equal before.total_cents, added.total_cents
    assert_equal before.total_cents, after.total_cents
  end

  def test_fee_rounds_half_up_and_never_uses_floats
    # Subtotal chosen so 5% lands on a half-paise boundary.
    q = P.quote(base_price_cents: 10, travelers: 1, selections: [], fee_bps: 500)
    assert_equal 1, q.fees_cents               # 0.5 rounds up to 1
    assert_kind_of Integer, q.fees_cents

    assert_equal 0, P.fee(0)
    assert_equal 0, P.fee(100, 0)
    assert_equal 5, P.fee(100, 500)
  end

  def test_per_traveller_divides_the_whole_basket_including_fees
    q = P.quote(base_price_cents: BASE, travelers: 4, selections: [taxi(1)])

    assert_equal q.total_cents, q.per_traveler_cents * 4 unless (q.total_cents % 4).positive?
    assert_operator q.per_traveler_cents, :>, q.base_unit_price_cents
  end

  def test_max_basket_takes_per_person_addons_once_per_traveller_and_others_once
    q = P.max_basket(
      base_price_cents: BASE, travelers: 4,
      offers: [guide(0), taxi(0)]  # qty is replaced by the natural quantity
    )

    guide_line = q.lines.find { |l| l.key == "guide" }
    taxi_line  = q.lines.find { |l| l.key == "taxi" }

    assert_equal 4, guide_line.qty, "a per-person add-on should default to one per traveller"
    assert_equal 1, taxi_line.qty,  "a per-vehicle add-on should default to a single vehicle"
  end

  def test_natural_qty_rule
    assert_equal 5, P.natural_qty("per_person", 5)
    assert_equal 1, P.natural_qty("per_vehicle", 5)
    assert_equal 1, P.natural_qty("per_group", 5)
    assert_equal 1, P.natural_qty("per_night", 5)
  end

  def test_rejects_nonsense_input
    assert_raises(P::Error) { P.quote(base_price_cents: BASE, travelers: 0) }
    assert_raises(P::Error) { P.quote(base_price_cents: -1, travelers: 1) }
    assert_raises(P::Error) do
      P.quote(base_price_cents: BASE, travelers: 1,
              selections: [{ key: "x", unit: "per_fortnight", unit_price_cents: 100, qty: 1 }])
    end
    assert_raises(P::Error) do
      P.quote(base_price_cents: BASE, travelers: 1,
              selections: [{ key: "x", unit: "per_person", unit_price_cents: "12.50", qty: 1 }])
    end
  end

  def test_string_keys_are_accepted_from_json_params
    q = P.quote(base_price_cents: BASE, travelers: 2,
                selections: [{ "key" => "guide", "unit" => "per_person",
                               "unit_price_cents" => 150_000, "qty" => 2 }])

    assert_equal 300_000, q.addons_total_cents
  end

  def test_public_hash_is_json_ready
    h = P.quote(base_price_cents: BASE, travelers: 2, selections: [guide(1)]).to_h_public

    assert_equal %i[currency travelers base_unit_price_cents base_total_cents addon_lines
                    addons_total_cents subtotal_cents fees_cents total_cents per_traveler_cents],
                 h.keys
    assert_kind_of Array, h[:addon_lines]
    assert_equal 1, h[:addon_lines].first[:qty]
  end
end
