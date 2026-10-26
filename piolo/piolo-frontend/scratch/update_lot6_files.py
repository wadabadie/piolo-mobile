import os, re

def apply_chat_page():
    filepath = 'src/pages/messaging/ChatPage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function ChatPage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Messagerie Piolo Luxury", "{t('chat.title')}"),
        ("Chargement des conversations...", "{t('chat.loading')}"),
        ("Aucun message pour le moment", "{t('chat.no_messages')}"),
        ("Nouvelle discussion sécurisée", "{t('chat.new_discussion')}"),
        ("Ce message a été supprimé", "{t('chat.deleted_message')}"),
        ('placeholder="Écrivez votre message..."', 'placeholder={t("chat.reply_placeholder")}'),
        (">Messages<", ">{t('chat.messages')}<"),
        (">Citation<", ">{t('chat.quote')}<"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("ChatPage.jsx updated.")

def apply_location_detail():
    filepath = 'src/pages/properties/LocationDetail.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function LocationDetail\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Dossier Locatif", "{t('locations_detail.title')}"),
        ("Présentation du candidat", "{t('locations_detail.applicant_presentation')}"),
        ("Conditions Souhaitées", "{t('locations_detail.desired_conditions')}"),
        ("Entrée souhaitée", "{t('locations_detail.desired_move_in')}"),
        ("Durée du bail", "{t('locations_detail.lease_duration')}"),
        (">Occupants<", ">{t('locations_detail.occupants')}<"),
        ("Revenus Mensuels", "{t('locations_detail.monthly_income')}"),
        ("Revenus / mois", "{t('locations_detail.income_per_month')}"),
        (">Profession<", ">{t('locations_detail.profession')}<"),
        (">Employeur<", ">{t('locations_detail.employer')}<"),
        ("Non fourni", "{t('locations_detail.not_provided')}"),
        ("Informations du Garant", "{t('locations_detail.guarantor_info')}"),
        ("Nom du Garant", "{t('locations_detail.guarantor_name')}"),
        ("Lien de parenté", "{t('locations_detail.relationship')}"),
        (">Téléphone<", ">{t('locations_detail.phone')}<"),
        ("Pièces Justificatives (Aperçu direct)", "{t('locations_detail.supporting_docs')}"),
        ("CNI Recto", "{t('locations_detail.cni_front')}"),
        ("CNI Verso", "{t('locations_detail.cni_back')}"),
        ("CNI du Garant", "{t('locations_detail.guarantor_cni')}"),
        ("Justificatif de Revenus", "{t('locations_detail.income_proof')}"),
        ("Télécharger", "{t('locations_detail.download')}"),
        ("Décision du Bailleur", "{t('locations_detail.landlord_decision')}"),
        ("Mettre en examen", "{t('locations_detail.put_under_review')}"),
        (">Refuser<", ">{t('locations_detail.refuse')}<"),
        ("Motif de la décision", "{t('locations_detail.decision_reason')}"),
        ('placeholder="Remarques ou motifs de décision (visible par le locataire)"', 'placeholder={t("locations_detail.remarks_placeholder")}'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("LocationDetail.jsx updated.")

def apply_visit_detail():
    filepath = 'src/pages/properties/VisitDetail.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function VisitDetail\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        ("Fiche Rendez-vous", "{t('visits_detail.title')}"),
        ("Date & Heure souhaitées", "{t('visits_detail.desired_datetime')}"),
        ("Date &amp; Heure souhaitées", "{t('visits_detail.desired_datetime')}"),
        ("Date confirmée", "{t('visits_detail.confirmed_date')}"),
        ("Heure confirmée", "{t('visits_detail.confirmed_time')}"),
        ("Message du locataire", "{t('visits_detail.tenant_message')}"),
        ("Instructions du bailleur :", "{t('visits_detail.landlord_instructions')}"),
        ('placeholder="Consignes pour le locataire (adresse exacte, étage...)"', 'placeholder={t("visits_detail.instructions_placeholder")}'),
        ("Décision du Bailleur", "{t('visits_detail.landlord_decision')}"),
        (">Refuser<", ">{t('visits_detail.refuse_visit')}<"),
        ("Visite confirmée", "{t('visits_detail.visit_confirmed')}"),
        ("Motif du refus", "{t('visits_detail.refusal_reason')}"),
        ("Discuter sur WhatsApp", "{t('visits_detail.chat_whatsapp')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("VisitDetail.jsx updated.")

def apply_calendar():
    filepath = 'src/pages/calendar/CalendarPage.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = "import { useTranslation } from 'react-i18next';\n" + content

    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function CalendarPage\s*\([^{]*\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)

    replacements = [
        (">Calendrier<", ">{t('calendar.view_calendar')}<"),
        (">Liste<", ">{t('calendar.view_list')}<"),
        ("-- Choisir un logement --", "{t('calendar.select_property')}"),
        ("+ Bloquer une période", "{t('calendar.block_period_btn')}"),
        ("Bloquer à partir de cette date", "{t('calendar.block_from_date')}"),
        ("Débloquer ces dates", "{t('calendar.unblock_dates')}"),
        ("Aucune visite pour ce jour", "{t('calendar.no_visits_day')}"),
        ("Logement disponible ce jour", "{t('calendar.property_available_day')}"),
        ("Sélectionnez une date avec une pastille sur le calendrier.", "{t('calendar.select_date_hint')}"),
        ("Échanger sur WhatsApp", "{t('calendar.chat_whatsapp')}"),
        ("Total Visites", "{t('calendar.stats.total_visits')}"),
        ("Nuitées Réservées", "{t('calendar.stats.reserved_nights')}"),
        ("Séjours Confirmés", "{t('calendar.stats.confirmed_stays')}"),
        ("Périodes Bloquées", "{t('calendar.stats.blocked_periods')}"),
        (">Confirmées<", ">{t('calendar.stats.confirmed')}<"),
        ("Demandes en attente", "{t('calendar.stats.pending')}"),
        ("Refusées / Annulées", "{t('calendar.stats.rejected')}"),
        ("Disponible / Libre", "{t('calendar.statuses.available')}"),
        ("Réservé (Client)", "{t('calendar.statuses.reserved')}"),
        ("Visite confirmée", "{t('calendar.statuses.confirmed_visit')}"),
        ("En attente de validation", "{t('calendar.statuses.pending_validation')}"),
        ("Bloqué manuellement (Hôte)", "{t('calendar.statuses.blocked_host')}"),
        ("Indisponible (Usage personnel / Famille)", "{t('calendar.statuses.unavailable_family')}"),
        ("Travaux / Rénovation", "{t('calendar.statuses.renovation')}"),
        ("Réservé en direct / Airbnb / Booking", "{t('calendar.statuses.external_booking')}"),
        ("Autre motif", "{t('calendar.statuses.other')}"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("CalendarPage.jsx updated.")

def apply_notifications():
    for filepath, fn_regex in [
        ('src/pages/notifications/NotificationPage.jsx', r'(export default function NotificationPage\s*\([^{]*\)\s*\{)'),
        ('src/components/NotificationCenter.jsx', r'(export default function NotificationCenter\s*\([^{]*\)\s*\{)')
    ]:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'useTranslation' not in content:
            content = "import { useTranslation } from 'react-i18next';\n" + content

        if 'const { t } = useTranslation();' not in content:
            content = re.sub(fn_regex, r'\1\n  const { t } = useTranslation();', content)

        replacements = [
            ("Retrouvez ici tous les événements importants liés à votre compte.", "{t('notifications.page_subtitle')}"),
            ("Vous êtes à jour !", "{t('notifications.all_caught_up')}"),
            ("Aucune notification pour le moment.", "{t('notifications.no_notifications')}"),
            ("Erreur de chargement", "{t('notifications.error_loading')}"),
            (">Réessayer<", ">{t('notifications.retry')}<"),
            (">Tout<", ">{t('notifications.filters.all')}<"),
            (">Non lues<", ">{t('notifications.filters.unread')}<"),
            (">Lues<", ">{t('notifications.filters.read')}<"),
            (">Biens<", ">{t('notifications.filters.properties')}<"),
            (">Visites<", ">{t('notifications.filters.visits')}<"),
            (">Messages<", ">{t('notifications.filters.messages')}<"),
            (">Alertes<", ">{t('notifications.filters.alerts')}<"),
        ]

        for old, new in replacements:
            content = content.replace(old, new)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"{filepath} updated.")

apply_chat_page()
apply_location_detail()
apply_visit_detail()
apply_calendar()
apply_notifications()
