import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { tokenStorage } from '../utils/tokenStorage';
import { cacheManager } from '../services/cacheManager';

const AuthContext = createContext(null);

export const USER_ROLES = {
  LOCATAIRE:  'LOCATAIRE',
  BAILLEUR:   'BAILLEUR',
  ARCHITECTE: 'ARCHITECTE',
  ADMIN:      'ADMIN',
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(tokenStorage.getUser());
  const [loading, setLoading] = useState(true);

  // Hydrate user from API on mount if a token exists
  useEffect(() => {
    if (!tokenStorage.isAuthenticated()) { setLoading(false); return; }
    authApi.me()
      .then(({ data }) => {
        setUser(data);
        tokenStorage.setTokens({ access: tokenStorage.getAccess(), refresh: tokenStorage.getRefresh(), user: data });
      })
      .catch(() => { tokenStorage.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    // SimpleJWT returns access + refresh; fetch /me/ to get user profile
    tokenStorage.setTokens({ access: data.access, refresh: data.refresh });
    const { data: profile } = await authApi.me();
    tokenStorage.setTokens({ access: data.access, refresh: data.refresh, user: profile });
    try {
      sessionStorage.setItem('piolo_just_logged_in', 'true');
      sessionStorage.removeItem('piolo_dashboard_bailleur_seen');
      sessionStorage.removeItem('piolo_dashboard_locataire_seen');
    } catch {}
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    cacheManager.clear();
    try {
      sessionStorage.removeItem('piolo_just_logged_in');
      sessionStorage.removeItem('piolo_dashboard_bailleur_seen');
      sessionStorage.removeItem('piolo_dashboard_locataire_seen');
    } catch {}
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data);
    tokenStorage.setTokens({ access: tokenStorage.getAccess(), refresh: tokenStorage.getRefresh(), user: data });
    return data;
  }, []);

  const establishSession = useCallback((data) => {
    tokenStorage.setTokens({
      access: data.access,
      refresh: data.refresh,
      user: data.user,
    });
    try {
      sessionStorage.setItem('piolo_just_logged_in', 'true');
      sessionStorage.removeItem('piolo_dashboard_bailleur_seen');
      sessionStorage.removeItem('piolo_dashboard_locataire_seen');
    } catch {}
    setUser(data.user);
  }, []);

  const isLocataire = user?.role === USER_ROLES.LOCATAIRE;
  const isBailleur  = user?.role === USER_ROLES.BAILLEUR;
  const isAdmin     = user?.role === USER_ROLES.ADMIN;

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, refreshUser, establishSession,
      isLocataire, isBailleur, isAdmin,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
};
