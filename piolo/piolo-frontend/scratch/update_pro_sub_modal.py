import os, re

# Let's inspect ProSubscriptionModal.jsx
with open('src/components/ProSubscriptionModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useTranslation import if not present
if 'useTranslation' not in content:
    content = "import { useTranslation } from 'react-i18next';\n" + content

# Inject const { t } = useTranslation(); into ProSubscriptionModal component
if 'const { t } = useTranslation();' not in content:
    content = re.sub(r'(export default function ProSubscriptionModal\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

# Replace key strings
replacements = [
    ("Monétisation &amp; Visibilité Piolo", "{t('pro_modals.subscription.title')}"),
    ("Monétisation & Visibilité Piolo", "{t('pro_modals.subscription.title')}"),
    ("Votre Solde Actuel", "{t('pro_modals.subscription.current_balance')}"),
    ("Chaque publication de projet en vitrine requiert", "{t('pro_modals.subscription.points_cost_info')}"),
    ("Pack Flash", "{t('pro_modals.subscription.pack_flash')}"),
    ("Pack Recommandé", "{t('pro_modals.subscription.pack_recommended')}"),
    ("Pack Expert (+20 pts offerts)", "{t('pro_modals.subscription.pack_expert')}"),
    ("-20% de remise", "{t('pro_modals.subscription.discount_20')}"),
    ("Montant total :", "{t('pro_modals.subscription.total_amount')}"),
    ('placeholder="Ex: 699 00 11 22"', 'placeholder={t("pro_modals.subscription.phone_placeholder")}'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('src/components/ProSubscriptionModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ProSubscriptionModal.jsx updated successfully!")
