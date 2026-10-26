import json

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr_data = json.load(f)

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

fr_home = {
    "hero_title": "Trouvez le logement haut standing",
    "hero_subtitle": "qui vous ressemble",
    "all_properties": "Toutes les annonces",
    "rent": "Logements à Louer",
    "rent_desc": "Studios, appartements et villas d'exception sécurisées",
    "buy": "Biens à Vendre",
    "buy_desc": "Duplex, villas de maître et propriétés titrées",
    "short_stay": "Courts Séjours & Meublés",
    "short_stay_desc": "Résidences prêtes à vivre tout confort pour vos séjours",
    "reels_discovery": "Mode Découverte Reels",
    "reels_discovery_title": "Mode Découverte en Format Reels",
    "reels_discovery_subtitle": "Swipez verticalement entre les vidéos des logements en plein écran.",
    "interactive_map": "Carte interactive",
    "interactive_map_live": "Carte Live",
    "filters": "Filtres",
    "publish_listing": "Publier une annonce",
    "trusted_pillars": {
        "cni_verified": "1. CNI Vérifiée",
        "cni_verified_desc": "Identité officielle de chaque bailleur scannée et authentifiée.",
        "audit_visit": "2. Visite d'Audit",
        "audit_visit_desc": "Contrôle physique des biens sur place par nos agents certifiés.",
        "legal_contract": "3. Contrat Légal",
        "legal_contract_desc": "Baux rédigés en conformité avec le droit OHADA au Cameroun.",
        "secure_deposit": "4. Dépôt Sécurisé",
        "secure_deposit_desc": "Paiements et cautions protégés via Orange Money & MTN MoMo."
    },
    "budget_calculator": {
        "badge": "Simulateur IA",
        "title": "Calculateur Budget Express",
        "rooms": "Nombre de chambres :",
        "surface": "Surface habitable :",
        "neighborhood": "Quartier :",
        "estimated_rent": "Loyer mensuel estimé"
    },
    "showcase_projects": "Derniers Chantiers en Vitrine",
    "recommended_pros": "Artisans & Architectes Recommandés",
    "contact_support": "Assistance & Contact",
    "support_desc": "Support 24/7 via WhatsApp & Chatbot Piolo"
}

en_home = {
    "hero_title": "Find high-standing real estate",
    "hero_subtitle": "that matches your lifestyle",
    "all_properties": "All listings",
    "rent": "Properties for Rent",
    "rent_desc": "High standing studios, apartments and secure luxury villas",
    "buy": "Properties for Sale",
    "buy_desc": "Duplexes, master villas and titled land properties",
    "short_stay": "Short Stays & Furnished",
    "short_stay_desc": "Fully equipped turn-key residences for your stays",
    "reels_discovery": "Reels Discovery Mode",
    "reels_discovery_title": "Discovery Mode in Reels Format",
    "reels_discovery_subtitle": "Swipe vertically across fullscreen immersive property videos.",
    "interactive_map": "Interactive Map",
    "interactive_map_live": "Live Map",
    "filters": "Filters",
    "publish_listing": "Post a listing",
    "trusted_pillars": {
        "cni_verified": "1. Verified ID",
        "cni_verified_desc": "Official identity of every landlord scanned and authenticated.",
        "audit_visit": "2. Inspection Audit",
        "audit_visit_desc": "Physical on-site property verification by certified agents.",
        "legal_contract": "3. Legal Contract",
        "legal_contract_desc": "Leases drafted in full compliance with OHADA regulations in Cameroon.",
        "secure_deposit": "4. Protected Deposit",
        "secure_deposit_desc": "Payments and security deposits protected via Orange Money & MTN MoMo."
    },
    "budget_calculator": {
        "badge": "AI Simulator",
        "title": "Express Rent Calculator",
        "rooms": "Number of bedrooms:",
        "surface": "Living area:",
        "neighborhood": "Neighborhood:",
        "estimated_rent": "Estimated monthly rent"
    },
    "showcase_projects": "Showcase Renovation Projects",
    "recommended_pros": "Recommended Craftsmen & Architects",
    "contact_support": "Help & Support",
    "support_desc": "24/7 Support via WhatsApp & Piolo AI Chatbot"
}

fr_rent_estimator = {
    "title": "Estimateur de Loyer IA",
    "calibrated": "Calibré Cameroun 237",
    "calculating": "Calcul en cours…",
    "market_estimation": "ESTIMATION DU MARCHÉ",
    "key_factors": "Facteurs Clés de Valorisation",
    "factors_desc": "Facteurs de valorisation (Forage, Solaire, Goudron)",
    "comparables_title": "Biens Comparables Vérifiés sur Piolo",
    "comparables_desc": "Biens comparables certifiés sur Piolo",
    "min_range": "Fourchette Basse [Min]",
    "max_range": "Fourchette Haute [Max]",
    "negotiation_range": "Fourchette de négociation [Min - Max]",
    "borehole": "Forage Autonome",
    "guard": "Gardiennage 24/7",
    "distance_tarred": "Distance de l’Axe Principal (Goudron)",
    "types": {
        "apartment": "Appartement",
        "duplex": "Duplex",
        "room": "Chambre",
        "office": "Bureau"
    }
}

en_rent_estimator = {
    "title": "AI Rent Estimator",
    "calibrated": "Calibrated for Cameroon 237",
    "calculating": "Calculating…",
    "market_estimation": "MARKET ESTIMATION",
    "key_factors": "Key Valuation Factors",
    "factors_desc": "Valuation factors (Borehole, Solar, Tarred road)",
    "comparables_title": "Verified Comparable Listings on Piolo",
    "comparables_desc": "Certified comparable properties on Piolo",
    "min_range": "Low Range [Min]",
    "max_range": "High Range [Max]",
    "negotiation_range": "Negotiation range [Min - Max]",
    "borehole": "Autonomous Borehole",
    "guard": "24/7 Security Guard",
    "distance_tarred": "Distance to Main Road (Tarred)",
    "types": {
        "apartment": "Apartment",
        "duplex": "Duplex",
        "room": "Room",
        "office": "Office"
    }
}

fr_support = {
    "title": "Support & Assistance",
    "instant_help": "Assistance instantanée 7j/7",
    "direct_call": "Appel Téléphonique Direct",
    "business_hours": "Du lundi au samedi (8h00 - 19h00)",
    "send_request": "Envoyer une demande au support",
    "success_msg": "Demande transmise avec succès",
    "subject": "Objet",
    "open_gps": "Ouvrir la Carte GPS",
    "locate_neighborhoods": "Localiser les logements par quartier",
    "security_title": "Sécurité & Confidentialité",
    "security_desc": "Mot de passe, CNI et gestion des accès",
    "topics": {
        "rent_cni": "Dossier de location / Justificatifs CNI",
        "payments_deposit": "Paiement / Frais de réservation",
        "landlord_listings": "Publication d'annonce / Bailleur",
        "visits": "Question sur une visite / RDV",
        "points": "Points & Fidélité",
        "other": "Autre assistance"
    }
}

en_support = {
    "title": "Support & Help Center",
    "instant_help": "Instant assistance 7d/7",
    "direct_call": "Direct Phone Call",
    "business_hours": "Monday to Saturday (8:00 AM - 7:00 PM)",
    "send_request": "Send a support request",
    "success_msg": "Request submitted successfully",
    "subject": "Subject",
    "open_gps": "Open GPS Map",
    "locate_neighborhoods": "Locate listings by neighborhood",
    "security_title": "Security & Privacy",
    "security_desc": "Password, ID card and access management",
    "topics": {
        "rent_cni": "Rental application / ID documents",
        "payments_deposit": "Payment / Booking fees",
        "landlord_listings": "Listing publication / Landlord",
        "visits": "Question about a visit / Appointment",
        "points": "Points & Loyalty",
        "other": "Other assistance"
    }
}

fr_search_alerts = {
    "title": "Alertes de Recherche",
    "subtitle": "Ne manquez plus aucune opportunité immobilière",
    "notify_hint": "Soyez averti dès qu’un bien correspond à vos critères.",
    "create_first_btn": "+ Créer ma première alerte",
    "create_btn": "Créer une alerte",
    "no_alerts": "Aucune alerte active",
    "no_matches": "Aucun bien ne correspond encore à cette alerte.",
    "loading_matches": "Chargement des annonces correspondantes…",
    "alert_name": "Nom de l’alerte *",
    "neighborhood": "Quartier",
    "min_budget": "Budget min (FCFA)",
    "max_budget": "Budget max (FCFA)",
    "cancel": "Annuler"
}

en_search_alerts = {
    "title": "Search Alerts",
    "subtitle": "Never miss a real estate opportunity again",
    "notify_hint": "Get notified as soon as a property matches your criteria.",
    "create_first_btn": "+ Create my first alert",
    "create_btn": "Create an alert",
    "no_alerts": "No active search alerts",
    "no_matches": "No property matches this alert yet.",
    "loading_matches": "Loading matching properties…",
    "alert_name": "Alert name *",
    "neighborhood": "Neighborhood",
    "min_budget": "Min budget (FCFA)",
    "max_budget": "Max budget (FCFA)",
    "cancel": "Cancel"
}

fr_point_confirmation = {
    "title_secure": "Action Sécurisée Piolo",
    "title_landlord": "Action Bailleur Sécurisée",
    "action_cost": "Coût de cette action :",
    "current_balance": "Solde actuel :",
    "balance_after": "Solde après opération :",
    "insufficient_points": "Points insuffisants :",
    "missing_points": "Il vous manque"
}

en_point_confirmation = {
    "title_secure": "Piolo Secure Action",
    "title_landlord": "Landlord Secure Action",
    "action_cost": "Cost of this action:",
    "current_balance": "Current balance:",
    "balance_after": "Balance after transaction:",
    "insufficient_points": "Insufficient points:",
    "missing_points": "You are missing"
}

fr_onboarding = {
    "btn_continue": "Continuer",
    "favorite_saved": "Favori enregistré",
    "favorite_desc": "Le cœur doré ajoute une annonce à vos favoris. Vos biens sauvegardés restent accessibles depuis votre espace.",
    "search_alert_active": "Alerte active",
    "search_alert_desc": "Créez une alerte de recherche et Piolo vous préviendra lorsqu’un bien correspondant sera trouvé.",
    "listing_online": "Annonce en ligne",
    "immersive_content": "Contenu immersif",
    "discovery_mode": "Passez en mode découverte",
    "smart_search": "Recherche intelligente"
}

en_onboarding = {
    "btn_continue": "Continue",
    "favorite_saved": "Saved favorite",
    "favorite_desc": "The gold heart adds a listing to your favorites. Your saved properties remain accessible anytime from your space.",
    "search_alert_active": "Active alert",
    "search_alert_desc": "Create a search alert and Piolo will notify you as soon as a matching property is listed.",
    "listing_online": "Listing online",
    "immersive_content": "Immersive content",
    "discovery_mode": "Switch to discovery mode",
    "smart_search": "Smart search"
}

fr_not_found = {
    "title": "Page non trouvée",
    "description": "La page que vous recherchez semble introuvable ou a été déplacée.",
    "back_to_listings": "Retour aux annonces"
}

en_not_found = {
    "title": "Page Not Found",
    "description": "The page you are looking for could not be found or has been moved.",
    "back_to_listings": "Back to listings"
}

# Update dictionary
fr_data['home'] = fr_home
fr_data['rent_estimator'] = fr_rent_estimator
fr_data['support'] = fr_support
fr_data['search_alerts'] = fr_search_alerts
fr_data['point_confirmation'] = fr_point_confirmation
fr_data['onboarding'] = fr_onboarding
fr_data['not_found'] = fr_not_found

en_data['home'] = en_home
en_data['rent_estimator'] = en_rent_estimator
en_data['support'] = en_support
en_data['search_alerts'] = en_search_alerts
en_data['point_confirmation'] = en_point_confirmation
en_data['onboarding'] = en_onboarding
en_data['not_found'] = en_not_found

with open('src/i18n/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, ensure_ascii=False, indent=2)

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("Updated locales for Lot 7 successfully!")
