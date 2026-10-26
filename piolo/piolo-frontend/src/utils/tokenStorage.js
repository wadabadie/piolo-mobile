// src/utils/tokenStorage.js
const KEYS = { access: 'piolo_access', refresh: 'piolo_refresh', user: 'piolo_user' };

export const tokenStorage = {
  setTokens({ access, refresh, user }) {
    localStorage.setItem(KEYS.access, access);
    if (refresh) localStorage.setItem(KEYS.refresh, refresh);
    if (user)    localStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  getAccess:       () => localStorage.getItem(KEYS.access),
  getRefresh:      () => localStorage.getItem(KEYS.refresh),
  getUser:         () => { try { return JSON.parse(localStorage.getItem(KEYS.user)); } catch { return null; } },
  clear:           () => Object.values(KEYS).forEach((k) => localStorage.removeItem(k)),
  isAuthenticated: () => !!localStorage.getItem(KEYS.access),
};
