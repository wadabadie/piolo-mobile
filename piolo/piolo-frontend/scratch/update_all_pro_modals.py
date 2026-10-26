import os, re

def update_file(filepath, component_fn_regex, str_replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(component_fn_regex, r'\1\n  const { t } = useTranslation();', content)

    for old, new in str_replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: '{old[:40]}' not found in {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"{filepath} updated.")

# 1. ProEscrowModal.jsx
update_file(
    'src/components/ProEscrowModal.jsx',
    r'(export default function ProEscrowModal\s*\([^{]*\)\s*\{)',
    [
        ("Garantie Piolo Protec (0% Risque)", "{t('pro_modals.escrow.title')}"),
        ("Acompte de démarrage (30%)", "{t('pro_modals.escrow.down_payment')}"),
        ("Frais de protection &amp; séquestre Piolo (5%)", "{t('pro_modals.escrow.escrow_fees')}"),
        ("Frais de protection & séquestre Piolo (5%)", "{t('pro_modals.escrow.escrow_fees')}"),
        ("Total à payer", "{t('pro_modals.escrow.total_to_pay')}"),
        ("Orange Money", "{t('pro_modals.escrow.orange_money')}"),
        ("MTN MoMo", "{t('pro_modals.escrow.mtn_momo')}"),
        ('placeholder="Ex: 699 00 11 22"', 'placeholder={t("pro_modals.escrow.phone_placeholder")}'),
        ("Comment fonctionne la garantie ?", "{t('pro_modals.escrow.how_it_works')}"),
    ]
)

# 2. ProBudgetCalculator.jsx
update_file(
    'src/components/ProBudgetCalculator.jsx',
    r'(export default function ProBudgetCalculator\s*\([^{]*\)\s*\{)',
    [
        ("Simulateur Officiel Piolo Habitat", "{t('pro_modals.budget.official_simulator')}"),
        ("Travaux &amp; Mobilier", "{t('pro_modals.budget.title_highlight')}"),
        ("Travaux & Mobilier", "{t('pro_modals.budget.title_highlight')}"),
        ("Simuler mon budget travaux &amp; mobilier", "{t('pro_modals.budget.cta_simulate')}"),
        ("Simuler mon budget travaux & mobilier", "{t('pro_modals.budget.cta_simulate')}"),
        ("Yaoundé (Bastos, Golf, Odza, Soa...)", "{t('pro.cities.yaounde')}"),
        ("Douala (Bonapriso, Akwa, Makepe, Bonanjo...)", "{t('pro.cities.douala')}"),
        ("Autre région (Kribi, Bafoussam, Limbe...)", "{t('pro.cities.other')}"),
    ]
)

# 3. ProQuoteRequestModal.jsx
update_file(
    'src/components/ProQuoteRequestModal.jsx',
    r'(export default function ProQuoteRequestModal\s*\([^{]*\)\s*\{)',
    [
        ("Devis Express Sans Engagement", "{t('pro_modals.quote_request.badge')}"),
        ('placeholder="Ex: Mur de 3m x 2.6m, ou 45m²"', 'placeholder={t("pro_modals.quote_request.dimensions_placeholder")}'),
        ("Bois noble d'Iroko (Très résistant)", "{t('pro_modals.quote_request.materials.iroko')}"),
        ("Padouk d'Afrique", "{t('pro_modals.quote_request.materials.padouk')}"),
        ("Mélaminé Haute Densité &amp; LED", "{t('pro_modals.quote_request.materials.melamine_led')}"),
        ("Mélaminé Haute Densité & LED", "{t('pro_modals.quote_request.materials.melamine_led')}"),
        ("Résine Époxy &amp; Métal Noir", "{t('pro_modals.quote_request.materials.epoxy_metal')}"),
        ("Résine Époxy & Métal Noir", "{t('pro_modals.quote_request.materials.epoxy_metal')}"),
        ("Carrelage Grand Format 60x120", "{t('pro_modals.quote_request.materials.tiling_large')}"),
        ("Staff &amp; Spots Encastrés", "{t('pro_modals.quote_request.materials.staff_spots')}"),
        ("Staff & Spots Encastrés", "{t('pro_modals.quote_request.materials.staff_spots')}"),
        ("Facultatif — Je préfère recevoir le devis de l'artisan", "{t('pro_modals.quote_request.budget_ranges.unspecified')}"),
        ("Moins de 250 000 FCFA", "{t('pro_modals.quote_request.budget_ranges.under_250k')}"),
        ("250 000 - 500 000 FCFA", "{t('pro_modals.quote_request.budget_ranges.250k_500k')}"),
        ("500 000 - 1 500 000 FCFA", "{t('pro_modals.quote_request.budget_ranges.500k_15m')}"),
        ("Plus de 1 500 000 FCFA", "{t('pro_modals.quote_request.budget_ranges.over_15m')}"),
        ("Urgent (< 7 jours)", "{t('pro_modals.quote_request.urgency.urgent')}"),
        ("Urgent (&lt; 7 jours)", "{t('pro_modals.quote_request.urgency.urgent')}"),
        ("Dès que possible (< 2 semaines)", "{t('pro_modals.quote_request.urgency.asap')}"),
        ("Dès que possible (&lt; 2 semaines)", "{t('pro_modals.quote_request.urgency.asap')}"),
        ("Dans le mois", "{t('pro_modals.quote_request.urgency.in_month')}"),
        ("Projet futur / Simple étude", "{t('pro_modals.quote_request.urgency.future')}"),
        ('placeholder="Ex: Yvan Pangtampoe"', 'placeholder={t("pro_modals.quote_request.client_name_placeholder")}'),
        ('placeholder="Ex: 699 00 11 22"', 'placeholder={t("pro_modals.quote_request.client_phone_placeholder")}'),
        ('placeholder="Ex: Douala, Bonamoussadi"', 'placeholder={t("pro_modals.quote_request.client_city_placeholder")}'),
        ("Mise en relation directe certifiée", "{t('pro_modals.quote_request.certified_match')}"),
        ("Transmission instantanée du cahier des charges à l'artisan", "{t('pro_modals.quote_request.instant_dispatch')}"),
        ("Envoi en cours...", "{t('pro_modals.quote_request.sending')}"),
        ("Envoyer ma Demande (-2 Pts)", "{t('pro_modals.quote_request.submit_btn')}"),
        ("Envoyer également sur WhatsApp", "{t('pro_modals.quote_request.send_whatsapp')}"),
    ]
)

# 4. ProQuoteDetailModal.jsx
update_file(
    'src/components/ProQuoteDetailModal.jsx',
    r'(export default function ProQuoteDetailModal\s*\([^{]*\)\s*\{)',
    [
        ("Dossier Devis Client", "{t('pro_modals.quote_detail.title')}"),
        ("BUDGET ESTIMÉ", "{t('pro_modals.quote_detail.estimated_budget')}"),
        ("DÉLAI SOUHAITÉ", "{t('pro_modals.quote_detail.desired_timeline')}"),
        ("LOCALISATION", "{t('pro_modals.quote_detail.location')}"),
        ("Appeler le client", "{t('pro_modals.quote_detail.call_client')}"),
        ("Répondre sur WhatsApp", "{t('pro_modals.quote_detail.reply_whatsapp')}"),
    ]
)

# 5. ProDeleteConfirmModal.jsx
update_file(
    'src/components/ProDeleteConfirmModal.jsx',
    r'(export default function ProDeleteConfirmModal\s*\([^{]*\)\s*\{)',
    [
        ("Supprimer cette réalisation ?", "{t('pro_modals.delete_confirm.title')}"),
        ("Ce chantier ne sera plus visible par les locataires et les bailleurs dans l'annuaire public.", "{t('pro_modals.delete_confirm.warning')}"),
        ("Supprimer définitivement", "{t('pro_modals.delete_confirm.confirm')}"),
        ("Annuler", "{t('common.cancel')}"),
    ]
)

# 6. ProPublishConfirmModal.jsx
update_file(
    'src/components/ProPublishConfirmModal.jsx',
    r'(export default function ProPublishConfirmModal\s*\([^{]*\)\s*\{)',
    [
        ("Publier ce chantier en vitrine ?", "{t('pro_modals.publish_confirm.title')}"),
        ("Solde de points actuel :", "{t('pro_modals.publish_confirm.current_balance')}"),
        ("Coût de publication :", "{t('pro_modals.publish_confirm.cost')}"),
        ("Nouveau solde restant :", "{t('pro_modals.publish_confirm.new_balance')}"),
        ("Publication en cours...", "{t('pro_modals.publish_confirm.publishing')}"),
        ("Confirmer la publication", "{t('pro_modals.publish_confirm.confirm')}"),
        ("Annuler", "{t('common.cancel')}"),
    ]
)

# 7. ProAddProjectModal.jsx
update_file(
    'src/components/ProAddProjectModal.jsx',
    r'(export default function ProAddProjectModal\s*\([^{]*\)\s*\{)',
    [
        ("Vitrine Professionnelle", "{t('pro_modals.add_project.badge')}"),
        ('placeholder="Ex: Meuble TV Mural Flottant en Bois d\'Iroko & LED"', 'placeholder={t("pro_modals.add_project.title_placeholder")}'),
        ('placeholder="Ex: Yaoundé, Bastos"', 'placeholder={t("pro_modals.add_project.location_placeholder")}'),
        ('placeholder="Ex: 10 jours ou 3 semaines"', 'placeholder={t("pro_modals.add_project.duration_placeholder")}'),
        ('placeholder="Ex: 450000"', 'placeholder={t("pro_modals.add_project.cost_placeholder")}'),
        ("Photos Principales (Génération automatique du Slider Avant / Après)", "{t('pro_modals.add_project.main_photos_title')}"),
        ("Ajouter la photo Avant", "{t('pro_modals.add_project.add_before_photo')}"),
        ("Mur brut, pièce avant rénovation", "{t('pro_modals.add_project.before_photo_desc')}"),
        ("Ajouter la photo Après (Obligatoire)", "{t('pro_modals.add_project.add_after_photo')}"),
        ("Résultat final soigné", "{t('pro_modals.add_project.after_photo_desc')}"),
        ("Angles de vue, détails des assemblages, gros plans", "{t('pro_modals.add_project.gallery_desc')}"),
        ("+ Ajouter photo", "{t('pro_modals.add_project.add_photo_btn')}"),
        ("Visible dans les détails du projet et dans le Mode Découverte (MP4, WebM, MOV)", "{t('pro_modals.add_project.videos_desc')}"),
        ('placeholder="Titre de la vidéo (ex: Visite finale)"', 'placeholder={t("pro_modals.add_project.video_title_placeholder")}'),
        ("+ Ajouter une vidéo", "{t('pro_modals.add_project.add_video_btn')}"),
        ("Visite guidée, réalisation (max 50 Mo)", "{t('pro_modals.add_project.video_upload_desc')}"),
        ('placeholder="Ex: Bois d\'Iroko massif, Spots LED 3000K, Coulisses amorties Blum, Laque noire mate"', 'placeholder={t("pro_modals.add_project.materials_placeholder")}'),
        ('placeholder="Décrivez les étapes du chantier, les contraintes surmontées, les dimensions et les garanties offertes au client..."', 'placeholder={t("pro_modals.add_project.description_placeholder")}'),
        ("Menuiserie &amp; Mobilier sur-mesure", "{t('pro.categories.carpentry_custom')}"),
        ("Cuisiniste &amp; Dressings", "{t('pro.categories.kitchen')}"),
        ("Architecture &amp; Plans 3D", "{t('pro.categories.architecture_3d')}"),
        ("Rénovation &amp; Finitions BTP", "{t('pro.categories.renovation')}"),
        ("Carrelage &amp; Faux Plafonds", "{t('pro.categories.tiling')}"),
        ("Électricité &amp; Éclairage LED", "{t('pro.categories.electricity_led')}"),
        ("Plomberie &amp; Sanitaires", "{t('pro.categories.plumbing_sanitary')}"),
    ]
)

# 8. ProProjectDetailModal.jsx
update_file(
    'src/components/ProProjectDetailModal.jsx',
    r'(export default function ProProjectDetailModal\s*\([^{]*\)\s*\{)',
    [
        ("Photo Finale", "{t('pro_modals.project_detail.final_photo')}"),
        ("Avant / Après", "{t('pro_modals.project_detail.before_after')}"),
        ("Cliquer pour agrandir", "{t('pro_modals.project_detail.click_to_zoom')}"),
        ("Coût indicatif", "{t('pro.indicative_cost')}"),
        ("Artisan Réalisateur", "{t('pro_modals.project_detail.artisan_author')}"),
        ("Localisation", "{t('pro.location')}"),
        ("Durée de Chantier", "{t('pro.work_duration')}"),
        ("Contrôle Piolo", "{t('pro.piolo_control')}"),
        ("Chantier Certifié", "{t('pro.certified_project')}"),
        ("Discuter sur WhatsApp", "{t('pro_modals.project_detail.chat_whatsapp')}"),
    ]
)

# 9. ProProfileDetailModal.jsx
update_file(
    'src/components/ProProfileDetailModal.jsx',
    r'(export default function ProProfileDetailModal\s*\([^{]*\)\s*\{)',
    [
        ("Artisan Certifié Piolo", "{t('pro.certified_artisan')}"),
        ("WhatsApp Direct", "{t('pro.whatsapp_direct')}"),
        ("Voir le chantier complet", "{t('pro.view_project')}"),
        ("Laisser une note &amp; un commentaire", "{t('pro_modals.profile_detail.review_prompt')}"),
        ("Laisser une note & un commentaire", "{t('pro_modals.profile_detail.review_prompt')}"),
        ('placeholder="Qualité du travail, respect des délais, propreté du chantier..."', 'placeholder={t("pro_modals.profile_detail.review_placeholder")}'),
        ("Implantation &amp; Rayon d’Action", "{t('pro_modals.profile_detail.location_action')}"),
        ("Implantation & Rayon d’Action", "{t('pro_modals.profile_detail.location_action')}"),
        ("Itinéraire Google Maps", "{t('pro.google_maps')}"),
        ("VILLE PRINCIPALE", "{t('pro.main_city')}"),
        ("SECTEURS DE DÉPLACEMENT", "{t('pro.travel_sectors')}"),
        ("DISPONIBILITÉ ATELIER", "{t('pro.workshop_availability')}"),
        ("Zone d'intervention", "{t('pro.service_area')}"),
        ("Années d'expérience", "{t('pro.years_experience')}"),
        ("Tarif indicatif", "{t('pro.indicative_price')}"),
        ("Sur devis gratuit", "{t('pro.free_quote')}"),
    ]
)

print("All Pro modals successfully updated!")
