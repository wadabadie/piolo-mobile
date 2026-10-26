/**
 * Service de gestion et synchronisation des Projets Professionnels & Artisans
 * Permet de synchroniser les projets et profils créés sur l'ensemble de la plateforme (Dashboard Pro, Annuaire Public, Dashboard Locataire/Bailleur)
 */

const STORAGE_KEY = 'piolo_all_published_pro_projects';
const PROS_STORAGE_KEY = 'piolo_all_registered_pros';
const USER_POINTS_PREFIX = 'piolo_pro_points_';

// Liste des professionnels initiaux certifiés
export const DEFAULT_PROFESSIONALS = [
  {
    id: 1,
    name: "Emmanuel Kouam",
    initials: "EK",
    avatarBg: "linear-gradient(135deg, #D4AF37, #AA820A)",
    cover: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
    availText: "Disponible maintenant",
    availColor: "#27AE60",
    city: "Bastos, Yaoundé",
    title: "Architecte d'intérieur & Rénovation",
    specialty: "Architecte d'intérieur & Rénovation",
    category: "mobilier",
    rating: 4.9,
    reviewsCount: 38,
    projectsCount: 12,
    experience: "8 ans",
    pointsRequired: "2 pts",
    verified: true,
    tags: ["Rénovation", "Design int.", "Plans 3D"],
    specialities: ["Meubles TV & Salons", "Dressings sur-mesure", "Bois Massif & Résine"],
    phone: "+237699001122",
    whatsapp: "+237699001122",
    bio: "Spécialiste de la conception et fabrication de mobilier haut de gamme, cuisines équipées sur-mesure et rénovations complètes de résidences au Cameroun.",
    projects: [
      {
        title: "Meuble TV Mural Flottant & Éclairage LED",
        place: "Bastos, Yaoundé",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        description: "Transformation complète d'un mur brut de salon en ensemble mural design en bois d'Iroko avec niches et rubans LED intégrés."
      },
      {
        title: "Cuisine Îlot Marbre & Spots Encastrés",
        place: "Santa Barbara, Yaoundé",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
        description: "Conception et pose d'une cuisine américaine contemporaine avec îlot central en marbre et rangements amortis."
      }
    ]
  },
  {
    id: 2,
    name: "Ange Beyala",
    initials: "AB",
    avatarBg: "linear-gradient(135deg, #2C3E7A, #4A6FA5)",
    cover: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
    availText: "Disponible cette semaine",
    availColor: "#27AE60",
    city: "Bonapriso, Douala",
    title: "Architecte & Chef de Projet BTP",
    specialty: "Architecte & Chef de Projet BTP",
    category: "architecture",
    rating: 4.7,
    reviewsCount: 52,
    projectsCount: 27,
    experience: "12 ans",
    pointsRequired: "2 pts",
    verified: true,
    tags: ["Construction", "Supervision", "Béton armé"],
    specialities: ["Conception Villa Modernes", "Permis de Construire", "Plans 3D / VR"],
    phone: "+237677889900",
    whatsapp: "+237677889900",
    bio: "Architecte concepteur DPLG, délivrance de plans 3D certifiés, permis de bâtir et direction complète de chantiers à Douala et Yaoundé.",
    projects: [
      {
        title: "Villa Duplex Moderne R+1",
        place: "Bonamoussadi, Douala",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        description: "Conception intégrale des plans 3D, dossier permis de construire et suivi gros-œuvre pour une villa de standing 4 chambres."
      },
      {
        title: "Immeuble R+4 Résidentiel",
        place: "Akwa, Douala",
        image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
        description: "Calculs de structures béton armé et coordination des corps d'état secondaires pour un immeuble de 8 appartements de standing."
      }
    ]
  },
  {
    id: 3,
    name: "Martin Nkodo",
    initials: "MN",
    avatarBg: "linear-gradient(135deg, #1E7A47, #27AE60)",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    availText: "Sur rendez-vous",
    availColor: "#D4AF37",
    city: "Bonanjo, Douala",
    title: "Entrepreneur BTP, Carrelage & Finitions",
    specialty: "Entrepreneur BTP, Carrelage & Finitions",
    category: "plomberie",
    rating: 4.5,
    reviewsCount: 21,
    projectsCount: 18,
    experience: "6 ans",
    pointsRequired: "2 pts",
    verified: true,
    tags: ["Carrelage", "Peinture", "Électricité"],
    specialities: ["Dépannage Urgence", "Pose Sanitaires & Chauffe-eau", "Carrelage 60x120"],
    phone: "+237691234567",
    whatsapp: "+237691234567",
    bio: "Artisan expert en finitions intérieures : pose de carreaux grand format importés, peinture décorative moderne, faux plafonds staff et luminaires.",
    projects: [
      {
        title: "Rénovation Salon : Carrelage 60x120 & Faux Plafond Staff",
        place: "Makepe, Douala",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        beforeImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        description: "Rénovation d'un salon avec dépose de l'ancien sol, pose de carreaux polis 60x120 et création d'un faux-plafond avec ruban LED."
      },
      {
        title: "Éclairage & Domotique Appartement",
        place: "Bonapriso, Douala",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
        description: "Installation complète d'interrupteurs connectés, scénarios lumineux et tableau électrique sécurisé."
      }
    ]
  }
];

// Projets initiaux par défaut
export const DEFAULT_PRO_PROJECTS = [
  {
    id: 101,
    title: "Meuble TV Mural Flottant Bois d'Iroko & LED",
    category: "Menuiserie & Mobilier sur-mesure",
    city: "Yaoundé, Bastos",
    duration: "10 jours",
    budget: "450 000 FCFA",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    gallery: [
      { id: 1, url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" },
      { id: 2, url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" }
    ],
    materials: ["Bois d'Iroko massif", "Rubans LED 3000K", "Coulisses Blum amorties", "Passage de câbles invisible"],
    description: "Transformation d'un mur brut de salon en ensemble mural design en bois d'Iroko avec niches et rubans LED intégrés.",
    author: {
      id: 1,
      name: "Atelier Iroko & Design",
      phone: "+237699001122",
      whatsapp: "+237699001122",
      city: "Yaoundé, Bastos",
      rating: 4.9
    },
    likes: 34,
    date: "Il y a 2 semaines"
  },
  {
    id: 102,
    title: "Cuisine Américaine Îlot Marbre & Spots",
    category: "Cuisiniste & Dressings",
    city: "Yaoundé, Santa Barbara",
    duration: "3 semaines",
    budget: "1 250 000 FCFA",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    beforeImage: null,
    gallery: [
      { id: 1, url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" }
    ],
    materials: ["Granit noir poli", "Mélaminé hydrofuge", "Électroménager encastré"],
    description: "Conception et pose d'une cuisine contemporaine avec îlot central en marbre et rangements amortis.",
    author: {
      id: 1,
      name: "Atelier Iroko & Design",
      phone: "+237699001122",
      whatsapp: "+237699001122",
      city: "Yaoundé, Bastos",
      rating: 4.9
    },
    likes: 42,
    date: "Il y a 3 semaines"
  },
  {
    id: 103,
    title: "Rénovation Salon : Carrelage 60x120 & Faux Plafond Staff",
    category: "Carrelage & Faux Plafonds",
    city: "Douala, Makepe",
    duration: "2 semaines",
    budget: "750 000 FCFA",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    beforeImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    gallery: [
      { id: 1, url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
      { id: 2, url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" }
    ],
    materials: ["Carreaux 60x120 marbrés", "Staff moulé", "Spots LED dimmables"],
    description: "Rénovation d'un salon avec dépose de l'ancien sol, pose de carreaux polis 60x120 et création d'un faux-plafond avec ruban LED.",
    author: {
      id: 3,
      name: "Martin Nkodo Finitions",
      phone: "+237691234567",
      whatsapp: "+237691234567",
      city: "Douala, Bonanjo",
      rating: 4.5
    },
    likes: 29,
    date: "Il y a 1 mois"
  }
];

export const proProjectsService = {
  // Récupérer tous les professionnels certifiés (en scannant tous les profils pros enregistrés)
  getAllProfessionals: (currentUser) => {
    let list = [...DEFAULT_PROFESSIONALS];
    let registeredList = [];

    // 1. Lire la liste globale de pros enregistrés
    const savedPros = localStorage.getItem(PROS_STORAGE_KEY);
    if (savedPros) {
      try { registeredList = JSON.parse(savedPros); } catch (e) {}
    }

    // 2. Parcourir tous les profils de type piolo_pro_profile_* dans localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('piolo_pro_profile_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const uProfile = JSON.parse(raw);
            const uId = k.replace('piolo_pro_profile_', '');
            const uProjectsRaw = localStorage.getItem(`piolo_pro_projects_${uId}`);
            const uProjects = uProjectsRaw ? JSON.parse(uProjectsRaw) : [];

            // Récupérer les avis personnalisés si existants
            const savedReviews = localStorage.getItem(`piolo_pro_reviews_user_${uId}`);
            const reviewsArr = savedReviews ? JSON.parse(savedReviews) : [
              { id: 1, author: "Alain Mbida", role: "Locataire Vérifié", rating: 5, date: "Il y a 3 jours", comment: "Excellent travail sur mon dressing et meuble TV. Je recommande vivement !" },
              { id: 2, author: "Blandine Eto", role: "Bailleur Propriétaire", rating: 5, date: "Il y a 2 semaines", comment: "Très professionnel, finitions nobles et délais respectés." }
            ];

            const formattedPro = {
              id: `user_${uId}`,
              name: uProfile.businessName || 'YVAN PANGTAMPOE Créations',
              initials: (uProfile.businessName?.[0] || 'Y').toUpperCase(),
              avatarBg: "linear-gradient(135deg, #D4AF37, #AA820A)",
              cover: uProjects[0]?.image || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
              image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
              availText: "Disponible maintenant",
              availColor: "#27AE60",
              city: uProfile.city || "Yaoundé",
              title: uProfile.primaryTrade || "Menuisier & Ébéniste (Meubles sur-mesure)",
              specialty: uProfile.primaryTrade || "Menuisier & Ébéniste (Meubles sur-mesure)",
              category: "mobilier",
              rating: 5.0,
              reviewsCount: reviewsArr.length,
              projectsCount: uProjects.length > 0 ? uProjects.length : 3,
              experience: uProfile.experienceYears || "5 ans",
              pointsRequired: "2 pts",
              verified: true,
              tags: (uProfile.secondaryTrades && uProfile.secondaryTrades.length) ? uProfile.secondaryTrades : ["Meubles TV", "Dressings sur-mesure", "Plans 3D"],
              specialities: [uProfile.primaryTrade || "Mobilier sur-mesure", ...(uProfile.secondaryTrades || [])],
              phone: uProfile.phone || "+237 699 00 11 22",
              whatsapp: uProfile.whatsapp || "+237 699 00 11 22",
              bio: uProfile.bio || "Spécialiste de la conception et fabrication de mobilier haut de gamme, aménagement intérieur et rénovation moderne au Cameroun.",
              reviews: reviewsArr,
              projects: uProjects.length > 0 ? uProjects.map(p => ({
                title: p.title,
                place: p.city || uProfile.city || "Yaoundé",
                image: p.image,
                beforeImage: p.beforeImage || null,
                description: p.description
              })) : [
                {
                  title: "Meuble TV Mural Flottant Bois d'Iroko & LED",
                  place: uProfile.city || "Yaoundé, Bastos",
                  image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
                  beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
                  description: "Transformation d'un mur brut en ensemble meuble TV flottant avec niches et LED intégrés."
                },
                {
                  title: "Dressing Moderne Bois & Miroirs",
                  place: uProfile.city || "Yaoundé, Odza",
                  image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
                  description: "Fabrication et pose d'un dressing sur-mesure avec penderies et rangements à coulisses amorties."
                }
              ]
            };

            const existingIdx = registeredList.findIndex(r => r.name === formattedPro.name || r.id === formattedPro.id);
            if (existingIdx >= 0) {
              registeredList[existingIdx] = formattedPro;
            } else {
              registeredList.unshift(formattedPro);
            }
          }
        }
      }
    } catch (e) {}

    // S'assurer que le profil YVAN PANGTAMPOE Créations est toujours inclus au sommet
    const yvanExists = registeredList.some(r => (r.name || '').toLowerCase().includes('yvan'));
    if (!yvanExists) {
      const yvanDefault = {
        id: "user_yvan_default",
        name: "YVAN PANGTAMPOE Créations",
        initials: "YP",
        avatarBg: "linear-gradient(135deg, #D4AF37, #AA820A)",
        cover: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
        availText: "Disponible maintenant",
        availColor: "#27AE60",
        city: "Yaoundé (Bastos, Odza)",
        title: "Menuisier & Ébéniste (Meubles sur-mesure)",
        specialty: "Menuisier & Ébéniste (Meubles sur-mesure)",
        category: "mobilier",
        rating: 5.0,
        reviewsCount: 18,
        projectsCount: 6,
        experience: "5 ans",
        pointsRequired: "2 pts",
        verified: true,
        tags: ["Meubles TV", "Dressings sur-mesure", "Cuisines Bois"],
        specialities: ["Menuisier & Ébéniste", "Architecte d'Intérieur & Designer"],
        phone: "+237 699 00 11 22",
        whatsapp: "+237 699 00 11 22",
        bio: "Spécialiste de la conception et fabrication de mobilier haut de gamme, aménagement intérieur et rénovation moderne.",
        reviews: [
          { id: 1, author: "Alain Mbida", role: "Locataire Vérifié", rating: 5, date: "Il y a 3 jours", comment: "Meuble TV mural magnifique, pose impeccable et finitions bois Iroko de premier choix !" },
          { id: 2, author: "Blandine Eto", role: "Bailleur Propriétaire", rating: 5, date: "Il y a 2 semaines", comment: "Travail très pro sur mon appartement de Bastos. Respect des délais au top." }
        ],
        projects: [
          {
            title: "Meuble TV Mural Flottant Bois d'Iroko & LED",
            place: "Bastos, Yaoundé",
            image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
            beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
            description: "Transformation d'un mur brut en ensemble mural meuble TV avec rubans LED intégrés."
          },
          {
            title: "Dressing Contemporain Portes Coulissantes",
            place: "Santa Barbara, Yaoundé",
            image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
            description: "Conception et pose de dressing contemporain avec penderie et tiroirs amortis."
          }
        ]
      };
      registeredList.unshift(yvanDefault);
    }

    return [...registeredList, ...list.filter(def => !registeredList.some(r => r.name === def.name))];
  },

  // Enregistrer ou mettre à jour un profil professionnel
  saveProfessionalProfile: (proProfile, user) => {
    const key = `piolo_pro_profile_${user?.id || 'current'}`;
    localStorage.setItem(key, JSON.stringify(proProfile));

    const savedProsRaw = localStorage.getItem(PROS_STORAGE_KEY);
    let registeredList = [];
    if (savedProsRaw) {
      try { registeredList = JSON.parse(savedProsRaw); } catch (e) {}
    }

    const proEntry = {
      id: `user_${user?.id || 'current'}`,
      name: proProfile.businessName || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'YVAN PANGTAMPOE Créations',
      initials: (proProfile.businessName?.[0] || user?.first_name?.[0] || 'Y').toUpperCase(),
      avatarBg: "linear-gradient(135deg, #D4AF37, #AA820A)",
      cover: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
      image: user?.avatar_url || user?.avatar || "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
      availText: "Disponible maintenant",
      availColor: "#27AE60",
      city: proProfile.city || "Yaoundé",
      title: proProfile.primaryTrade || "Menuisier & Ébéniste (Meubles sur-mesure)",
      specialty: proProfile.primaryTrade || "Menuisier & Ébéniste (Meubles sur-mesure)",
      category: "mobilier",
      rating: 5.0,
      reviewsCount: 1,
      projectsCount: 3,
      experience: proProfile.experienceYears || "5 ans",
      pointsRequired: "2 pts",
      verified: true,
      tags: (proProfile.secondaryTrades && proProfile.secondaryTrades.length) ? proProfile.secondaryTrades : ["Meubles TV", "Dressings sur-mesure", "Plans 3D"],
      specialities: [proProfile.primaryTrade || "Menuisier & Ébéniste", ...(proProfile.secondaryTrades || [])],
      phone: proProfile.phone || user?.phone || "+237 699 00 11 22",
      whatsapp: proProfile.whatsapp || user?.phone || "+237 699 00 11 22",
      bio: proProfile.bio || "Spécialiste de la conception et fabrication de mobilier haut de gamme, aménagement intérieur et rénovation moderne.",
      reviews: [
        { id: 1, author: "Alain Mbida", role: "Locataire Vérifié", rating: 5, date: "Il y a 3 jours", comment: "Prestation de menuiserie irréprochable et respect du calendrier." }
      ],
      projects: []
    };

    const updated = [proEntry, ...registeredList.filter(p => p.id !== proEntry.id && p.name !== proEntry.name)];
    localStorage.setItem(PROS_STORAGE_KEY, JSON.stringify(updated));
    return proEntry;
  },

  // Ajouter un avis/commentaire sur un professionnel
  addReviewToPro: (proId, review) => {
    const key = `piolo_pro_reviews_${proId}`;
    const saved = localStorage.getItem(key);
    const list = saved ? JSON.parse(saved) : [];
    list.unshift(review);
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  },

  // Récupérer tous les projets publiés sur la plateforme
  getAllProjects: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRO_PROJECTS));
      return DEFAULT_PRO_PROJECTS;
    }
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRO_PROJECTS;
    } catch (e) {
      return DEFAULT_PRO_PROJECTS;
    }
  },

  // Publier un nouveau projet et le synchroniser partout
  publishProject: (project, authorUser) => {
    const current = proProjectsService.getAllProjects();
    const formatted = {
      ...project,
      author: project.author || {
        id: authorUser?.id || 99,
        name: `${authorUser?.first_name || ''} ${authorUser?.last_name || ''}`.trim() || 'YVAN PANGTAMPOE Créations',
        phone: authorUser?.phone || '+237699001122',
        whatsapp: authorUser?.phone || '+237699001122',
        city: authorUser?.city || 'Yaoundé',
        rating: 5.0
      }
    };
    const updated = [formatted, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Supprimer un projet de la liste globale
  deleteProject: (projectId, userId) => {
    const current = proProjectsService.getAllProjects();
    const updated = current.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (userId) {
      const userProjectsRaw = localStorage.getItem(`piolo_pro_projects_${userId}`);
      if (userProjectsRaw) {
        try {
          const userProjects = JSON.parse(userProjectsRaw);
          const updatedUser = userProjects.filter(p => p.id !== projectId);
          localStorage.setItem(`piolo_pro_projects_${userId}`, JSON.stringify(updatedUser));
        } catch (e) {}
      }
    }
    return updated;
  },

  // Gestion des points de fidélité / publication de l'artisan
  getUserPoints: (userId) => {
    const key = `${USER_POINTS_PREFIX}${userId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return parseInt(saved, 10) || 0;
    }
    // 50 points de bienvenue par défaut
    localStorage.setItem(key, '50');
    return 50;
  },

  setUserPoints: (userId, points) => {
    const key = `${USER_POINTS_PREFIX}${userId || 'default'}`;
    localStorage.setItem(key, points.toString());
  },

  deductPoints: (userId, amount = 5) => {
    const current = proProjectsService.getUserPoints(userId);
    if (current < amount) return false;
    proProjectsService.setUserPoints(userId, current - amount);
    return true;
  },

  addPoints: (userId, amount) => {
    const current = proProjectsService.getUserPoints(userId);
    proProjectsService.setUserPoints(userId, current + amount);
    return current + amount;
  }
};
