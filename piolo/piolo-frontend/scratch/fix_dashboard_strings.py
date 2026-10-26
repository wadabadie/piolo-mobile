with open('src/pages/pro/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("''pro.categories.carpentry''", "'Menuiserie, Mobilier & Déco'")
content = content.replace("''pro.categories.architecture''", "'Architecture, Ingénierie & BTP'")
content = content.replace("''pro.categories.electricity''", "'Plomberie, Électricité & Énergie'")
content = content.replace("''pro.categories.exterior''", "'Extérieur, Jardin & Sécurité'")

with open('src/pages/pro/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard.jsx updated!")
