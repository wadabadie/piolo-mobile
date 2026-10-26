import re

def extract_all_literals(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    jsx_texts = re.findall(r'>([^<>{}\n\r]+)<', content)
    string_literals = re.findall(r'(?:title|placeholder|label|description|subtitle|header|heading|text|alt|message):\s*["\']([^"\']+)["\']', content)
    
    clean_texts = set()
    for t in jsx_texts + string_literals:
        s = t.strip()
        if len(s) > 1 and not s.startswith('http') and not s.startswith('var(') and not s.startswith('fa-') and not re.match(r'^[0-9\s.,:%€$#+/*\-_()]+$', s):
            clean_texts.add(s)
    return sorted(list(clean_texts))

files = [
    'src/pages/core/HomePage.jsx',
    'src/components/RentEstimatorModal.jsx',
    'src/pages/support/SupportPage.jsx',
    'src/pages/properties/SearchAlertsPage.jsx',
    'src/components/PointConfirmationModal.jsx',
    'src/components/OnboardingManager.jsx',
    'src/pages/NotFound.jsx'
]

for m in files:
    print(f"=== {m} ===")
    texts = extract_all_literals(m)
    for t in texts[:25]:
        print(f"  - {t}")
    if len(texts) > 25:
        print(f"  ... and {len(texts) - 25} more")
