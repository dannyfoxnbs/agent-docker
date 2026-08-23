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
  return "growth";
}
