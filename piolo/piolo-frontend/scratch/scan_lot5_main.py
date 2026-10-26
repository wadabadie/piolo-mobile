import re

files = [
    'src/pages/pro/Dashboard.jsx',
    'src/pages/properties/ArchitectsPage.jsx',
    'src/pages/properties/TourViewer.jsx',
    'src/pages/properties/TourEditor.jsx',
    'src/components/StudioReelEditor.jsx',
    'src/pages/properties/DiscoveryPage.jsx',
    'src/components/BeforeAfterSlider.jsx',
    'src/components/ProDiscoveryVideoModal.jsx'
]

for f in files:
    print('=== ' + f + ' ===')
    with open(f, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
        print(f"Total lines: {len(lines)}")
        samples = []
        for idx, line in enumerate(lines):
            matches = re.findall(r'>([^<>{}\n]+)<|placeholder=[\"\']([^\"\']+)[\"\']|title=[\"\']([^\"\']+)[\"\']', line)
            for m in matches:
                txt = (m[0] or m[1] or m[2]).strip()
                if txt and len(txt) > 2 and not txt.startswith('http') and not txt.startswith('var('):
                    samples.append((idx+1, txt))
        print(f"Found {len(samples)} text nodes/placeholders. First 15:")
        for lnum, txt in samples[:15]:
            print(f"  L{lnum}: {txt}")
