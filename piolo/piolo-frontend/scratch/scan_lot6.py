import os, glob

files = [
    'src/pages/messaging/ChatPage.jsx',
    'src/pages/properties/LocationsListPage.jsx',
    'src/pages/properties/LocationDetail.jsx',
    'src/pages/properties/VisitsListPage.jsx',
    'src/pages/properties/VisitDetail.jsx',
    'src/pages/calendar/CalendarPage.jsx',
    'src/pages/notifications/NotificationPage.jsx',
    'src/components/NotificationCenter.jsx',
    'src/pages/core/HomePage.jsx',
    'src/components/PioloChatbot.jsx'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
            has_t = 'useTranslation' in content
            print(f"{f}: exists ({len(content)} chars), useTranslation: {has_t}")
    else:
        print(f"{f}: NOT FOUND")
