with open('src/components/PointConfirmationModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'{t('point_confirmation.title_landlord')}'", "t('point_confirmation.title_landlord')")
content = content.replace("'{t('point_confirmation.title_secure')}'", "t('point_confirmation.title_secure')")

with open('src/components/PointConfirmationModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed PointConfirmationModal.jsx")
