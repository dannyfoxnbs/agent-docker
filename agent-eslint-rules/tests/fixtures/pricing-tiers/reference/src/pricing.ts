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

const STARTER_MAX_SEATS = 5;
const GROWTH_MAX_SEATS = 20;
const SCALE_MAX_SEATS = 100;

const PRICE_PER_SEAT: Record<string, number> = {
  starter: 25,
  growth: 18,
  scale: 14,
  enterprise: 11,
};

const ANNUAL_MULTIPLIER = 0.85;

export function seatBand(seats: number): string {
  if (seats <= STARTER_MAX_SEATS) {
    return "starter";
  }
  if (seats <= GROWTH_MAX_SEATS) {
    return "growth";
  }
  if (seats <= SCALE_MAX_SEATS) {
    return "scale";
  }
  return "enterprise";
}

export function monthlyPrice(subscription: Subscription): number {
  const total = subscription.seats * PRICE_PER_SEAT[seatBand(subscription.seats)];
  return Math.round(subscription.annual ? total * ANNUAL_MULTIPLIER : total);
}
