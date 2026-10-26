import os, re

# 1. ArchitectsPage.jsx
def update_architects():
    filepath = 'src/pages/properties/ArchitectsPage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function ArchitectsPage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Professionnels &amp; Artisans", "{t('architects.title')}"),
        ("Professionnels & Artisans", "{t('architects.title')}"),
        ("Mode Découverte Vidéos", "{t('architects.badge_discovery')}"),
        ("Calculateur de Budget", "{t('architects.btn_budget_calc')}"),
        ("Réseau d'Experts de l'Habitat Piolo", "{t('architects.hero_title')}"),
        ("Simuler mon budget travaux &amp; mobilier", "{t('architects.simulate_budget_btn')}"),
        ("Simuler mon budget travaux & mobilier", "{t('architects.simulate_budget_btn')}"),
        ('placeholder="Rechercher par métier, compétence (ex: Meuble TV, Plomberie, Plans 3D)..."', 'placeholder={t("architects.search_placeholder")}'),
        ("Derniers Chantiers &amp; Transformations en Vitrine", "{t('architects.showcase_title')}"),
        ("Derniers Chantiers & Transformations en Vitrine", "{t('architects.showcase_title')}"),
        ("Glisser ➔", "{t('architects.swipe_hint')}"),
        ("Vidéo HD", "{t('architects.badge_hd_video')}"),
        (">Par<", ">{t('architects.by')}<"),
        ("Voir détails →", "{t('architects.see_details')}"),
        ("Aucun artisan ne correspond à ces critères", "{t('architects.empty_title')}"),
        ("Essayez d'élargir vos filtres de recherche ou de ville.", "{t('architects.empty_subtitle')}"),
        ("Demander un devis", "{t('architects.quote_btn')}"),
        ("Voir profil", "{t('architects.profile_btn')}"),
        ("Tous les Métiers", "{t('pro.categories.all')}"),
        ("Toutes les villes", "{t('pro.cities.all')}"),
        ("Yaoundé (Grand Yaoundé &amp; Soa)", "{t('pro.cities.yaounde')}"),
        ("Douala (Grand Douala &amp; Bonabéri)", "{t('pro.cities.douala')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("ArchitectsPage.jsx updated!")

# 2. TourViewer.jsx
def update_tour_viewer():
    filepath = 'src/pages/properties/TourViewer.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function TourViewer\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("🖱️ Glissez pour tourner • 🔍 Molette pour zoomer", "{t('tour.viewer_hint')}"),
        ("Quitter la visite", "{t('tour.exit_tour')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("TourViewer.jsx updated!")

# 3. TourEditor.jsx
def update_tour_editor():
    filepath = 'src/pages/properties/TourEditor.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function TourEditor\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("+ Pièce 360°", "{t('tour.editor.add_room_btn')}"),
        ("Chargement des pièces…", "{t('tour.editor.loading_rooms')}"),
        ("Aucune pièce ajoutée", "{t('tour.editor.no_rooms')}"),
        ("Importez votre première photo 360° pour commencer.", "{t('tour.editor.no_rooms_desc')}"),
        ("Supprimer cette pièce", "{t('tour.editor.delete_room')}"),
        ("Visualiser", "{t('tour.editor.visualize')}"),
        ("+ Placer Porte (Hotspot)", "{t('tour.editor.place_hotspot')}"),
        ("Aucune pièce 360°", "{t('tour.editor.no_room_360')}"),
        ("+ Nouvelle pièce", "{t('tour.editor.new_room')}"),
        ("Ajouter une pièce 360°", "{t('tour.editor.modal_title')}"),
        ('placeholder="Ex: Salon Principal, Chambre, Balcon…"', 'placeholder={t("tour.editor.room_name_placeholder")}'),
        ("✓ Photo panoramique prête", "{t('tour.editor.photo_ready')}"),
        ("Choisir la photo 360°", "{t('tour.editor.choose_photo')}"),
        ("Format JPG, PNG panoramique 2:1", "{t('tour.editor.format_hint')}"),
        ("Relier à une autre pièce", "{t('tour.editor.link_to_room')}"),
        ("-- Sélectionner la pièce de destination --", "{t('tour.editor.select_destination')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("TourEditor.jsx updated!")

# 4. StudioReelEditor.jsx
def update_studio_reels():
    filepath = 'src/components/StudioReelEditor.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function StudioReelEditor\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("STUDIO PRO", "{t('reels.studio_title')}"),
        (">Fermer<", ">{t('reels.close')}<"),
        ("Changer clip", "{t('reels.change_clip')}"),
        ("Aucun clip sélectionné", "{t('reels.no_clip')}"),
        ("Miroir", "{t('reels.mirror')}"),
        ("Revenir au début", "{t('reels.restart')}"),
        ("Format & Cadrage", "{t('reels.aspect_ratio')}"),
        ("Format &amp; Cadrage", "{t('reels.aspect_ratio')}"),
        ("Découper la séquence", "{t('reels.trim')}"),
        ("Réinitialiser les bornes", "{t('reels.reset_bounds')}"),
        ("Vitesse de la visite", "{t('reels.speed')}"),
        ("Astuce Pro", "{t('reels.pro_tip')}"),
        ("Filtres & Étalonnage", "{t('reels.filters')}"),
        ("Filtres &amp; Étalonnage", "{t('reels.filters')}"),
        ("Réinitialiser les filtres", "{t('reels.reset_filters')}"),
        ("Description & Modèles", "{t('reels.desc_templates')}"),
        ("Description &amp; Modèles", "{t('reels.desc_templates')}"),
        ("Haut Standing", "{t('reels.badges.high_standing')}"),
        ("Dispo Immédiate", "{t('reels.badges.immediate')}"),
        ("Coup de Cœur", "{t('reels.badges.favorite')}"),
        ("Entièrement Meublé", "{t('reels.badges.furnished')}"),
        ("Sécurisé 24/7", "{t('reels.badges.security')}"),
        ("Parking Sécurisé", "{t('reels.badges.parking')}"),
        ("Forage + Camwater", "{t('reels.badges.water')}"),
        ("Compteur Indépendant", "{t('reels.badges.meter')}"),
        ("Accès Facile", "{t('reels.badges.access')}"),
        ("Quartier Résidentiel", "{t('reels.badges.quiet')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("StudioReelEditor.jsx updated!")

# 5. DiscoveryPage.jsx
def update_discovery():
    filepath = 'src/pages/properties/DiscoveryPage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function DiscoveryPage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Demander un devis pour ce matériau", "{t('discovery.quote_for_material')}"),
        (">Partager<", ">{t('discovery.share')}<"),
        ("Artisan Certifié", "{t('discovery.certified_artisan')}"),
        ("Reculer de 10s", "{t('discovery.rewind_10s')}"),
        ("Avancer de 10s", "{t('discovery.forward_10s')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("DiscoveryPage.jsx updated!")

# 6. ProDiscoveryVideoModal.jsx
def update_discovery_video_modal():
    filepath = 'src/components/ProDiscoveryVideoModal.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function ProDiscoveryVideoModal\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Aucune vidéo disponible pour le moment", "{t('pro_modals.discovery_video.empty')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("ProDiscoveryVideoModal.jsx updated!")

update_architects()
update_tour_viewer()
update_tour_editor()
update_studio_reels()
update_discovery()
update_discovery_video_modal()
