import re

# 1. Dashboard.jsx
with open('src/pages/pro/Dashboard.jsx', 'r', encoding='utf-8') as f:
    dash = f.read()

dash = re.sub(r"\'\{t\(([^\)]+)\)\}\'", r"'\1'", dash)
dash = dash.replace("name: 'pro.categories.carpentry'", "name: 'Menuiserie, Mobilier & Déco'")
dash = dash.replace("name: 'pro.categories.architecture'", "name: 'Architecture, Ingénierie & BTP'")
dash = dash.replace("name: 'pro.categories.electricity'", "name: 'Plomberie, Électricité & Énergie'")
dash = dash.replace("name: 'pro.categories.exterior'", "name: 'Extérieur, Jardin & Sécurité'")

with open('src/pages/pro/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dash)

# 2. DiscoveryPage.jsx
with open('src/pages/properties/DiscoveryPage.jsx', 'r', encoding='utf-8') as f:
    disc = f.read()

disc = re.sub(r"\'\{t\(([^\)]+)\)\}\'", r"t(\1)", disc)
with open('src/pages/properties/DiscoveryPage.jsx', 'w', encoding='utf-8') as f:
    f.write(disc)

# 3. StudioReelEditor.jsx
with open('src/components/StudioReelEditor.jsx', 'r', encoding='utf-8') as f:
    studio = f.read()

studio = re.sub(r"\'\{t\(([^\)]+)\)\}\'", r"t(\1)", studio)
studio = studio.replace("'{t('reels.mirror')} Actif (Inversé)'", "`Active (Inversed)`")
studio = studio.replace("'{t('reels.mirror')}'", "t('reels.mirror')")

with open('src/components/StudioReelEditor.jsx', 'w', encoding='utf-8') as f:
    f.write(studio)

print("Fixed 3 files.")
