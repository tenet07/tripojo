// Proves the JS mock and the Ruby API price identically.
//
// The mock server only earns its keep if its numbers are the real numbers —
// otherwise the UI gets built against a fiction. This runs both
// implementations over the same cases and fails loudly on any divergence.
//
//   node mock-api/parity/parity.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { quote } from '../pricing.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(join(here, '..', 'cases.json'), 'utf8'));

const rubyOut = execFileSync('ruby', [join(here, 'ruby_quotes.rb')], { encoding: 'utf8' });
const rubyResults = JSON.parse(rubyOut);

let failures = 0;

cases.forEach((kase, i) => {
  const js = quote({
    base_price_cents: kase.base_price_cents,
    travelers: kase.travelers,
    selections: kase.selections,
  });
  const { name, ...ruby } = rubyResults[i];

  const jsJson = JSON.stringify(js);
  const rubyJson = JSON.stringify(ruby);

  if (jsJson === rubyJson) {
    console.log(`  ok   ${name} — total ${js.total_cents}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
    console.error(`       ruby: ${rubyJson}`);
    console.error(`       js  : ${jsJson}`);
  }
});

console.log(`\n${cases.length - failures}/${cases.length} cases agree between Ruby and JS`);
process.exit(failures === 0 ? 0 : 1);
