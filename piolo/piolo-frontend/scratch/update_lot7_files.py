import os, re

def apply_home_page():
    filepath = 'src/pages/core/HomePage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function HomePage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Toutes les annonces", "{t('home.all_properties')}"),
        ("Logements à Louer", "{t('home.rent')}"),
        ("Studios, appartements et villas d'exception sécurisées", "{t('home.rent_desc')}"),
        ("Biens à Vendre", "{t('home.buy')}"),
        ("Duplex, villas de maître et propriétés titrées", "{t('home.buy_desc')}"),
        ("Courts Séjours &amp; Meublés", "{t('home.short_stay')}"),
        ("Courts Séjours & Meublés", "{t('home.short_stay')}"),
        ("Résidences prêtes à vivre tout confort pour vos séjours", "{t('home.short_stay_desc')}"),
        ("Mode Découverte Reels", "{t('home.reels_discovery')}"),
        ("Mode Découverte en Format Reels", "{t('home.reels_discovery_title')}"),
        ("Swipez verticalement entre les vidéos des logements en plein écran.", "{t('home.reels_discovery_subtitle')}"),
        ("Carte Live", "{t('home.interactive_map_live')}"),
        ("Carte interactive", "{t('home.interactive_map')}"),
        (">Filtres<", ">{t('home.filters')}<"),
        ("Publier une annonce", "{t('home.publish_listing')}"),
        ("1. CNI Vérifiée", "{t('home.trusted_pillars.cni_verified')}"),
        ("Identité officielle de chaque bailleur scannée et authentifiée.", "{t('home.trusted_pillars.cni_verified_desc')}"),
        ("2. Visite d'Audit", "{t('home.trusted_pillars.audit_visit')}"),
        ("Contrôle physique des biens sur place par nos agents certifiés.", "{t('home.trusted_pillars.audit_visit_desc')}"),
        ("3. Contrat Légal", "{t('home.trusted_pillars.legal_contract')}"),
        ("Baux rédigés en conformité avec le droit OHADA au Cameroun.", "{t('home.trusted_pillars.legal_contract_desc')}"),
        ("4. Dépôt Sécurisé", "{t('home.trusted_pillars.secure_deposit')}"),
        ("Paiements et cautions protégés via Orange Money &amp; MTN MoMo.", "{t('home.trusted_pillars.secure_deposit_desc')}"),
        ("Paiements et cautions protégés via Orange Money & MTN MoMo.", "{t('home.trusted_pillars.secure_deposit_desc')}"),
        ("Simulateur IA", "{t('home.budget_calculator.badge')}"),
        ("Calculateur Budget Express", "{t('home.budget_calculator.title')}"),
        ("Nombre de chambres :", "{t('home.budget_calculator.rooms')}"),
        ("Surface habitable :", "{t('home.budget_calculator.surface')}"),
        ("Quartier :", "{t('home.budget_calculator.neighborhood')}"),
        ("Loyer mensuel estimé", "{t('home.budget_calculator.estimated_rent')}"),
        ("Derniers Chantiers en Vitrine", "{t('home.showcase_projects')}"),
        ("Artisans &amp; Architectes Recommandés", "{t('home.recommended_pros')}"),
        ("Artisans & Architectes Recommandés", "{t('home.recommended_pros')}"),
        ("Assistance &amp; Contact", "{t('home.contact_support')}"),
        ("Assistance & Contact", "{t('home.contact_support')}"),
        ("Support 24/7 via WhatsApp &amp; Chatbot Piolo", "{t('home.support_desc')}"),
        ("Support 24/7 via WhatsApp & Chatbot Piolo", "{t('home.support_desc')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("HomePage.jsx updated.")

def apply_rent_estimator():
    filepath = 'src/components/RentEstimatorModal.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function RentEstimatorModal\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Estimateur de Loyer IA", "{t('rent_estimator.title')}"),
        ("Calibré Cameroun 237", "{t('rent_estimator.calibrated')}"),
        ("Calcul en cours…", "{t('rent_estimator.calculating')}"),
        ("ESTIMATION DU MARCHÉ", "{t('rent_estimator.market_estimation')}"),
        ("Facteurs Clés de Valorisation", "{t('rent_estimator.key_factors')}"),
        ("Facteurs de valorisation (Forage, Solaire, Goudron)", "{t('rent_estimator.factors_desc')}"),
        ("Biens Comparables Vérifiés sur Piolo", "{t('rent_estimator.comparables_title')}"),
        ("Biens comparables certifiés sur Piolo", "{t('rent_estimator.comparables_desc')}"),
        ("Fourchette Basse [Min]", "{t('rent_estimator.min_range')}"),
        ("Fourchette Haute [Max]", "{t('rent_estimator.max_range')}"),
        ("Fourchette de négociation [Min - Max]", "{t('rent_estimator.negotiation_range')}"),
        ("Forage Autonome", "{t('rent_estimator.borehole')}"),
        ("Gardiennage 24/7", "{t('rent_estimator.guard')}"),
        ("Distance de l’Axe Principal (Goudron)", "{t('rent_estimator.distance_tarred')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("RentEstimatorModal.jsx updated.")

def apply_support_page():
    filepath = 'src/pages/support/SupportPage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function SupportPage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Assistance instantanée 7j/7", "{t('support.instant_help')}"),
        ("Appel Téléphonique Direct", "{t('support.direct_call')}"),
        ("Du lundi au samedi (8h00 - 19h00)", "{t('support.business_hours')}"),
        ("Envoyer une demande au support", "{t('support.send_request')}"),
        ("Demande transmise avec succès", "{t('support.success_msg')}"),
        (">Objet<", ">{t('support.subject')}<"),
        ("Ouvrir la Carte GPS", "{t('support.open_gps')}"),
        ("Localiser les logements par quartier", "{t('support.locate_neighborhoods')}"),
        ("Sécurité &amp; Confidentialité", "{t('support.security_title')}"),
        ("Sécurité & Confidentialité", "{t('support.security_title')}"),
        ("Mot de passe, CNI et gestion des accès", "{t('support.security_desc')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SupportPage.jsx updated.")

def apply_search_alerts():
    filepath = 'src/pages/properties/SearchAlertsPage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function SearchAlertsPage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Alertes de Recherche", "{t('search_alerts.title')}"),
        ("Ne manquez plus aucune opportunité immobilière", "{t('search_alerts.subtitle')}"),
        ("Soyez averti dès qu’un bien correspond à vos critères.", "{t('search_alerts.notify_hint')}"),
        ("+ Créer ma première alerte", "{t('search_alerts.create_first_btn')}"),
        ("Créer une alerte", "{t('search_alerts.create_btn')}"),
        ("Aucune alerte active", "{t('search_alerts.no_alerts')}"),
        ("Aucun bien ne correspond encore à cette alerte.", "{t('search_alerts.no_matches')}"),
        ("Chargement des annonces correspondantes…", "{t('search_alerts.loading_matches')}"),
        ("Nom de l’alerte *", "{t('search_alerts.alert_name')}"),
        (">Quartier<", ">{t('search_alerts.neighborhood')}<"),
        ("Budget min (FCFA)", "{t('search_alerts.min_budget')}"),
        ("Budget max (FCFA)", "{t('search_alerts.max_budget')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SearchAlertsPage.jsx updated.")

def apply_point_confirmation():
    filepath = 'src/components/PointConfirmationModal.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function PointConfirmationModal\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Action Bailleur Sécurisée", "{t('point_confirmation.title_landlord')}"),
        ("Action Sécurisée Piolo", "{t('point_confirmation.title_secure')}"),
        ("Coût de cette action :", "{t('point_confirmation.action_cost')}"),
        ("Solde actuel :", "{t('point_confirmation.current_balance')}"),
        ("Solde après opération :", "{t('point_confirmation.balance_after')}"),
        ("Points insuffisants :", "{t('point_confirmation.insufficient_points')}"),
        ("Il vous manque", "{t('point_confirmation.missing_points')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("PointConfirmationModal.jsx updated.")

def apply_not_found():
    filepath = 'src/pages/NotFound.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function NotFound\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Retour aux annonces", "{t('not_found.back_to_listings')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("NotFound.jsx updated.")

apply_home_page()
apply_rent_estimator()
apply_support_page()
apply_search_alerts()
apply_point_confirmation()
apply_not_found()
