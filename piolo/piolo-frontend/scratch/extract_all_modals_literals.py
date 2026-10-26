import re

def extract_all_literals(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find JSX text between > and <
    jsx_texts = re.findall(r'>([^<>{}\n\r]+)<', content)
    # Find string literals in attributes or arrays
    string_literals = re.findall(r'(?:title|placeholder|label|description|subtitle|header|heading|text|alt):\s*["\']([^"\']+)["\']', content)
    
    clean_texts = set()
    for t in jsx_texts + string_literals:
        s = t.strip()
        if len(s) > 1 and not s.startswith('http') and not s.startswith('var(') and not s.startswith('fa-') and not re.match(r'^[0-9\s.,:%€$#+/*\-_()]+$', s):
            clean_texts.add(s)
    return sorted(list(clean_texts))

modals = [
    'src/components/ProSubscriptionModal.jsx',
    'src/components/ProEscrowModal.jsx',
    'src/components/ProBudgetCalculator.jsx',
    'src/components/ProQuoteRequestModal.jsx',
    'src/components/ProQuoteDetailModal.jsx',
    'src/components/ProDeleteConfirmModal.jsx',
    'src/components/ProPublishConfirmModal.jsx',
    'src/components/ProAddProjectModal.jsx',
    'src/components/ProProjectDetailModal.jsx',
    'src/components/ProProfileDetailModal.jsx'
]

for m in modals:
    print(f"=== {m} ===")
    texts = extract_all_literals(m)
    for t in texts:
        print(f"  - {t}")
