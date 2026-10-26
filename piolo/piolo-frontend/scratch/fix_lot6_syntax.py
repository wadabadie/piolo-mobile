import re

with open('src/pages/properties/LocationDetail.jsx', 'r', encoding='utf-8') as f:
    loc = f.read()

loc = loc.replace("'{t('locations_detail.cni_front')}'", "t('locations_detail.cni_front')")
loc = loc.replace("'{t('locations_detail.cni_back')}'", "t('locations_detail.cni_back')")
loc = loc.replace("'{t('locations_detail.guarantor_cni')}'", "t('locations_detail.guarantor_cni')")
loc = loc.replace("'{t('locations_detail.income_proof')}'", "t('locations_detail.income_proof')")

with open('src/pages/properties/LocationDetail.jsx', 'w', encoding='utf-8') as f:
    f.write(loc)

with open('src/pages/messaging/ChatPage.jsx', 'r', encoding='utf-8') as f:
    chat = f.read()

chat = chat.replace("'{t('chat.deleted_message')}'", "t('chat.deleted_message')")
with open('src/pages/messaging/ChatPage.jsx', 'w', encoding='utf-8') as f:
    f.write(chat)

print("Fixed LocationDetail.jsx and ChatPage.jsx")
