import json

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr = json.load(f)
with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

# Add missing common keys
fr['common']['error'] = "Une erreur est survenue"
fr['common']['more'] = "Plus"
fr['common']['retry'] = "Réessayer"
fr['common']['send'] = "Envoyer"
fr['common']['verified'] = "Vérifié"

en['common']['error'] = "An error occurred"
en['common']['more'] = "More"
en['common']['retry'] = "Retry"
en['common']['send'] = "Send"
en['common']['verified'] = "Verified"

with open('src/i18n/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr, f, ensure_ascii=False, indent=2)

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

print("Added missing common keys to fr.json and en.json successfully!")
