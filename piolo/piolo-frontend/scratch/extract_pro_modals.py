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
    print('=== ' + f + ' ===')
    with open(f, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
        for idx, line in enumerate(lines):
            # find text
            matches = re.findall(r'>([^<>{}\n]+)<|placeholder=[\"\']([^\"\']+)[\"\']|title=[\"\']([^\"\']+)[\"\']', line)
            for m in matches:
                txt = (m[0] or m[1] or m[2]).strip()
                if txt and len(txt) > 2 and not txt.startswith('http') and not txt.startswith('var('):
                    print(f'  L{idx+1}: {txt}')
