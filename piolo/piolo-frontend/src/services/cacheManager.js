// ══════════════════════════════════════════════════════════════════════════════
// src/services/cacheManager.js — Cache Client Haute Performance (SWR / 0ms)
// ══════════════════════════════════════════════════════════════════════════════

const memoryCache = new Map();

/**
 * Gestionnaire de cache mémoire + sessionStorage pour un affichage instantané (0ms)
 * selon le pattern Stale-While-Revalidate (SWR).
 */
export const cacheManager = {
  /**
   * Récupère une valeur du cache si elle est encore valide (TTL non expiré).
   * @param {string} key - Clé unique de la ressource.
   * @returns {any|null}
   */
  get(key) {
    if (!key) return null;
    
    // 1. Vérification en mémoire vive (0 milliseconde)
    const memItem = memoryCache.get(key);
    if (memItem) {
      if (memItem.expiresAt > Date.now()) {
        return memItem.data;
      }
      memoryCache.delete(key);
    }

    // 2. Fallback sessionStorage (persistant entre navigations d'onglets de la même session)
    try {
      const raw = sessionStorage.getItem(`piolo_cache_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt > Date.now()) {
          memoryCache.set(key, parsed);
          return parsed.data;
        }
        sessionStorage.removeItem(`piolo_cache_${key}`);
      }
    } catch {
      // Ignorer les erreurs d'analyse JSON ou de quotas de stockage
    }

    return null;
  },

  /**
   * Enregistre une valeur dans le cache avec une durée de vie (TTL).
   * @param {string} key - Clé unique.
   * @param {any} data - Données à stocker.
   * @param {number} ttlMs - Durée de validité en millisecondes (défaut : 2 minutes).
   */
  set(key, data, ttlMs = 120000) {
    if (!key || data === undefined) return;
    
    const entry = {
      data,
      expiresAt: Date.now() + ttlMs,
      timestamp: Date.now()
    };

    memoryCache.set(key, entry);

    try {
      sessionStorage.setItem(`piolo_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Quota de sessionStorage dépassé ou données non-sérialisables : mémoire seule
    }
  },

  /**
   * Invalide une clé spécifique ou toutes les clés commençant par un préfixe.
   * @param {string} keyOrPrefix - Clé ou préfixe (ex: 'bailleur_dashboard').
   */
  invalidate(keyOrPrefix) {
    if (!keyOrPrefix) return;

    // Suppression mémoire
    for (const k of memoryCache.keys()) {
      if (k === keyOrPrefix || k.startsWith(keyOrPrefix)) {
        memoryCache.delete(k);
      }
    }

    // Suppression sessionStorage
    try {
      const targetPrefix = `piolo_cache_${keyOrPrefix}`;
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k === targetPrefix || k.startsWith(targetPrefix))) {
          toRemove.push(k);
        }
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    } catch {
      // Ignorer
    }
  },

  /**
   * Vide l'intégralité du cache applicatif (utilisé lors de la déconnexion).
   */
  clear() {
    memoryCache.clear();
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('piolo_cache_')) {
          toRemove.push(k);
        }
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    } catch {
      // Ignorer
    }
  },

  /**
   * Exécute une requête avec stratégie Stale-While-Revalidate (SWR) :
   * - Si des données sont en cache, appelle immédiatement `onSuccess(cachedData, true)` (0ms)
   * - Lance la requête réseau en tâche de fond
   * - Met à jour le cache et appelle `onSuccess(freshData, false)` dès réception
   */
  async swrFetch(key, fetchFn, { ttl = 120000, onSuccess, onError, onFinally } = {}) {
    const cached = this.get(key);
    if (cached !== null && onSuccess) {
      onSuccess(cached, true);
    }

    try {
      const freshData = await fetchFn();
      this.set(key, freshData, ttl);
      if (onSuccess) {
        onSuccess(freshData, false);
      }
      return freshData;
    } catch (err) {
      if (onError) onError(err);
      if (cached !== null) return cached;
      throw err;
    } finally {
      if (onFinally) onFinally();
    }
  }
};

export default cacheManager;
