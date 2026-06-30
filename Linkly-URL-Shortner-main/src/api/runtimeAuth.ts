let authToken: string | null = null;
let guestId: string | null = null;

const STORAGE_KEYS = {
  authToken: 'linkly.auth.token',
  guestId: 'linkly.guest.id',
} as const;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getRuntimeAuthToken(): string | null {
  if (!authToken && canUseStorage()) {
    authToken = window.localStorage.getItem(STORAGE_KEYS.authToken);
  }
  return authToken;
}

export function setRuntimeAuthToken(token: string | null): void {
  authToken = token;

  if (!canUseStorage()) {
    return;
  }

  if (!token) {
    window.localStorage.removeItem(STORAGE_KEYS.authToken);
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.authToken, token);
}

export function getRuntimeGuestId(): string {
  if (!guestId && canUseStorage()) {
    guestId = window.localStorage.getItem(STORAGE_KEYS.guestId);
  }

  if (!guestId) {
    guestId = `guest:${crypto.randomUUID()}`;
    if (canUseStorage()) {
      window.localStorage.setItem(STORAGE_KEYS.guestId, guestId);
    }
  }
  return guestId;
}
