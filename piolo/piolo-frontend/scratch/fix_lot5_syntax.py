import re

# 1. ArchitectsPage.jsx
with open('src/pages/properties/ArchitectsPage.jsx', 'r', encoding='utf-8') as f:
    arch_content = f.read()

arch_content = arch_content.replace("'{t('pro.categories.all')}'", "t('pro.categories.all')")
arch_content = arch_content.replace("'{t('architects.title')}'", "t('architects.title')")
arch_content = arch_content.replace("'{t('architects.showcase_title')}'", "t('architects.showcase_title')")

with open('src/pages/properties/ArchitectsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(arch_content)

# 2. DiscoveryPage.jsx
with open('src/pages/properties/DiscoveryPage.jsx', 'r', encoding='utf-8') as f:
    disc_content = f.read()

disc_content = disc_content.replace("'{t('discovery.certified_artisan')} Piolo'", "`${t('discovery.certified_artisan')} Piolo`")

with open('src/pages/properties/DiscoveryPage.jsx', 'w', encoding='utf-8') as f:
    f.write(disc_content)

# 3. ProEscrowModal.jsx
with open('src/components/ProEscrowModal.jsx', 'r', encoding='utf-8') as f:
    escrow_content = f.read()

escrow_content = escrow_content.replace("'{t('pro_modals.escrow.orange_money')}'", "t('pro_modals.escrow.orange_money')")
escrow_content = escrow_content.replace("'{t('pro_modals.escrow.mtn_momo')}'", "t('pro_modals.escrow.mtn_momo')")

with open('src/components/ProEscrowModal.jsx', 'w', encoding='utf-8') as f:
    f.write(escrow_content)

# 4. ProQuoteRequestModal.jsx
with open('src/components/ProQuoteRequestModal.jsx', 'r', encoding='utf-8') as f:
    quote_content = f.read()

quote_content = quote_content.replace("'{t('pro_modals.quote_request.urgency.asap')}'", "t('pro_modals.quote_request.urgency.asap')")

with open('src/components/ProQuoteRequestModal.jsx', 'w', encoding='utf-8') as f:
    f.write(quote_content)

# 5. StudioReelEditor.jsx
# Let's check StudioReelEditor.jsx
with open('src/components/StudioReelEditor.jsx', 'r', encoding='utf-8') as f:
    studio_content = f.read()

# Replace all '{t('...')}' with proper strings or t() calls
studio_content = re.sub(r"\'\{t\(([^\)]+)\)\}\'", r"t(\1)", studio_content)
# If PRO_BADGES is at top-level, we can make it a function getProBadges(t) or keep labels in fr / use t inside the component
# Let's inspect where PRO_BADGES is used:
# Let's check:
with open('src/components/StudioReelEditor.jsx', 'w', encoding='utf-8') as f:
    f.write(studio_content)

print("Fixes applied successfully!")
