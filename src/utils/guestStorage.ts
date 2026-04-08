/**
 * Guest join storage — persists guest participation info in localStorage
 * so that when an unauthenticated user creates an account, their guest
 * participant records can be claimed (linked to the new user_id).
 */

const GUEST_JOINS_KEY = 'rollout_guest_joins';
const GUEST_REDIRECT_KEY = 'rollout_guest_redirect';

export interface GuestJoinRecord {
  participantId: string;
  rideId: string;
  guestName: string;
  joinedAt: string; // ISO timestamp
}

/** Save a guest join to localStorage */
export function saveGuestJoin(record: GuestJoinRecord): void {
  const existing = getGuestJoins();
  // Avoid duplicates by ride
  const filtered = existing.filter((r) => r.rideId !== record.rideId);
  filtered.push(record);
  localStorage.setItem(GUEST_JOINS_KEY, JSON.stringify(filtered));
}

/** Get all saved guest joins */
export function getGuestJoins(): GuestJoinRecord[] {
  try {
    const raw = localStorage.getItem(GUEST_JOINS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GuestJoinRecord[];
  } catch {
    return [];
  }
}

/** Clear all guest joins (after they've been claimed) */
export function clearGuestJoins(): void {
  localStorage.removeItem(GUEST_JOINS_KEY);
}

/** Save the ride ID a guest should be redirected to after signup */
export function saveGuestRedirect(rideId: string): void {
  localStorage.setItem(GUEST_REDIRECT_KEY, rideId);
}

/** Get and clear the guest redirect ride ID */
export function popGuestRedirect(): string | null {
  const rideId = localStorage.getItem(GUEST_REDIRECT_KEY);
  if (rideId) {
    localStorage.removeItem(GUEST_REDIRECT_KEY);
  }
  return rideId;
}
