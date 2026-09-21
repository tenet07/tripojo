# frozen_string_literal: true

module Tripojo
  # The one place the basket rule lives.
  #
  # Deliberately plain Ruby: no ActiveRecord, no Rails, no floats. It takes
  # primitives and returns primitives, which means it can be unit-tested
  # without booting the app, and the API can be the single authority on
  # price while the React client just renders what it is told.
  #
  # Money is always an Integer in the currency's minor unit (paise for INR).
  # Fees are basis points, so the arithmetic stays in integers end to end.
  module Pricing
    # What a quantity of "3" means depends entirely on the unit.
    UNITS = {
      "per_person"  => "per person",
      "per_group"   => "per group",
      "per_vehicle" => "per vehicle",
      "per_night"   => "per night"
    }.freeze

    DEFAULT_FEE_BPS = 500 # 5% platform fee

    class Error < StandardError; end

    Line = Struct.new(
      :key, :label, :category, :unit, :unit_price_cents, :qty, :line_total_cents,
      keyword_init: true
    ) do
      def to_h_public
        {
          key: key, label: label, category: category, unit: unit,
          unit_price_cents: unit_price_cents, qty: qty, line_total_cents: line_total_cents
        }
      end
    end

    Quote = Struct.new(
      :currency, :travelers, :base_unit_price_cents, :base_total_cents,
      :lines, :addons_total_cents, :subtotal_cents, :fees_cents, :total_cents,
      :per_traveler_cents,
      keyword_init: true
    ) do
      def to_h_public
        {
          currency: currency,
          travelers: travelers,
          base_unit_price_cents: base_unit_price_cents,
          base_total_cents: base_total_cents,
          addon_lines: lines.map(&:to_h_public),
          addons_total_cents: addons_total_cents,
          subtotal_cents: subtotal_cents,
          fees_cents: fees_cents,
          total_cents: total_cents,
          per_traveler_cents: per_traveler_cents
        }
      end
    end

    class << self
      # selections: [{ key:, label:, category:, unit:, unit_price_cents:, qty: }, ...]
      #
      # Every line is simply unit price x quantity. The unit does not change
      # the arithmetic — it changes what the traveler is choosing a quantity
      # *of*, which is a UI and copy concern, not a maths one. Keeping that
      # boundary clean is why this stays readable as categories get added.
      def quote(base_price_cents:, travelers:, selections: [], currency: "INR", fee_bps: DEFAULT_FEE_BPS)
        travelers = cast_count(travelers, "travelers")
        raise Error, "travelers must be at least 1" if travelers < 1

        base_price_cents = cast_money(base_price_cents, "base_price_cents")
        base_total_cents = base_price_cents * travelers

        lines = Array(selections).filter_map { |raw| build_line(raw) }
        addons_total_cents = lines.sum(&:line_total_cents)

        subtotal_cents = base_total_cents + addons_total_cents
        fees_cents     = fee(subtotal_cents, fee_bps)
        total_cents    = subtotal_cents + fees_cents

        Quote.new(
          currency: currency,
          travelers: travelers,
          base_unit_price_cents: base_price_cents,
          base_total_cents: base_total_cents,
          lines: lines,
          addons_total_cents: addons_total_cents,
          subtotal_cents: subtotal_cents,
          fees_cents: fees_cents,
          total_cents: total_cents,
          per_traveler_cents: divide_round(total_cents, travelers)
        )
      end

      # The curator's "what a traveler could pay" ceiling: every offered
      # add-on taken at its natural quantity for the group.
      def max_basket(base_price_cents:, travelers:, offers: [], currency: "INR", fee_bps: DEFAULT_FEE_BPS)
        selections = Array(offers).map do |offer|
          offer.merge(qty: natural_qty(offer[:unit] || offer["unit"], travelers))
        end
        quote(base_price_cents: base_price_cents, travelers: travelers,
              selections: selections, currency: currency, fee_bps: fee_bps)
      end

      # How many units a group of this size would take by default. A guide is
      # bought per head; one taxi and one room upgrade covers the group until
      # someone says otherwise.
      def natural_qty(unit, travelers)
        unit.to_s == "per_person" ? travelers : 1
      end

      # Basis points in integer arithmetic, rounding half up. No Float ever
      # touches a money value.
      def fee(subtotal_cents, fee_bps = DEFAULT_FEE_BPS)
        return 0 if subtotal_cents <= 0 || fee_bps.to_i <= 0

        (subtotal_cents * fee_bps.to_i + 5_000) / 10_000
      end

      def unit_label(unit)
        UNITS.fetch(unit.to_s, unit.to_s.tr("_", " "))
      end

      def valid_unit?(unit)
        UNITS.key?(unit.to_s)
      end

      private

      def build_line(raw)
        row = symbolize(raw)
        qty = cast_count(row[:qty], "qty")
        return nil if qty.zero?

        unit = row[:unit].to_s
        raise Error, "unknown unit #{unit.inspect}" unless valid_unit?(unit)

        unit_price_cents = cast_money(row[:unit_price_cents], "unit_price_cents")

        Line.new(
          key: row[:key],
          label: row[:label],
          category: row[:category],
          unit: unit,
          unit_price_cents: unit_price_cents,
          qty: qty,
          line_total_cents: unit_price_cents * qty
        )
      end

      def symbolize(hash)
        hash.each_with_object({}) { |(k, v), out| out[k.to_sym] = v }
      end

      def cast_money(value, field)
        int = Integer(value)
        raise Error, "#{field} cannot be negative" if int.negative?

        int
      rescue TypeError, ArgumentError
        raise Error, "#{field} must be an integer number of minor units, got #{value.inspect}"
      end

      def cast_count(value, field)
        int = Integer(value)
        raise Error, "#{field} cannot be negative" if int.negative?

        int
      rescue TypeError, ArgumentError
        raise Error, "#{field} must be a whole number, got #{value.inspect}"
      end

      # Round half up without going through Float.
      def divide_round(numerator, denominator)
        return 0 if denominator.zero?

        (numerator + denominator / 2) / denominator
      end
    end
  end
end
