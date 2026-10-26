import re

with open('src/components/StudioReelEditor.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add i18n import
if "import i18n from '../i18n';" not in content and "import i18n from '../i18n/index';" not in content:
    content = "import i18n from '../i18n';\n" + content

# Fix top-level PRO_BADGES
badges_code = """const PRO_BADGES = [
  { id: 'coup_de_coeur',   label: 'Coup de Cœur',         tag: 'Coup de Cœur',         text: '[Coup de Cœur]',         icon: Icons.Star },
  { id: 'standing_luxe',   label: 'Haut Standing',        tag: 'Haut Standing',        text: '[Haut Standing]',        icon: Icons.Diamond },
  { id: 'dispo_immediat',  label: 'Dispo Immédiate',      tag: 'Dispo Immédiate',      text: '[Dispo Immédiate]',      icon: Icons.Bolt },
  { id: 'meuble_moderne',  label: 'Entièrement Meublé',   tag: 'Meublé & Équipé',      text: '[Meublé & Équipé]',      icon: Icons.Home },
  { id: 'forage_camwater', label: 'Forage + Camwater',    tag: 'Eau H24 Forage',       text: '[Eau H24 Forage]',       icon: Icons.Droplet },
  { id: 'securise_247',    label: 'Sécurisé 24/7',        tag: 'Sécurité 24/7',        text: '[Sécurité 24/7]',        icon: Icons.Shield },
  { id: 'compteur_indep',  label: 'Compteur Indépendant', tag: 'Compteur Dédié',       text: '[Compteur Dédié]',       icon: Icons.Zap },
  { id: 'parking_garde',   label: 'Parking Sécurisé',     tag: 'Parking Inclus',       text: '[Parking Inclus]',       icon: Icons.Car },
  { id: 'proche_goudron',  label: 'Accès Facile',         tag: 'Axe Principal',        text: '[Axe Principal]',        icon: Icons.MapPin },
  { id: 'quartier_calme',  label: 'Quartier Résidentiel', tag: 'Quartier Calme',       text: '[Quartier Calme]',       icon: Icons.Tree },
];"""

content = re.sub(r'const PRO_BADGES = \[[\s\S]*?\];', badges_code, content)

with open('src/components/StudioReelEditor.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("StudioReelEditor.jsx updated.")
