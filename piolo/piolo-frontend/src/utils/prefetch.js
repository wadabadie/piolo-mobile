// src/utils/prefetch.js
import api from '../services/api';
import { cacheManager } from '../services/cacheManager';

const prefetchedRoutes = new Set();
const prefetchedApis = new Set();

/**
 * Précharge un composant React (chunk JS/CSS) en arrière-plan
 * @param {Function} importFn - Fonction d'import dynamique ex: () => import('./pages/PropertyDetail')
 */
export function prefetchRoute(importFn) {
  if (typeof importFn !== 'function') return;
  const key = importFn.toString();
  if (prefetchedRoutes.has(key)) return;
  prefetchedRoutes.add(key);

  // Utilise requestIdleCallback si disponible pour ne jamais impacter le thread principal
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importFn().catch(() => {});
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      importFn().catch(() => {});
    }, 100);
  }
}

/**
 * Précharge les données d'un bien immobilier dans le cache mémoire
 * @param {string|number} propertyId 
 */
export function prefetchProperty(propertyId) {
  if (!propertyId) return;
  const cacheKey = `property_detail_${propertyId}`;
  if (cacheManager.get(cacheKey) || prefetchedApis.has(cacheKey)) return;

  prefetchedApis.add(cacheKey);

  const fetcher = async () => {
    try {
      const res = await api.get(`/properties/${propertyId}/`);
      if (res.data) {
        cacheManager.set(cacheKey, res.data, 180000); // 3 minutes de cache chaud
      }
    } catch (e) {
      // Échec silencieux, aucune gêne pour l'utilisateur
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fetcher, { timeout: 1500 });
  } else {
    setTimeout(fetcher, 50);
  }
}

/**
 * Précharge une route API générique dans le cache
 * @param {string} endpoint 
 * @param {number} ttlMs 
 */
export function prefetchApi(endpoint, ttlMs = 120000) {
  if (!endpoint) return;
  const cacheKey = `api_cache_${endpoint}`;
  if (cacheManager.get(cacheKey) || prefetchedApis.has(cacheKey)) return;

  prefetchedApis.add(cacheKey);

  const fetcher = async () => {
    try {
      const res = await api.get(endpoint);
      if (res.data) {
        cacheManager.set(cacheKey, res.data, ttlMs);
      }
    } catch (e) {
      // Ignoré
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fetcher, { timeout: 2000 });
  } else {
    setTimeout(fetcher, 100);
  }
}
