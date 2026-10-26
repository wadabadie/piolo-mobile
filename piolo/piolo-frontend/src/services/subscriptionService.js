import api from './api';

/**
 * Service centralisé de gestion des abonnements et points pour Locataires, Bailleurs et Professionnels
 */

/**
 * Grille Officielle des Coûts en Points par Action — Locataires
 */
export const POINT_COSTS = {
  CONTACT_LANDLORD: { key: 'CONTACT_LANDLORD', points: 8, label: 'Contact Direct & WhatsApp Bailleur', desc: 'Débloque le numéro vérifié et WhatsApp direct du propriétaire' },
  SHORT_STAY_BOOKING: { key: 'SHORT_STAY_BOOKING', points: 8, label: 'Réservation Court Séjour & Contact Hôte', desc: 'Blocage des dates et transmission directe de votre réservation à l’hôte' },
  RENTAL_APPLICATION: { key: 'RENTAL_APPLICATION', points: 6, label: 'Demande de Location Prioritaire', desc: 'Dossier certifié placé en tête de liste auprès du bailleur' },
  PHYSICAL_VISIT: { key: 'PHYSICAL_VISIT', points: 5, label: 'Demande de Visite Physique', desc: 'Planification d’un créneau de visite sur place' },
  PROPERTY_GPS_ROUTE: { key: 'PROPERTY_GPS_ROUTE', points: 4, label: 'Itinéraire & Localisation GPS Logement', desc: 'Position exacte et guidage Google Maps / Waze vers le bien' },
  PRO_QUOTE_REQUEST: { key: 'PRO_QUOTE_REQUEST', points: 4, label: 'Demande de Devis Détaillé Artisan', desc: 'Chiffrage et cahier des charges travaux / aménagement' },
  VIRTUAL_TOUR_360: { key: 'VIRTUAL_TOUR_360', points: 3, label: 'Visite Virtuelle 360° Immersive', desc: 'Exploration 3D interactive et haute définition de toutes les pièces' },
  CONTACT_PRO: { key: 'CONTACT_PRO', points: 3, label: 'Contact Artisan / Architecte Certifié', desc: 'Coordonnées directes d’un professionnel vérifié' },
  PRO_GPS_ROUTE: { key: 'PRO_GPS_ROUTE', points: 2, label: 'Itinéraire Atelier / Bureau Pro', desc: 'Guidage GPS vers les locaux du professionnel' },
};

/**
 * Grille Officielle des Coûts en Points par Action — Bailleurs (Propriétaires & Gestionnaires)
 */
export const LANDLORD_POINT_COSTS = {
  // 0. Publication & Mise en Ligne de Logements
  PROPERTY_PUBLISH: { key: 'PROPERTY_PUBLISH', points: 20, label: 'Publication d’Annonce Immobilière', desc: 'Mise en ligne certifiée, diffusion multi-plateformes et alertes locataires ciblées' },

  // 1. Visibilité & Boosts d'Annonces
  BOOST_FLASH_48H: { key: 'BOOST_FLASH_48H', points: 15, label: 'Boost Flash 48h (Urgence Relocation)', desc: 'Propulsion immédiate en Top 1 des résultats + Mode Découverte avec badge doré' },
  BOOST_VEDETTE_7D: { key: 'BOOST_VEDETTE_7D', points: 35, label: 'Boost Vedette 7 Jours', desc: 'Maintien en tête de liste 7 jours + alerte ciblée aux locataires actifs' },
  BOOST_SERENITE_30D: { key: 'BOOST_SERENITE_30D', points: 90, label: 'Multi-Boost Sérénité 30 Jours', desc: 'Visibilité maximale pendant 1 mois complet avec alertes automatiques' },
  
  // 2. Création de Contenu Immersif (Studio Reel & 360°)
  STUDIO_REEL_EXPORT: { key: 'STUDIO_REEL_EXPORT', points: 6, label: 'Export & Encodage Studio Reel Pro', desc: 'Traitement vidéo, étalonnage colorimétrique et badges certifiés' },
  VIRTUAL_TOUR_CREATION: { key: 'VIRTUAL_TOUR_CREATION', points: 10, label: 'Création & Hébergement Visite 360°', desc: 'Assemblage interactif multi-pièces et navigation 3D haute fidélité' },
  
  // 3. Outils Prédictifs & Intelligence Artificielle (IA)
  RENT_AI_ESTIMATE_REPORT: { key: 'RENT_AI_ESTIMATE_REPORT', points: 4, label: 'Rapport d’Estimation de Loyer IA', desc: 'Calcul prédictif multi-facteurs, benchmarks loyers quartier et valorisation' },
  AI_SMART_CAPTION: { key: 'AI_SMART_CAPTION', points: 2, label: 'Génération d’Accroches & Légendes IA', desc: 'Rédaction optimisée à fort taux de conversion pour annonces et reels' },
  
  // 4. Sélection des Candidats & Sécurisation des Revenus
  UNBLOCK_TENANT_FILE: { key: 'UNBLOCK_TENANT_FILE', points: 8, label: 'Déblocage Dossier Solvabilité Certifié', desc: 'Accès aux pièces d’identité certifiées, fiches de paie et garanties du locataire' },
  CONTACT_VERIFIED_TENANT: { key: 'CONTACT_VERIFIED_TENANT', points: 5, label: 'Mise en Relation Directe Candidat', desc: 'Messagerie prioritaire et coordonnées WhatsApp d’un locataire sérieux' },
  
  // 5. Gestion Administrative & Documents Conformes
  GENERATE_OHADA_LEASE: { key: 'GENERATE_OHADA_LEASE', points: 6, label: 'Génération Bail Numérique OHADA', desc: 'Contrat conforme loi camerounaise avec état des lieux contradictoire' },
  RENT_RECEIPT_CERTIFIED: { key: 'RENT_RECEIPT_CERTIFIED', points: 2, label: 'Émission Quittance Certifiée QR Code', desc: 'Quittance numérique officielle avec signature et horodatage sécurisé' },
  PRO_QUOTE_DISPATCH: { key: 'PRO_QUOTE_DISPATCH', points: 4, label: 'Demande d’Intervention Artisan / Pro', desc: 'Mise en relation avec un artisan certifié pour entretien ou rénovation' },
};

export const subscriptionService = {
  POINT_COSTS,
  LANDLORD_POINT_COSTS,

  // ── Locataire ──
  getTenantPoints: (userId) => {
    const key = `piolo_tenant_points_${userId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) return parseInt(saved, 10) || 0;
    localStorage.setItem(key, '20'); // 20 points de bienvenue
    return 20;
  },

  setTenantPoints: (userId, points) => {
    localStorage.setItem(`piolo_tenant_points_${userId || 'default'}`, points.toString());
    try {
      window.dispatchEvent(new CustomEvent('piolo_points_updated', { detail: { userId, points } }));
    } catch {
      // ignore in non-browser env
    }
  },

  addTenantPoints: (userId, amount) => {
    const current = subscriptionService.getTenantPoints(userId);
    const updated = current + amount;
    subscriptionService.setTenantPoints(userId, updated);
    return updated;
  },

  deductTenantPoints: (userId, actionKey, isVip = false) => {
    if (isVip) {
      // Synchroniser avec backend en arrière-plan
      api.post('/auth/subscriptions/deduct-points/', { action_key: actionKey }).catch(() => {});
      return { success: true, pointsDeducted: 0, newBalance: subscriptionService.getTenantPoints(userId), isVipFree: true };
    }
    const costConfig = POINT_COSTS[actionKey] || { points: 5 };
    const current = subscriptionService.getTenantPoints(userId);
    if (current < costConfig.points) {
      return { success: false, required: costConfig.points, current, missing: costConfig.points - current };
    }
    const updated = Math.max(0, current - costConfig.points);
    subscriptionService.setTenantPoints(userId, updated);
    
    // Déduire réellement sur le backend Django
    api.post('/auth/subscriptions/deduct-points/', { action_key: actionKey })
      .then((res) => {
        if (res.data?.new_balance !== undefined) {
          subscriptionService.setTenantPoints(userId, res.data.new_balance);
        }
      })
      .catch(() => {});

    return { success: true, pointsDeducted: costConfig.points, newBalance: updated, isVipFree: false };
  },

  getTenantPlan: (userId) => {
    const saved = localStorage.getItem(`piolo_tenant_plan_${userId || 'default'}`);
    return saved ? JSON.parse(saved) : null;
  },

  setTenantPlan: (userId, plan) => {
    localStorage.setItem(`piolo_tenant_plan_${userId || 'default'}`, JSON.stringify(plan));
  },

  // API Backend Sync
  fetchTenantSubscriptionStatus: async () => {
    try {
      const { data } = await api.get('/auth/subscriptions/current/');
      return data;
    } catch {
      return null;
    }
  },

  subscribeTenantPlan: async ({ plan_type, billing_cycle, payment_method, phone_number }) => {
    try {
      const { data } = await api.post('/auth/subscriptions/subscribe/', {
        plan_type,
        billing_cycle,
        payment_method,
        phone_number
      });
      return data;
    } catch {
      return null;
    }
  },

  rechargeTenantPoints: async ({ points, payment_method, phone_number }) => {
    try {
      const { data } = await api.post('/auth/subscriptions/recharge-points/', {
        points,
        payment_method,
        phone_number
      });
      return data;
    } catch {
      return null;
    }
  },

  // ── Bailleur : Points & Abonnements ──
  getLandlordPoints: (userId) => {
    const key = `piolo_landlord_points_${userId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) return parseInt(saved, 10) || 0;
    localStorage.setItem(key, '45'); // 45 points de bienvenue
    return 45;
  },
  setLandlordPoints: (userId, points) => {
    localStorage.setItem(`piolo_landlord_points_${userId || 'default'}`, points.toString());
    try {
      window.dispatchEvent(new CustomEvent('piolo_landlord_points_updated', { detail: { userId, points } }));
    } catch {}
  },
  addLandlordPoints: (userId, amount) => {
    const current = subscriptionService.getLandlordPoints(userId);
    const updated = current + amount;
    subscriptionService.setLandlordPoints(userId, updated);
    return updated;
  },
  rechargeLandlordPoints: async ({ points, payment_method, phone_number, pack_label }) => {
    try {
      const { data } = await api.post('/auth/landlord/recharge-points/', {
        points,
        payment_method,
        phone_number,
        pack_label,
      });
      if (data?.new_balance !== undefined) {
        subscriptionService.setLandlordPoints(null, data.new_balance);
      }
      return data;
    } catch (err) {
      console.error('Error recharging landlord points:', err);
      return null;
    }
  },
  deductLandlordPoints: (userId, actionKey) => {
    const costConfig = LANDLORD_POINT_COSTS[actionKey] || { points: 5 };
    const current = subscriptionService.getLandlordPoints(userId);
    if (current < costConfig.points) {
      return { success: false, required: costConfig.points, current, missing: costConfig.points - current };
    }
    const updated = Math.max(0, current - costConfig.points);
    subscriptionService.setLandlordPoints(userId, updated);
    return { success: true, pointsDeducted: costConfig.points, newBalance: updated };
  },
  getLandlordPlan: (userId) => {
    const saved = localStorage.getItem(`piolo_landlord_plan_${userId || 'default'}`);
    return saved ? JSON.parse(saved) : { id: 'starter', name: 'Bailleur Essentiel', active: true };
  },
  setLandlordPlan: (userId, plan) => {
    localStorage.setItem(`piolo_landlord_plan_${userId || 'default'}`, JSON.stringify(plan));
    try {
      window.dispatchEvent(new CustomEvent('piolo_landlord_plan_updated', { detail: { userId, plan } }));
    } catch {}
  },

  // ── Bailleur & Global : Boosts d'Annonces ── API Réelles ──
  /**
   * Applique un boost via le backend (déduit les points du bailleur en base).
   * @param {string} propertyId  - UUID de l'annonce
   * @param {string} boostType   - 'flash_48h' | 'vedette_7j' | 'multiboost_30j'
   * @param {boolean} paymentConfirmed - true quand le paiement MoMo a été validé dans la modal
   * @returns {Promise<{ok, boost_type, expires_at, days, points_spent, new_balance}>}
   */
  applyPropertyBoost: async (propertyId, boostType = 'vedette_7j', paymentConfirmed = true) => {
    try {
      const { data } = await api.post(`/properties/boost/${propertyId}/`, {
        boost_type: boostType,
        payment_confirmed: paymentConfirmed,  // Simule confirmation paiement MoMo
      });

      // Mémoriser localement pour mise à jour immédiate de l'interface
      try {
        const boostsKey = 'piolo_active_boosts';
        const saved = JSON.parse(localStorage.getItem(boostsKey) || '{}');
        saved[String(propertyId)] = {
          boostType: data.boost_type || boostType,
          expiresAt: data.expires_at,
          active: true,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(boostsKey, JSON.stringify(saved));
      } catch {}

      // Propager l'événement pour rafraîchir tous les composants et dashboards
      try {
        window.dispatchEvent(new CustomEvent('piolo_boost_applied', {
          detail: { propertyId: String(propertyId), boostType: data.boost_type || boostType, expiresAt: data.expires_at }
        }));
      } catch {}
      return data;
    } catch (err) {
      const errData = err?.response?.data || {};
      // Remonter le message exact du backend (ex: "Points insuffisants. Il vous faut X pts")
      const errorMsg = errData.error || errData.detail || (typeof errData === 'string' ? errData : null) || 'Erreur lors de l\'activation du boost. Vérifiez votre connexion.';
      return { ok: false, error: errorMsg, ...errData };
    }
  },

  /**
   * Récupère la liste des boosts du bailleur connecté depuis le backend.
   */
  fetchMyBoosts: async () => {
    try {
      const { data } = await api.get('/properties/my-boosts/');
      return data?.results || [];
    } catch {
      return [];
    }
  },

  /**
   * Vérifie si une propriété est boostée (données serveur ou cache local).
   * Accepte indifféremment :
   *   - isPropertyBoosted(propertyObj)
   *   - isPropertyBoosted(userId, propertyId, propertyObj)
   *   - isPropertyBoosted(userId, propertyId)
   */
  isPropertyBoosted: (userIdOrProp, propertyId = null, propObj = null) => {
    const now = new Date();

    // Résoudre l'objet propriété s'il est passé en 1er, 2nd ou 3ème argument
    let prop = null;
    if (userIdOrProp && typeof userIdOrProp === 'object') {
      prop = userIdOrProp;
    } else if (propObj && typeof propObj === 'object') {
      prop = propObj;
    } else if (propertyId && typeof propertyId === 'object') {
      prop = propertyId;
    }

    const pId = prop?.id || (typeof propertyId === 'string' || typeof propertyId === 'number' ? String(propertyId) : (typeof userIdOrProp === 'string' || typeof userIdOrProp === 'number' ? String(userIdOrProp) : null));

    // 1ère priorité : données directes de l'objet (champs du serializer Django)
    if (prop) {
      if (prop.is_boosted) {
        if (prop.boost_expires_at) {
          const exp = new Date(prop.boost_expires_at);
          if (exp > now) {
            return {
              propertyId: String(prop.id || pId),
              boostType: prop.boost_type || 'vedette_7j',
              expiresAt: prop.boost_expires_at,
              active: true,
              fromServer: true,
            };
          }
        } else {
          return {
            propertyId: String(prop.id || pId),
            boostType: prop.boost_type || 'vedette_7j',
            active: true,
            fromServer: true,
          };
        }
      }
    }

    // 2ème priorité : cache local des boosts récents (mise à jour optimiste et temps réel)
    if (pId) {
      try {
        const saved = JSON.parse(localStorage.getItem('piolo_active_boosts') || '{}');
        const localBoost = saved[String(pId)];
        if (localBoost && localBoost.active) {
          if (localBoost.expiresAt) {
            const exp = new Date(localBoost.expiresAt);
            if (exp > now) {
              return {
                propertyId: String(pId),
                boostType: localBoost.boostType || 'vedette_7j',
                expiresAt: localBoost.expiresAt,
                active: true,
                fromCache: true,
              };
            }
          } else {
            return {
              propertyId: String(pId),
              boostType: localBoost.boostType || 'vedette_7j',
              active: true,
              fromCache: true,
            };
          }
        }
      } catch {}
    }

    return null;
  },

  getBoostScore: (prop) => {
    if (!prop) return 0;
    const boost = subscriptionService.isPropertyBoosted(prop) || (prop.is_boosted ? { boostType: prop.boost_type } : null);
    if (!boost) return 0;
    // Hiérarchie des boosts : Flash 48h (300) > Multi-Boost 30j (200) > Vedette 7j (100) > Boost standard (50)
    const type = boost.boostType || prop.boost_type;
    const scores = { flash_48h: 300, multiboost_30j: 200, vedette_7j: 100 };
    return scores[type] || 50;
  },

  sortPropertiesByBoost: (propertiesList) => {
    if (!Array.isArray(propertiesList)) return [];
    return [...propertiesList].sort((a, b) => {
      const scoreA = subscriptionService.getBoostScore(a);
      const scoreB = subscriptionService.getBoostScore(b);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // Si égalité de boost, plus récent en premier
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  },

  // Garde les méthodes localStorage pour la compatibilité descendante (points UI optimiste)
  getGlobalBoosts: () => ({}),
  getLandlordBoosts: () => ({}),

  // ── Bailleur : Gestion Déléguée & Conciergerie Clé en Main Piolo ──
  fetchConciergeMandates: async () => {
    try {
      const { data } = await api.get('/properties/concierge-mandates/');
      const mandates = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      // On met le cache à jour, mais la DB est la source de vérité
      localStorage.setItem('piolo_concierge_mandates', JSON.stringify(mandates));
      return mandates;
    } catch {
      // Fallback localStorage uniquement si le réseau est indisponible
      return subscriptionService.getConciergeRequests();
    }
  },

  getConciergeRequests: (userId) => {
    // ATTENTION : cette méthode est uniquement un FALLBACK hors-ligne.
    // La source de vérité est le backend via fetchConciergeMandates().
    // Ne jamais initialiser l'état React depuis cette méthode dans un navigateur neuf.
    const savedGlobal = localStorage.getItem('piolo_concierge_mandates');
    if (savedGlobal) {
      try {
        const parsed = JSON.parse(savedGlobal);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }

    const key = `piolo_concierge_requests_${userId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter(r => r.id !== 'CONC-2026-081') : [];
        if (filtered.length > 0) return filtered;
      } catch {}
    }

    if (userId) {
      const defSaved = localStorage.getItem('piolo_concierge_requests_default');
      if (defSaved) {
        try {
          const parsed = JSON.parse(defSaved);
          const filtered = Array.isArray(parsed) ? parsed.filter(r => r.id !== 'CONC-2026-081') : [];
          if (filtered.length > 0) return filtered;
        } catch {}
      }
    }

    return [];
  },

  submitConciergeRequest: async (userId, requestData) => {
    // 1. Sauvegarde optimiste immédiate en local
    const requests = subscriptionService.getConciergeRequests(userId);
    const newId = `CONC-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const optimisticReq = {
      id: newId,
      propertyTitle: requestData.propertyTitle || 'Logement Clé en Main',
      property_title: requestData.propertyTitle || 'Logement Clé en Main',
      city: requestData.city || 'Douala',
      neighborhood: requestData.neighborhood || 'Bonapriso',
      packageName: requestData.packageName || 'Gestion Déléguée Intégrale Piolo Signature',
      package_name: requestData.packageName || 'Gestion Déléguée Intégrale Piolo Signature',
      packageType: requestData.packageType || 'full_management',
      package_type: requestData.packageType || 'full_management',
      price: requestData.price || 19000,
      createdDate: 'Aujourd’hui',
      status: 'SHOOTING_PLANNED',
      statusLabel: 'Équipe technique planifiée',
      status_label: 'Équipe technique planifiée',
      progressPercent: 25,
      progress_percent: 25,
      visitsConducted: 0,
      visits_conducted: 0,
      qualifiedCandidates: 0,
      qualified_candidates: 0,
      leadAgent: 'Équipe Logistique Piolo',
      assignedAgent: 'Équipe Logistique Piolo',
      assignedAgentPhone: '+237 658 32 42 85',
      ...requestData
    };
    
    const updated = [optimisticReq, ...requests.filter(r => r.id !== newId)];
    localStorage.setItem('piolo_concierge_mandates', JSON.stringify(updated));
    localStorage.setItem(`piolo_concierge_requests_${userId || 'default'}`, JSON.stringify(updated));
    localStorage.setItem('piolo_concierge_requests_default', JSON.stringify(updated));

    try {
      window.dispatchEvent(new CustomEvent('piolo_concierge_created', { detail: { userId, request: optimisticReq } }));
    } catch {}

    // 2. Persistance réelle sur le backend Django PostgreSQL / SQLite
    try {
      const { data } = await api.post('/properties/concierge-mandates/', requestData);
      if (data && data.id) {
        const finalMandates = [data, ...requests.filter(r => r.id !== data.id && r.id !== newId)];
        localStorage.setItem('piolo_concierge_mandates', JSON.stringify(finalMandates));
        localStorage.setItem(`piolo_concierge_requests_${userId || 'default'}`, JSON.stringify(finalMandates));
        try {
          window.dispatchEvent(new CustomEvent('piolo_concierge_created', { detail: { userId, request: data } }));
        } catch {}
        return data;
      }
    } catch (err) {
      console.warn("Persistance backend mandat en attente de reconnexion:", err);
    }

    return optimisticReq;
  }
};


