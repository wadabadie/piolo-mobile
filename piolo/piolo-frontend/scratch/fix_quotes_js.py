import glob, re

files = [
    'src/pages/properties/ArchitectsPage.jsx',
    'src/pages/properties/DiscoveryPage.jsx',
    'src/components/ProEscrowModal.jsx',
    'src/components/ProQuoteRequestModal.jsx',
    'src/components/StudioReelEditor.jsx',
    'src/pages/pro/Dashboard.jsx',
    'src/components/ProSubscriptionModal.jsx',
    'src/components/ProBudgetCalculator.jsx',
    'src/components/ProQuoteDetailModal.jsx',
    'src/components/ProDeleteConfirmModal.jsx',
    'src/components/ProPublishConfirmModal.jsx',
    'src/components/ProAddProjectModal.jsx',
    'src/components/ProProjectDetailModal.jsx',
    'src/components/ProProfileDetailModal.jsx',
    'src/components/ProDiscoveryVideoModal.jsx',
    'src/pages/properties/TourViewer.jsx',
    'src/pages/properties/TourEditor.jsx'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    # Fix patterns like '{t('key')}' or "{t('key')}" or `'{t('key')}'`
    # When inside JS: '{t(\'...\')}' -> t('...')
    content = re.sub(r'[\'"]\{t\(([\'"][^\'"]+[\'"])\)\}[\'"]', r't(\1)', content)
    # When inside template literal or expression: '{t('...')}' -> t('...')
    content = re.sub(r'\{t\(([\'"][^\'"]+[\'"])\)\}', r't(\1)', content) # Wait! In JSX child: <div>{t('key')}</div> is correct!
    # Let's be precise:
    # If it's a JSX tag child: >t('key')< -> >{t('key')}<
    
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(content)

print("Pass 1 done.")
