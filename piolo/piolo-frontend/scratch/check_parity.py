import json

def get_all_keys(d, prefix=''):
    keys = []
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.extend(get_all_keys(v, full_key))
        else:
            keys.append(full_key)
    return set(keys)

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr = json.load(f)

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

fr_keys = get_all_keys(fr)
en_keys = get_all_keys(en)

print(f"FR total keys: {len(fr_keys)}")
print(f"EN total keys: {len(en_keys)}")

missing_in_en = fr_keys - en_keys
missing_in_fr = en_keys - fr_keys

if missing_in_en:
    print(f"Missing in EN ({len(missing_in_en)}):", missing_in_en)
if missing_in_fr:
    print(f"Missing in FR ({len(missing_in_fr)}):", missing_in_fr)

if not missing_in_en and not missing_in_fr:
    print("PERFECT PARITY: 100% matched!")
