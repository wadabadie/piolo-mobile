import re

def extract_all_literals(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    jsx_texts = re.findall(r'>([^<>{}\n\r]+)<', content)
    string_literals = re.findall(r'(?:title|placeholder|label|description|subtitle|header|heading|text|alt|message|name):\s*["\']([^"\']+)["\']', content)
    
    clean_texts = set()
    for t in jsx_texts + string_literals:
        s = t.strip()
        if len(s) > 1 and not s.startswith('http') and not s.startswith('var(') and not s.startswith('fa-') and not re.match(r'^[0-9\s.,:%€$#+/*\-_()]+$', s):
            clean_texts.add(s)
    return sorted(list(clean_texts))

for m in ['src/pages/pro/Dashboard.jsx', 'src/pages/properties/ArchitectsPage.jsx']:
    print(f"=== {m} ===")
    texts = extract_all_literals(m)
    for t in texts:
        print(f"  - {t}")
