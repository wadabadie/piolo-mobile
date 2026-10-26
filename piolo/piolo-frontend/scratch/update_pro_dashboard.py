import os, re

# Update Pro Dashboard
def update_pro_dashboard():
    filepath = 'src/pages/pro/Dashboard.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function ProDashboard\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        (">Professionnel<", ">{t('pro_dashboard.badge_pro')}<"),
        ("Nombre total de clients ayant consulté votre profil professionnel", "{t('pro_dashboard.views_tooltip')}"),
        (">Vues<", ">{t('pro_dashboard.views')}<"),
        ("Cliquer pour recharger vos points ou gérer votre abonnement", "{t('pro_dashboard.points_tooltip')}"),
        ("Profil Professionnel Certifié", "{t('pro_dashboard.certified_profile')}"),
        ("Ajouter une réalisation", "{t('pro_dashboard.add_project')}"),
        ("Voir l’annuaire public", "{t('pro_dashboard.public_directory')}"),
        ("Nouveau Projet", "{t('pro_dashboard.new_project')}"),
        ("Aucune réalisation pour l'instant", "{t('pro_dashboard.no_projects')}"),
        ("Cliquer pour voir la fiche détaillée de ce chantier", "{t('pro_dashboard.click_to_view_details')}"),
        ("Supprimer la réalisation", "{t('pro_dashboard.delete_project')}"),
        ("Aperçu Détails Chantier", "{t('pro_dashboard.project_details_preview')}"),
        ("Aucune demande de devis reçue pour le moment", "{t('pro_dashboard.no_quotes')}"),
        ("Les demandes envoyées par les locataires et bailleurs apparaîtront directement ici.", "{t('pro_dashboard.quotes_desc')}"),
        ("Enregistrement en cours...", "{t('pro_dashboard.saving')}"),
        ("Enregistrer les modifications", "{t('pro_dashboard.save_changes')}"),
        ("Indicateur de Performance &amp; Conversion", "{t('pro_dashboard.conversion_indicator')}"),
        ("Indicateur de Performance & Conversion", "{t('pro_dashboard.conversion_indicator')}"),
        ("Mon Portfolio &amp; Réalisations", "{t('pro_dashboard.tabs.portfolio')}"),
        ("Mon Portfolio & Réalisations", "{t('pro_dashboard.tabs.portfolio')}"),
        ("Demandes de Devis &amp; Messages", "{t('pro_dashboard.tabs.quotes')}"),
        ("Demandes de Devis & Messages", "{t('pro_dashboard.tabs.quotes')}"),
        ("Visibilité &amp; Statistiques", "{t('pro_dashboard.tabs.stats')}"),
        ("Visibilité & Statistiques", "{t('pro_dashboard.tabs.stats')}"),
        ("Configuration Métier &amp; Tarifs", "{t('pro_dashboard.tabs.settings')}"),
        ("Configuration Métier & Tarifs", "{t('pro_dashboard.tabs.settings')}"),
        ("Yaoundé (Grand Yaoundé &amp; Soa)", "{t('pro.cities.yaounde')}"),
        ("Douala (Grand Douala &amp; Bonabéri)", "{t('pro.cities.douala')}"),
        ("Bafoussam (Ouest)", "{t('pro.cities.bafoussam')}"),
        ("Kribi (Océan &amp; Littoral)", "{t('pro.cities.kribi')}"),
        ("Limbé (Sud-Ouest)", "{t('pro.cities.limbe')}"),
        ("Bamenda (Nord-Ouest)", "{t('pro.cities.bamenda')}"),
        ("Garoua (Nord)", "{t('pro.cities.garoua')}"),
        ("Maroua (Extrême-Nord)", "{t('pro.cities.maroua')}"),
        ("Ngaoundéré (Adamaoua)", "{t('pro.cities.ngaoundere')}"),
        ("Bertoua (Est)", "{t('pro.cities.bertoua')}"),
        ("Ebolowa (Sud)", "{t('pro.cities.ebolowa')}"),
        ("Dschang (Menoua)", "{t('pro.cities.dschang')}"),
        ("Buea (Sud-Ouest)", "{t('pro.cities.buea')}"),
        ("Menuiserie, Mobilier & Déco", "{t('pro.categories.carpentry')}"),
        ("Architecture, Ingénierie & BTP", "{t('pro.categories.architecture')}"),
        ("Plomberie, Électricité & Énergie", "{t('pro.categories.electricity')}"),
        ("Extérieur, Jardin & Sécurité", "{t('pro.categories.exterior')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Dashboard.jsx updated!")

update_pro_dashboard()
