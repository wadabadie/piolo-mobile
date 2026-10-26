import os, re

files = [
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

for f in files:
    print('====================================')
    print('FILE:', f)
    with open(f, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
        for i, l in enumerate(lines):
            # Look for french words or patterns
            if any(w in l for w in ['title:', 'label:', 'description:', 'subtitle:', 'heading:', 'placeholder=', 'toast.', 'alert(', 'confirm(']) or re.search(r'>\s*[^<{}\n]+[a-zA-ZÀ-ÿ]+\s*<', l):
                print(f"L{i+1}: {l.strip()[:100]}")
