import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { seatBand, monthlyPrice, legacyMonthlyPrice } = await import(pathToFileURL(resolve(process.cwd(), "src/pricing.ts")).href);

assert.equal(typeof monthlyPrice, "function", "monthlyPrice must be exported");

for (const [seats, band] of [[1, "starter"], [5, "starter"], [6, "growth"], [20, "growth"], [21, "scale"], [100, "scale"], [101, "enterprise"], [5000, "enterprise"]]) {
  assert.equal(seatBand(seats), band, `seatBand(${seats})`);
}

for (const [seats, annual, expected] of [
  [3, false, 75],
  [3, true, 64],
  [10, false, 180],
  [50, false, 700],
  [50, true, 595],
  [200, false, 2200],
  [200, true, 1870],
]) {
  assert.equal(
    monthlyPrice({ seats, annual }),
    expected,
    `monthlyPrice({ seats: ${seats}, annual: ${annual} })`,
  );
}

assert.equal(legacyMonthlyPrice({ seats: 4, annual: false }), 100, "legacyMonthlyPrice unchanged");
assert.equal(legacyMonthlyPrice({ seats: 20, annual: false }), 360, "legacyMonthlyPrice unchanged");
