import json

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr_data = json.load(f)

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

fr_pro = {
    "title": "Espace Professionnel",
    "verified_pro": "Professionnel Certifié",
    "certified_artisan": "Artisan Certifié Piolo",
    "certified_project": "Chantier Certifié",
    "piolo_control": "Contrôle Piolo",
    "experience": "Expérience",
    "years_experience": "Années d'expérience",
    "projects": "Projets",
    "portfolio": "Mon Portfolio & Réalisations",
    "quotes": "Demandes de Devis",
    "stats": "Visibilité & Statistiques",
    "settings": "Configuration Métier & Tarifs",
    "request_quote": "Demander un devis",
    "view_profile": "Voir le profil",
    "view_project": "Voir le chantier complet",
    "free_quote": "Sur devis gratuit",
    "indicative_price": "Tarif indicatif",
    "indicative_cost": "Coût indicatif",
    "work_duration": "Durée de Chantier",
    "location": "Localisation",
    "service_area": "Zone d'intervention",
    "main_city": "VILLE PRINCIPALE",
    "travel_sectors": "SECTEURS DE DÉPLACEMENT",
    "workshop_availability": "DISPONIBILITÉ ATELIER",
    "google_maps": "Itinéraire Google Maps",
    "whatsapp_direct": "WhatsApp Direct",
    "call_client": "Appeler le client",
    "reply_whatsapp": "Répondre sur WhatsApp",
    "categories": {
        "all": "Tous les Métiers",
        "carpentry": "Menuiserie, Mobilier & Déco",
        "carpentry_custom": "Menuiserie & Mobilier sur-mesure",
        "kitchen": "Cuisiniste & Dressings",
        "architecture": "Architecture, Ingénierie & BTP",
        "architecture_3d": "Architecture & Plans 3D",
        "renovation": "Rénovation & Finitions BTP",
        "tiling": "Carrelage & Faux Plafonds",
        "electricity": "Plomberie, Électricité & Énergie",
        "electricity_led": "Électricité & Éclairage LED",
        "electricity_solar": "Électricité & Solaire",
        "plumbing": "Plomberie & Climatisation",
        "plumbing_sanitary": "Plomberie & Sanitaires",
        "exterior": "Extérieur, Jardin & Sécurité"
    },
    "cities": {
        "all": "Toutes les villes",
        "yaounde": "Yaoundé (Grand Yaoundé & Soa)",
        "douala": "Douala (Grand Douala & Bonabéri)",
        "bafoussam": "Bafoussam (Ouest)",
        "kribi": "Kribi (Océan & Littoral)",
        "limbe": "Limbé (Sud-Ouest)",
        "bamenda": "Bamenda (Nord-Ouest)",
        "garoua": "Garoua (Nord)",
        "maroua": "Maroua (Extrême-Nord)",
        "ngaoundere": "Ngaoundéré (Adamaoua)",
        "bertoua": "Bertoua (Est)",
        "ebolowa": "Ebolowa (Sud)",
        "dschang": "Dschang (Menoua)",
        "buea": "Buea (Sud-Ouest)",
        "other": "Autre région (Kribi, Bafoussam, Limbe...)"
    }
}

en_pro = {
    "title": "Professional Space",
    "verified_pro": "Verified Professional",
    "certified_artisan": "Piolo Certified Craftsman",
    "certified_project": "Certified Project",
    "piolo_control": "Piolo Quality Check",
    "experience": "Experience",
    "years_experience": "Years of experience",
    "projects": "Projects",
    "portfolio": "My Portfolio & Achievements",
    "quotes": "Quote Requests",
    "stats": "Visibility & Analytics",
    "settings": "Trade Settings & Rates",
    "request_quote": "Request a quote",
    "view_profile": "View profile",
    "view_project": "View full project",
    "free_quote": "Free quote upon request",
    "indicative_price": "Indicative rate",
    "indicative_cost": "Estimated cost",
    "work_duration": "Project Duration",
    "location": "Location",
    "service_area": "Service area",
    "main_city": "PRIMARY CITY",
    "travel_sectors": "TRAVEL SECTORS",
    "workshop_availability": "WORKSHOP AVAILABILITY",
    "google_maps": "Google Maps Directions",
    "whatsapp_direct": "Direct WhatsApp",
    "call_client": "Call client",
    "reply_whatsapp": "Reply on WhatsApp",
    "categories": {
        "all": "All Trades",
        "carpentry": "Carpentry, Furniture & Decor",
        "carpentry_custom": "Custom Carpentry & Furniture",
        "kitchen": "Kitchens & Wardrobes",
        "architecture": "Architecture, Engineering & Construction",
        "architecture_3d": "Architecture & 3D Plans",
        "renovation": "Renovation & Finishing Works",
        "tiling": "Tiling & False Ceilings",
        "electricity": "Plumbing, Electrical & Energy",
        "electricity_led": "Electrical & LED Lighting",
        "electricity_solar": "Electrical & Solar",
        "plumbing": "Plumbing & Air Conditioning",
        "plumbing_sanitary": "Plumbing & Sanitary",
        "exterior": "Outdoors, Garden & Security"
    },
    "cities": {
        "all": "All cities",
        "yaounde": "Yaoundé (Greater Yaoundé & Soa)",
        "douala": "Douala (Greater Douala & Bonabéri)",
        "bafoussam": "Bafoussam (West)",
        "kribi": "Kribi (Ocean & Coast)",
        "limbe": "Limbe (South-West)",
        "bamenda": "Bamenda (North-West)",
        "garoua": "Garoua (North)",
        "maroua": "Maroua (Far North)",
        "ngaoundere": "Ngaoundéré (Adamawa)",
        "bertoua": "Bertoua (East)",
        "ebolowa": "Ebolowa (South)",
        "dschang": "Dschang (Menoua)",
        "buea": "Buea (South-West)",
        "other": "Other region (Kribi, Bafoussam, Limbe...)"
    }
}

fr_pro_modals = {
    "subscription": {
        "title": "Monétisation & Visibilité Piolo",
        "current_balance": "Votre Solde Actuel",
        "points_cost_info": "Chaque publication de projet en vitrine requiert 5 points (ou gratuit et illimité avec l'abonnement Artisan Pro).",
        "pack_flash": "Pack Flash",
        "pack_recommended": "Pack Recommandé",
        "pack_expert": "Pack Expert (+20 pts offerts)",
        "discount_20": "-20% de remise",
        "total_amount": "Montant total :",
        "phone_placeholder": "Ex: 699 00 11 22",
        "btn_recharge": "Recharger mes points",
        "subscribe_pro": "Souscrire à Artisan Pro"
    },
    "escrow": {
        "title": "Garantie Piolo Protec (0% Risque)",
        "down_payment": "Acompte de démarrage (30%)",
        "escrow_fees": "Frais de protection & séquestre Piolo (5%)",
        "total_to_pay": "Total à payer",
        "orange_money": "Orange Money",
        "mtn_momo": "MTN MoMo",
        "phone_placeholder": "Ex: 699 00 11 22",
        "how_it_works": "Comment fonctionne la garantie ?",
        "secure_btn": "Sécuriser l'acompte par Séquestre"
    },
    "budget": {
        "official_simulator": "Simulateur Officiel Piolo Habitat",
        "title_prefix": "Estimateur de Budget",
        "title_highlight": "Travaux & Mobilier",
        "cta_simulate": "Simuler mon budget travaux & mobilier",
        "custom_options": "Options & Personnalisations",
        "btn_express_quote": "Demander un devis express pour ce projet"
    },
    "quote_request": {
        "badge": "Devis Express Sans Engagement",
        "dimensions_placeholder": "Ex: Mur de 3m x 2.6m, ou 45m²",
        "materials": {
            "iroko": "Bois noble d'Iroko (Très résistant)",
            "padouk": "Padouk d'Afrique",
            "melamine_led": "Mélaminé Haute Densité & LED",
            "epoxy_metal": "Résine Époxy & Métal Noir",
            "tiling_large": "Carrelage Grand Format 60x120",
            "staff_spots": "Staff & Spots Encastrés"
        },
        "budget_ranges": {
            "unspecified": "Facultatif — Je préfère recevoir le devis de l'artisan",
            "under_250k": "Moins de 250 000 FCFA",
            "250k_500k": "250 000 - 500 000 FCFA",
            "500k_15m": "500 000 - 1 500 000 FCFA",
            "over_15m": "Plus de 1 500 000 FCFA"
        },
        "urgency": {
            "urgent": "Urgent (< 7 jours)",
            "asap": "Dès que possible (< 2 semaines)",
            "in_month": "Dans le mois",
            "future": "Projet futur / Simple étude"
        },
        "photo_label": "Photo",
        "client_name_placeholder": "Ex: Yvan Pangtampoe",
        "client_phone_placeholder": "Ex: 699 00 11 22",
        "client_city_placeholder": "Ex: Douala, Bonamoussadi",
        "notes_placeholder": "Ex: Présence de prises électriques existantes sur le mur, souhait de LED blanc chaud 3000K...",
        "service_label": "Prestation :",
        "budget_label": "Budget estimé :",
        "start_label": "Début :",
        "certified_match": "Mise en relation directe certifiée",
        "instant_dispatch": "Transmission instantanée du cahier des charges à l'artisan",
        "sending": "Envoi en cours...",
        "submit_btn": "Envoyer ma Demande (-2 Pts)",
        "success_msg": "a été enregistré et transmis à",
        "send_whatsapp": "Envoyer également sur WhatsApp"
    },
    "quote_detail": {
        "title": "Dossier Devis Client",
        "estimated_budget": "BUDGET ESTIMÉ",
        "desired_timeline": "DÉLAI SOUHAITÉ",
        "location": "LOCALISATION",
        "call_client": "Appeler le client",
        "reply_whatsapp": "Répondre sur WhatsApp"
    },
    "delete_confirm": {
        "title": "Supprimer cette réalisation ?",
        "warning": "Ce chantier ne sera plus visible par les locataires et les bailleurs dans l'annuaire public.",
        "confirm": "Supprimer définitivement",
        "cancel": "Annuler"
    },
    "publish_confirm": {
        "title": "Publier ce chantier en vitrine ?",
        "current_balance": "Solde de points actuel :",
        "cost": "Coût de publication :",
        "new_balance": "Nouveau solde restant :",
        "publishing": "Publication en cours...",
        "confirm": "Confirmer la publication"
    },
    "add_project": {
        "badge": "Vitrine Professionnelle",
        "title_placeholder": "Ex: Meuble TV Mural Flottant en Bois d'Iroko & LED",
        "location_placeholder": "Ex: Yaoundé, Bastos",
        "duration_placeholder": "Ex: 10 jours ou 3 semaines",
        "cost_placeholder": "Ex: 450000",
        "main_photos_title": "Photos Principales (Génération automatique du Slider Avant / Après)",
        "add_before_photo": "Ajouter la photo Avant",
        "before_photo_desc": "Mur brut, pièce avant rénovation",
        "add_after_photo": "Ajouter la photo Après (Obligatoire)",
        "after_photo_desc": "Résultat final soigné",
        "gallery_desc": "Angles de vue, détails des assemblages, gros plans",
        "add_photo_btn": "+ Ajouter photo",
        "videos_desc": "Visible dans les détails du projet et dans le Mode Découverte (MP4, WebM, MOV)",
        "video_title_placeholder": "Titre de la vidéo (ex: Visite finale)",
        "add_video_btn": "+ Ajouter une vidéo",
        "video_upload_desc": "Visite guidée, réalisation (max 50 Mo)",
        "materials_placeholder": "Ex: Bois d'Iroko massif, Spots LED 3000K, Coulisses amorties Blum, Laque noire mate",
        "description_placeholder": "Décrivez les étapes du chantier, les contraintes surmontées, les dimensions et les garanties offertes au client...",
        "submit_btn": "Enregistrer et Publier le Projet"
    },
    "project_detail": {
        "final_photo": "Photo Finale",
        "before_after": "Avant / Après",
        "click_to_zoom": "Cliquer pour agrandir",
        "artisan_author": "Artisan Réalisateur",
        "chat_whatsapp": "Discuter sur WhatsApp"
    },
    "profile_detail": {
        "tabs": {
            "projects": "Chantiers & Projets",
            "reviews": "Avis & Notes",
            "about": "À Propos & Tarifs"
        },
        "review_prompt": "Laisser une note & un commentaire",
        "review_placeholder": "Qualité du travail, respect des délais, propreté du chantier...",
        "location_action": "Implantation & Rayon d’Action"
    },
    "discovery_video": {
        "empty": "Aucune vidéo disponible pour le moment",
        "whatsapp": "WhatsApp"
    }
}

en_pro_modals = {
    "subscription": {
        "title": "Piolo Monetization & Visibility",
        "current_balance": "Your Current Balance",
        "points_cost_info": "Each project showcase publication requires 5 points (or free and unlimited with Artisan Pro subscription).",
        "pack_flash": "Flash Pack",
        "pack_recommended": "Recommended Pack",
        "pack_expert": "Expert Pack (+20 free pts)",
        "discount_20": "-20% discount",
        "total_amount": "Total amount:",
        "phone_placeholder": "Ex: 699 00 11 22",
        "btn_recharge": "Recharge my points",
        "subscribe_pro": "Subscribe to Artisan Pro"
    },
    "escrow": {
        "title": "Piolo Protec Guarantee (0% Risk)",
        "down_payment": "Initial deposit (30%)",
        "escrow_fees": "Piolo protection & escrow fee (5%)",
        "total_to_pay": "Total payable",
        "orange_money": "Orange Money",
        "mtn_momo": "MTN MoMo",
        "phone_placeholder": "Ex: 699 00 11 22",
        "how_it_works": "How does the guarantee work?",
        "secure_btn": "Secure deposit with Escrow"
    },
    "budget": {
        "official_simulator": "Official Piolo Habitat Simulator",
        "title_prefix": "Budget Estimator",
        "title_highlight": "Renovations & Furniture",
        "cta_simulate": "Simulate my renovation & furniture budget",
        "custom_options": "Options & Customizations",
        "btn_express_quote": "Request an express quote for this project"
    },
    "quote_request": {
        "badge": "Express Quote No Commitment",
        "dimensions_placeholder": "Ex: 3m x 2.6m wall, or 45sqm",
        "materials": {
            "iroko": "Noble Iroko Hardwood (Very durable)",
            "padouk": "African Padouk",
            "melamine_led": "High Density Melamine & LED",
            "epoxy_metal": "Epoxy Resin & Black Metal",
            "tiling_large": "Large Format 60x120 Tiling",
            "staff_spots": "Plaster Molding & Recessed Spots"
        },
        "budget_ranges": {
            "unspecified": "Optional — I prefer to receive the craftsman's estimate",
            "under_250k": "Under 250,000 FCFA",
            "250k_500k": "250,000 - 500,000 FCFA",
            "500k_15m": "500,000 - 1,500,000 FCFA",
            "over_15m": "Over 1,500,000 FCFA"
        },
        "urgency": {
            "urgent": "Urgent (< 7 days)",
            "asap": "As soon as possible (< 2 weeks)",
            "in_month": "Within the month",
            "future": "Future project / Feasibility study"
        },
        "photo_label": "Photo",
        "client_name_placeholder": "Ex: Yvan Pangtampoe",
        "client_phone_placeholder": "Ex: 699 00 11 22",
        "client_city_placeholder": "Ex: Douala, Bonamoussadi",
        "notes_placeholder": "Ex: Wall sockets already installed, warm white 3000K LED lighting desired...",
        "service_label": "Service:",
        "budget_label": "Estimated budget:",
        "start_label": "Start date:",
        "certified_match": "Certified direct matching",
        "instant_dispatch": "Instant requirements dispatch to craftsman",
        "sending": "Sending...",
        "submit_btn": "Submit my Request (-2 Pts)",
        "success_msg": "has been recorded and sent to",
        "send_whatsapp": "Also send on WhatsApp"
    },
    "quote_detail": {
        "title": "Client Quote Request",
        "estimated_budget": "ESTIMATED BUDGET",
        "desired_timeline": "DESIRED TIMELINE",
        "location": "LOCATION",
        "call_client": "Call client",
        "reply_whatsapp": "Reply on WhatsApp"
    },
    "delete_confirm": {
        "title": "Delete this project?",
        "warning": "This project will no longer be visible to tenants and landlords in the public directory.",
        "confirm": "Delete permanently",
        "cancel": "Cancel"
    },
    "publish_confirm": {
        "title": "Publish this project in showcase?",
        "current_balance": "Current points balance:",
        "cost": "Publication cost:",
        "new_balance": "New remaining balance:",
        "publishing": "Publishing...",
        "confirm": "Confirm publication"
    },
    "add_project": {
        "badge": "Professional Showcase",
        "title_placeholder": "Ex: Floating TV Wall Unit in Iroko Wood & LED",
        "location_placeholder": "Ex: Yaoundé, Bastos",
        "duration_placeholder": "Ex: 10 days or 3 weeks",
        "cost_placeholder": "Ex: 450000",
        "main_photos_title": "Main Photos (Automatic Before / After Slider Generation)",
        "add_before_photo": "Add Before photo",
        "before_photo_desc": "Bare wall, room before renovation",
        "add_after_photo": "Add After photo (Required)",
        "after_photo_desc": "Polished final result",
        "gallery_desc": "Angles, joint details, close-ups",
        "add_photo_btn": "+ Add photo",
        "videos_desc": "Visible in project details and in Discovery Mode (MP4, WebM, MOV)",
        "video_title_placeholder": "Video title (e.g. Final walkthrough)",
        "add_video_btn": "+ Add a video",
        "video_upload_desc": "Guided walkthrough, showcase (max 50 MB)",
        "materials_placeholder": "Ex: Solid Iroko wood, 3000K LED spots, Blum soft-close sliders, Matte black lacquer",
        "description_placeholder": "Describe the stages of work, obstacles overcome, dimensions, and guarantees offered...",
        "submit_btn": "Save and Publish Project"
    },
    "project_detail": {
        "final_photo": "Final Photo",
        "before_after": "Before / After",
        "click_to_zoom": "Click to enlarge",
        "artisan_author": "Craftsman",
        "chat_whatsapp": "Chat on WhatsApp"
    },
    "profile_detail": {
        "tabs": {
            "projects": "Projects & Works",
            "reviews": "Reviews & Ratings",
            "about": "About & Rates"
        },
        "review_prompt": "Leave a rating & review",
        "review_placeholder": "Work quality, punctuality, site cleanliness...",
        "location_action": "Location & Travel Radius"
    },
    "discovery_video": {
        "empty": "No videos available at the moment",
        "whatsapp": "WhatsApp"
    }
}

fr_pro_dashboard = {
    "title": "Espace Professionnel & Artisans",
    "badge_pro": "Professionnel",
    "views_tooltip": "Nombre total de clients ayant consulté votre profil professionnel",
    "views": "Vues",
    "points_tooltip": "Cliquer pour recharger vos points ou gérer votre abonnement",
    "points_balance": "Solde de Points Piolo",
    "certified_profile": "Profil Professionnel Certifié",
    "add_project": "Ajouter une réalisation",
    "new_project": "Nouveau Projet",
    "public_directory": "Voir l’annuaire public",
    "no_projects": "Aucune réalisation pour l'instant",
    "click_to_view_details": "Cliquer pour voir la fiche détaillée de ce chantier",
    "delete_project": "Supprimer la réalisation",
    "project_details_preview": "Aperçu Détails Chantier",
    "no_quotes": "Aucune demande de devis reçue pour le moment",
    "quotes_desc": "Les demandes envoyées par les locataires et bailleurs apparaîtront directement ici.",
    "saving": "Enregistrement en cours...",
    "save_changes": "Enregistrer les modifications",
    "conversion_indicator": "Indicateur de Performance & Conversion",
    "tabs": {
        "portfolio": "Mon Portfolio & Réalisations",
        "quotes": "Demandes de Devis & Messages",
        "stats": "Visibilité & Statistiques",
        "settings": "Configuration Métier & Tarifs"
    }
}

en_pro_dashboard = {
    "title": "Craftsmen & Pro Space",
    "badge_pro": "Professional",
    "views_tooltip": "Total number of clients who viewed your professional profile",
    "views": "Views",
    "points_tooltip": "Click to recharge your points or manage your subscription",
    "points_balance": "Piolo Points Balance",
    "certified_profile": "Verified Professional Profile",
    "add_project": "Add a project",
    "new_project": "New Project",
    "public_directory": "View public directory",
    "no_projects": "No projects showcase yet",
    "click_to_view_details": "Click to view detailed project sheet",
    "delete_project": "Delete project",
    "project_details_preview": "Project Details Preview",
    "no_quotes": "No quote requests received yet",
    "quotes_desc": "Requests sent by tenants and landlords will appear directly here.",
    "saving": "Saving in progress...",
    "save_changes": "Save changes",
    "conversion_indicator": "Performance & Conversion Indicator",
    "tabs": {
        "portfolio": "My Portfolio & Achievements",
        "quotes": "Quote Requests & Messages",
        "stats": "Visibility & Analytics",
        "settings": "Trade Settings & Rates"
    }
}

fr_architects = {
    "title": "Professionnels & Artisans",
    "badge_discovery": "Mode Découverte Vidéos",
    "btn_budget_calc": "Calculateur de Budget",
    "hero_title": "Réseau d'Experts de l'Habitat Piolo",
    "hero_highlight": "Mobilier",
    "simulate_budget_btn": "Simuler mon budget travaux & mobilier",
    "search_placeholder": "Rechercher par métier, compétence (ex: Meuble TV, Plomberie, Plans 3D)...",
    "showcase_title": "Derniers Chantiers & Transformations en Vitrine",
    "swipe_hint": "Glisser ➔",
    "badge_hd_video": "Vidéo HD",
    "by": "Par",
    "see_details": "Voir détails →",
    "empty_title": "Aucun artisan ne correspond à ces critères",
    "empty_subtitle": "Essayez d'élargir vos filtres de recherche ou de ville.",
    "quote_btn": "Demander un devis",
    "profile_btn": "Voir profil"
}

en_architects = {
    "title": "Professionals & Craftsmen",
    "badge_discovery": "Video Discovery Mode",
    "btn_budget_calc": "Budget Calculator",
    "hero_title": "Piolo Habitat Expert Network",
    "hero_highlight": "Furniture",
    "simulate_budget_btn": "Simulate my renovation & furniture budget",
    "search_placeholder": "Search by trade, skill (e.g. TV Unit, Plumbing, 3D Plans)...",
    "showcase_title": "Latest Projects & Transformations in Showcase",
    "swipe_hint": "Swipe ➔",
    "badge_hd_video": "HD Video",
    "by": "By",
    "see_details": "See details →",
    "empty_title": "No craftsman matches these criteria",
    "empty_subtitle": "Try expanding your search filters or city.",
    "quote_btn": "Request a quote",
    "profile_btn": "View profile"
}

fr_tour = {
    "badge_360": "360°",
    "viewer_hint": "🖱️ Glissez pour tourner • 🔍 Molette pour zoomer",
    "exit_tour": "Quitter la visite",
    "go_to": "Aller à {{room}}",
    "back_to": "Retour à {{room}}",
    "default_room_living": "Salon Principal",
    "default_room_master": "Chambre Master",
    "editor": {
        "add_room_btn": "+ Pièce 360°",
        "new_room": "+ Nouvelle pièce",
        "loading_rooms": "Chargement des pièces…",
        "no_rooms": "Aucune pièce ajoutée",
        "no_rooms_desc": "Importez votre première photo 360° pour commencer.",
        "delete_room": "Supprimer cette pièce",
        "visualize": "Visualiser",
        "place_hotspot": "+ Placer Porte (Hotspot)",
        "no_room_360": "Aucune pièce 360°",
        "modal_title": "Ajouter une pièce 360°",
        "room_name_placeholder": "Ex: Salon Principal, Chambre, Balcon…",
        "photo_ready": "✓ Photo panoramique prête",
        "choose_photo": "Choisir la photo 360°",
        "format_hint": "Format JPG, PNG panoramique 2:1",
        "link_to_room": "Relier à une autre pièce",
        "select_destination": "-- Sélectionner la pièce de destination --"
    }
}

en_tour = {
    "badge_360": "360°",
    "viewer_hint": "🖱️ Drag to rotate • 🔍 Scroll wheel to zoom",
    "exit_tour": "Exit virtual tour",
    "go_to": "Go to {{room}}",
    "back_to": "Back to {{room}}",
    "default_room_living": "Main Living Room",
    "default_room_master": "Master Bedroom",
    "editor": {
        "add_room_btn": "+ 360° Room",
        "new_room": "+ New room",
        "loading_rooms": "Loading rooms…",
        "no_rooms": "No rooms added yet",
        "no_rooms_desc": "Upload your first 360° photo to get started.",
        "delete_room": "Delete this room",
        "visualize": "Preview",
        "place_hotspot": "+ Place Door (Hotspot)",
        "no_room_360": "No 360° room",
        "modal_title": "Add a 360° Room",
        "room_name_placeholder": "Ex: Main Living Room, Bedroom, Balcony…",
        "photo_ready": "✓ Panoramic photo ready",
        "choose_photo": "Choose 360° photo",
        "format_hint": "JPG, PNG panoramic 2:1 format",
        "link_to_room": "Link to another room",
        "select_destination": "-- Select destination room --"
    }
}

fr_reels = {
    "studio_title": "STUDIO PRO",
    "close": "Fermer",
    "change_clip": "Changer clip",
    "no_clip": "Aucun clip sélectionné",
    "no_clip_hint": "Cliquez sur \"Changer clip\" pour charger une vidéo",
    "mirror": "Miroir",
    "restart": "Revenir au début",
    "aspect_ratio": "Format & Cadrage",
    "trim": "Découper la séquence",
    "reset_bounds": "Réinitialiser les bornes",
    "speed": "Vitesse de la visite",
    "pro_tip": "Astuce Pro",
    "filters": "Filtres & Étalonnage",
    "reset_filters": "Réinitialiser les filtres",
    "apply": "Appliquer",
    "delete": "Supprimer",
    "calculating": "Calcul…",
    "uploading": "Envoi…",
    "desc_templates": "Description & Modèles",
    "formats": {
        "vertical": "9:16 Vertical (Story / Reel)",
        "square": "1:1 Carré (Instagram Feed)",
        "wide": "16:9 Paysage (Format Large)",
        "standard": "4:3 Standard (Classique)"
    },
    "filter_names": {
        "natural": "Naturel",
        "luxury": "Luxe Doré",
        "cinema": "Cinéma Contraste",
        "clarity": "Clarté Max",
        "monochrome": "Monochrome Pro"
    },
    "badges": {
        "high_standing": "Haut Standing",
        "immediate": "Dispo Immédiate",
        "favorite": "Coup de Cœur",
        "furnished": "Entièrement Meublé",
        "security": "Sécurisé 24/7",
        "parking": "Parking Sécurisé",
        "water": "Forage + Camwater",
        "meter": "Compteur Indépendant",
        "access": "Accès Facile",
        "quiet": "Quartier Résidentiel"
    }
}

en_reels = {
    "studio_title": "PRO STUDIO",
    "close": "Close",
    "change_clip": "Change clip",
    "no_clip": "No clip selected",
    "no_clip_hint": "Click \"Change clip\" to upload a video",
    "mirror": "Mirror",
    "restart": "Back to start",
    "aspect_ratio": "Aspect Ratio & Cropping",
    "trim": "Trim sequence",
    "reset_bounds": "Reset boundaries",
    "speed": "Tour speed",
    "pro_tip": "Pro Tip",
    "filters": "Filters & Color Grading",
    "reset_filters": "Reset filters",
    "apply": "Apply",
    "delete": "Delete",
    "calculating": "Calculating…",
    "uploading": "Uploading…",
    "desc_templates": "Description & Templates",
    "formats": {
        "vertical": "9:16 Vertical (Story / Reel)",
        "square": "1:1 Square (Instagram Feed)",
        "wide": "16:9 Landscape (Widescreen)",
        "standard": "4:3 Standard (Classic)"
    },
    "filter_names": {
        "natural": "Natural",
        "luxury": "Golden Luxury",
        "cinema": "Cinema Contrast",
        "clarity": "Max Clarity",
        "monochrome": "Monochrome Pro"
    },
    "badges": {
        "high_standing": "High Standing",
        "immediate": "Immediately Available",
        "favorite": "Top Pick",
        "furnished": "Fully Furnished",
        "security": "24/7 Security",
        "parking": "Secure Parking",
        "water": "Borehole + Camwater",
        "meter": "Independent Meter",
        "access": "Easy Access",
        "quiet": "Residential Area"
    }
}

fr_discovery = {
    "quote_for_material": "Demander un devis pour ce matériau",
    "share": "Partager",
    "share_text": "Découvrez cette vidéo sur Piolo !",
    "certified_artisan": "Artisan Certifié",
    "rewind_10s": "Reculer de 10s",
    "forward_10s": "Avancer de 10s"
}

en_discovery = {
    "quote_for_material": "Request quote for this material",
    "share": "Share",
    "share_text": "Check out this video on Piolo!",
    "certified_artisan": "Certified Craftsman",
    "rewind_10s": "Rewind 10s",
    "forward_10s": "Forward 10s"
}

# Update json files
fr_data['pro'] = fr_pro
fr_data['pro_modals'] = fr_pro_modals
fr_data['pro_dashboard'] = fr_pro_dashboard
fr_data['architects'] = fr_architects
fr_data['tour'] = fr_tour
fr_data['reels'] = fr_reels
fr_data['discovery'] = fr_discovery

en_data['pro'] = en_pro
en_data['pro_modals'] = en_pro_modals
en_data['pro_dashboard'] = en_pro_dashboard
en_data['architects'] = en_architects
en_data['tour'] = en_tour
en_data['reels'] = en_reels
en_data['discovery'] = en_discovery

with open('src/i18n/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, ensure_ascii=False, indent=2)

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("Updated fr.json and en.json with Lot 5 namespaces successfully!")
