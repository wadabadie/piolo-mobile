with open('src/pages/pro/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("''pro_dashboard.tabs.portfolio''", "t('pro_dashboard.tabs.portfolio')")
content = content.replace("''pro_dashboard.tabs.quotes''", "t('pro_dashboard.tabs.quotes')")
content = content.replace("''pro_dashboard.tabs.stats''", "t('pro_dashboard.tabs.stats')")
content = content.replace("''pro_dashboard.tabs.settings''", "t('pro_dashboard.tabs.settings')")

with open('src/pages/pro/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed tabs in Dashboard.jsx")
