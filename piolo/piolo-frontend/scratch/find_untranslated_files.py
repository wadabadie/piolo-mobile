import os

files_without_translation = []

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.jsx', '.js')) and not file.endswith('i18n.js') and not 'services' in root and not 'context' in root and not 'utils' in root and not 'hooks' in root and not 'api' in root:
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'useTranslation' not in content:
                files_without_translation.append((filepath, len(content)))

print(f"Components/Pages without useTranslation ({len(files_without_translation)}):")
for f, size in sorted(files_without_translation, key=lambda x: -x[1]):
    print(f"  - {f} ({size} chars)")
