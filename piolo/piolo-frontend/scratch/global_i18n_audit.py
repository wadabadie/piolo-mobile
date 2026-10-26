import os, re, json

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr = json.load(f)
with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

def get_keys(d, prefix=''):
    keys = []
    for k, v in d.items():
        curr = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.extend(get_keys(v, curr))
        else:
            keys.append(curr)
    return set(keys)

fr_keys = get_keys(fr)
en_keys = get_keys(en)

t_calls = set()
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.jsx', '.js')) and not file.endswith('i18n.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # Only match actual t('key') or i18n.t('key')
            matches = re.findall(r"(?<![a-zA-Z0-9_$])(?:t|i18n\.t)\(\s*['\"]([^'\"]+)['\"]", content)
            for m in matches:
                t_calls.add((m, filepath))

print(f"Total unique static t(...) key calls found in src: {len(t_calls)}")

missing_in_fr_called = set()
missing_in_en_called = set()

for key, fpath in t_calls:
    if key not in fr_keys:
        missing_in_fr_called.add((key, fpath))
    if key not in en_keys:
        missing_in_en_called.add((key, fpath))

print(f"Keys called in code but missing in FR: {len(missing_in_fr_called)}")
for k, f in sorted(list(missing_in_fr_called)):
    print(f"  - {k} (in {f})")

print(f"Keys called in code but missing in EN: {len(missing_in_en_called)}")
for k, f in sorted(list(missing_in_en_called)):
    print(f"  - {k} (in {f})")
