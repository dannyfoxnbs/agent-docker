export interface Subscription {
  seats: number;
  annual: boolean;
}

// Legacy pricing kept for accounts that have not migrated yet.
// Do not change these numbers without finance sign-off.
export function legacyMonthlyPrice(subscription: Subscription): number {
  const perSeat = subscription.seats > 10 ? 18 : 25;
  return subscription.seats * perSeat;
}

export function seatBand(seats: number): string {
  if (seats <= 5) {
    return "starter";
  }
  if (seats <= 20) {
    return "growth";
  }
  if (seats <= 100) {
    return "scale";
  }
  return "enterprise";
}

// Prices a subscription from its seat band, with 15% off for annual.
export function monthlyPrice(subscription: Subscription): number {
  const band = seatBand(subscription.seats);
  let perSeat = 11;
  if (band === "starter") {
    perSeat = 25;
  } else if (band === "growth") {
    perSeat = 18;
  } else if (band === "scale") {
    perSeat = 14;
  }

  const total = subscription.seats * perSeat;
  return Math.round(subscription.annual ? total * 0.85 : total);
}
