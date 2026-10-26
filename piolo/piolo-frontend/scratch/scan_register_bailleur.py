import os, re

files = [
    'src/pages/auth/register-bailleur/components/Steps.jsx',
    'src/pages/auth/register-bailleur/components/StepShell.jsx',
    'src/pages/auth/register-bailleur/RegisterBailleurPage.jsx',
    'src/components/OnboardingManager.jsx',
    'src/pages/properties/PropertyCreate.jsx',
    'src/pages/properties/PropertyUpdate.jsx'
]

for f in files:
    if os.path.exists(f):
        print(f"=== {f} ===")
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        jsx_texts = re.findall(r'>([^<>{}\n\r]+)<', content)
        string_literals = re.findall(r'(?:title|placeholder|label|description|subtitle|header|heading|text|alt|message):\s*["\']([^"\']+)["\']', content)
        clean = set()
        for t in jsx_texts + string_literals:
            s = t.strip()
            if len(s) > 1 and not s.startswith('http') and not s.startswith('var(') and not s.startswith('fa-') and not re.match(r'^[0-9\s.,:%€$#+/*\-_()]+$', s):
                clean.add(s)
        for t in sorted(list(clean))[:20]:
            print(f"  - {t}")
        if len(clean) > 20:
            print(f"  ... and {len(clean) - 20} more")
