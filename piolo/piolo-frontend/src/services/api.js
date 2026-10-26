// ══════════════════════════════════════════════════════════════════════════════
// src/services/api.js  — Client Axios + intercepteurs JWT automatiques
// ══════════════════════════════════════════════════════════════════════════════

import axios from 'axios';
import { cacheManager } from './cacheManager';

export const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,  // 30 s pour les requêtes normales
});

// ── Intercepteur de mutation : Invalidation automatique du cache ─────────────
const invalidateCacheForMutation = (url = '', method = '') => {
  const m = method.toLowerCase();
  if (!['post', 'put', 'patch', 'delete'].includes(m)) return;

  if (url.includes('/properties/')) {
    cacheManager.invalidate('bailleur_dashboard');
    cacheManager.invalidate('locataire_dashboard');
    cacheManager.invalidate('home_properties_');
    cacheManager.invalidate('properties_list_');
    cacheManager.invalidate('property_detail_');
    cacheManager.invalidate('discovery_');
  }
  if (url.includes('/visite') || url.includes('/visits/')) {
    cacheManager.invalidate('visits_list_');
    cacheManager.invalidate('locataire_dashboard');
    cacheManager.invalidate('bailleur_dashboard');
  }
  if (url.includes('/location') || url.includes('/candidature') || url.includes('/bookings/')) {
    cacheManager.invalidate('locations_list_');
    cacheManager.invalidate('locataire_dashboard');
    cacheManager.invalidate('bailleur_dashboard');
  }
  if (url.includes('/professionals/') || url.includes('/projects/')) {
    cacheManager.invalidate('pro_dashboard_');
  }
  if (url.includes('/notifications/')) {
    cacheManager.invalidate('notifications_');
  }
};

// ── Injecter le token JWT à chaque requête ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('piolo_access');
    if (access) config.headers.Authorization = `Bearer ${access}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Refresh automatique si le token est expiré (401) ─────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ── Helper pour requête GET avec cache SWR automatique ───────────────────────
api.cachedGet = async (url, config = {}, ttlMs = 120000) => {
  const cacheKey = `http_get_${url}_${JSON.stringify(config.params || {})}`;
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    // Déclencher un rafraîchissement silencieux en arrière-plan
    api.get(url, config).then(res => {
      cacheManager.set(cacheKey, res.data, ttlMs);
    }).catch(() => {});
    return { data: cached, fromCache: true };
  }
  const res = await api.get(url, config);
  cacheManager.set(cacheKey, res.data, ttlMs);
  return res;
};

// ── Intercepteur de réponse avec invalidation intelligente ───────────────────
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    if (config?.url && config?.method) {
      invalidateCacheForMutation(config.url, config.method);
    }
    return response;
  },
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { orig.headers.Authorization = `Bearer ${token}`; return api(orig); })
          .catch((err) => Promise.reject(err));
      }
      orig._retry  = true;
      isRefreshing = true;

      const refresh = localStorage.getItem('piolo_refresh');
      if (!refresh) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('piolo_access',  data.access);
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        orig.headers.Authorization = `Bearer ${data.access}`;
        return api(orig);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Services Auth ────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data) => api.post('/auth/login/', data),
  register:       (data) => api.post('/auth/register/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  verifyResetToken: (uid, token) => api.get(`/auth/reset-password/verify/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`),
  confirmResetPassword: (data) => api.post('/auth/reset-password/confirm/', data),
  socialExchange: (code) => api.post('/auth/social/exchange/', { code }),
  socialStatus:   (provider) => api.get(`/auth/social/status/?provider=${encodeURIComponent(provider)}`),
  setRole:        (role) => api.post('/auth/role/', { role }),
  me:             ()     => api.get('/auth/me/'),
  refresh:        (r)    => api.post('/auth/token/refresh/', { refresh: r }),
};

// ── Services Propriétés ──────────────────────────────────────────────────────
export const propertiesApi = {
  list:      (params) => api.get('/properties/', { params }),
  detail:    (id)     => api.get(`/properties/${id}/`),
  create:    (data)   => api.post('/properties/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data) => api.patch(`/properties/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (propertyId, imageId) => api.delete(`/properties/${propertyId}/images/${imageId}/`),
  toggleFavorite: (id) => api.post(`/properties/${id}/favorite/`),
  favorites: () => api.get('/properties/favorites/'),
  alerts: () => api.get('/properties/alerts/'),
  createAlert: (data) => api.post('/properties/alerts/', data),
  deleteAlert: (id) => api.delete(`/properties/alerts/${id}/`),
  alertResults: (id) => api.get(`/properties/alerts/${id}/results/`),
  discovery: (params) => api.get('/properties/discovery/', { params }),
  archive: (id) => api.post(`/properties/${id}/archive/`),
  uploadVideoReel: (id, formData, onUploadProgress) => api.post(
    `/properties/${id}/video-reel/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000,      // 10 min — vidéos 2 min HD/4K sur connexion lente
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress,     // callback optionnel pour afficher la progression
    }
  ),
  createTourScene: (id, formData) => api.post(`/properties/${id}/tour/scenes/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  stitchTourScene: (id, formData, onUploadProgress) => api.post(
    `/properties/${id}/tour/stitch/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
      onUploadProgress,
    }
  ),
  deleteTourScene: (id, sceneId) => api.delete(`/properties/${id}/tour/scenes/${sceneId}/`),
  createTourHotspot: (id, data) => api.post(`/properties/${id}/tour/hotspots/`, data),
  estimateRent: (data) => api.post('/properties/estimate-rent/', data),
};

// ── Services Messagerie ──────────────────────────────────────────────────────
export const messagesApi = {
  list:   () => api.get('/messages/'),
  start:  (propertyId) => api.post(`/messages/start/${propertyId}/`),
  detail: (convId) => api.get(`/messages/${convId}/`),
  send:   (convId, formData) => api.post(`/messages/${convId}/send/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  poll:   (convId, lastId) => api.get(`/messages/${convId}/poll/?last_id=${lastId}`),
  delete: (msgId, type = 'everyone') => api.post(`/messages/msg/${msgId}/delete/`, { type }),
};

// ── Services Notifications ────────────────────────────────────────────────
export const notificationsApi = {
  list:       (params = {}) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/unread-count/'),
  markRead:   (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
  archive:    (id) => api.post(`/notifications/${id}/archive/`),
};

// ── Services Professionnels & Chantiers Réels (BDD Django) ────────────────────
export const professionalsApi = {
  list: (params = {}) => api.get('/auth/professionals/', { params }),
  detail: (id) => api.get(`/auth/professionals/${id}/`),
  me: () => api.get('/auth/professionals/me/'),
  updateProfile: (data) => api.post('/auth/professionals/me/', data),
  projects: (params = {}) => api.get('/auth/professionals/projects/', { params }),
  createProject: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/auth/professionals/projects/', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
  },
  deleteProject: (id) => api.delete(`/auth/professionals/projects/${id}/`),
  reviews: (proId) => api.get(`/auth/professionals/${proId}/reviews/`),
  createReview: (proId, data) => api.post(`/auth/professionals/${proId}/reviews/`, data),
  quotes: () => api.get('/auth/professionals/quotes/'),
  createQuote: (proId, data) => api.post(`/auth/professionals/${proId}/quotes/`, data),
  toggleProjectLike: (projectId) => api.post(`/auth/professionals/projects/${projectId}/like/`),
};

// ── Services Réservations Court Séjour & Planning ─────────────────────────────
export const bookingsApi = {
  list: (params = {}) => api.get('/properties/requests/bookings/', { params }),
  detail: (id) => api.get(`/properties/bookings/${id}/`),
  action: (id, actionName, hostNote = '') => api.patch(`/properties/bookings/${id}/`, { action: actionName, host_note: hostNote }),
  delete: (id) => api.delete(`/properties/bookings/${id}/`),
  book: (propertyId, data) => api.post(`/properties/${propertyId}/book/`, data),
  blockDates: (propertyId, data) => api.post(`/properties/${propertyId}/block-dates/`, data),
  unblockDate: (propertyId, date) => api.post(`/properties/${propertyId}/unblock-date/`, { date }),
};

export default api;
