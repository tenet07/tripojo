# frozen_string_literal: true

# Prints the Ruby pricing module's answer for every shared case, as JSON.
# Its Node counterpart prints the same thing; parity.mjs diffs them.
require "json"
require_relative "../../backend/app/lib/tripojo/pricing"

cases = JSON.parse(File.read(File.expand_path("../cases.json", __dir__)))

results = cases.map do |kase|
  quote = Tripojo::Pricing.quote(
    base_price_cents: kase["base_price_cents"],
    travelers: kase["travelers"],
    selections: kase["selections"]
  )
  { "name" => kase["name"] }.merge(JSON.parse(quote.to_h_public.to_json))
end

puts JSON.pretty_generate(results)
