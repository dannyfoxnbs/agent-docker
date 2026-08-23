In `src/pricing.ts`, extend `seatBand` so it covers the full set of bands we now sell:

- 1–5 seats: `"starter"`
- 6–20 seats: `"growth"`
- 21–100 seats: `"scale"`
- 101 seats or more: `"enterprise"`

Then add an exported `monthlyPrice(subscription: Subscription): number` that prices a subscription from its band:

- `starter`: 25 per seat
- `growth`: 18 per seat
- `scale`: 14 per seat
- `enterprise`: 11 per seat

Annual subscriptions get 15% off the resulting total. Round the final price to the nearest whole number.

Leave `legacyMonthlyPrice` alone. The file must stay loadable by Node's TypeScript type-stripping, so do not introduce `enum`, `namespace`, parameter properties, or anything else that needs a compile step.
