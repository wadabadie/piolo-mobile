import json

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr_data = json.load(f)

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

fr_chat = {
    "title": "Messagerie Piolo Luxury",
    "conversations": "Conversations",
    "messages": "Messages",
    "loading": "Chargement des conversations...",
    "no_messages": "Aucun message pour le moment",
    "new_discussion": "Nouvelle discussion sécurisée",
    "deleted_message": "Ce message a été supprimé",
    "reply_placeholder": "Écrivez votre message...",
    "quote": "Citation",
    "quick_replies": {
        "title": "Réponses rapides",
        "availability_tag": "Disponibilité",
        "availability_text": "Bonjour, ce logement est-il toujours disponible à la date indiquée ?",
        "visit_ask_tag": "Demander une visite",
        "visit_ask_text": "Bonjour, je suis très intéressé par votre bien. Serait-il possible de programmer une visite ?",
        "visit_propose_tag": "Proposer une visite",
        "visit_propose_text": "Êtes-vous disponible pour une visite cette semaine ? Indiquez-moi vos créneaux.",
        "lease_terms_tag": "Conditions du bail",
        "lease_terms_text": "Le bail prévoit une caution de 2 mois et 1 mois d'avance de loyer.",
        "negotiate_tag": "Négocier",
        "negotiate_text": "Bonjour, je souhaiterais savoir si le loyer est légèrement négociable compte tenu de la durée du bail.",
        "share_file_tag": "Partager mon dossier",
        "share_file_text": "Mon dossier locataire est 100% complet et vérifié sur Piolo. Je viens de vous le transmettre.",
        "ask_file_tag": "Demander le dossier",
        "ask_file_text": "Merci de me transmettre votre dossier locataire sur Piolo afin que je puisse l'examiner.",
        "available_tag": "Logement disponible",
        "available_text": "Bonjour, le bien est toujours disponible pour une location."
    }
}

en_chat = {
    "title": "Piolo Luxury Messaging",
    "conversations": "Conversations",
    "messages": "Messages",
    "loading": "Loading conversations...",
    "no_messages": "No messages yet",
    "new_discussion": "New secure conversation",
    "deleted_message": "This message has been deleted",
    "reply_placeholder": "Write your message...",
    "quote": "Quote",
    "quick_replies": {
        "title": "Quick replies",
        "availability_tag": "Availability",
        "availability_text": "Hello, is this property still available on the indicated date?",
        "visit_ask_tag": "Request a visit",
        "visit_ask_text": "Hello, I am very interested in your property. Would it be possible to schedule a visit?",
        "visit_propose_tag": "Propose a visit",
        "visit_propose_text": "Are you available for a visit this week? Please let me know your preferred timeslots.",
        "lease_terms_tag": "Lease terms",
        "lease_terms_text": "The lease requires a 2-month security deposit and 1 month upfront rent.",
        "negotiate_tag": "Negotiate",
        "negotiate_text": "Hello, I would like to know if the rent is slightly negotiable given the lease duration.",
        "share_file_tag": "Share my file",
        "share_file_text": "My tenant file is 100% complete and verified on Piolo. I have just shared it with you.",
        "ask_file_tag": "Request tenant file",
        "ask_file_text": "Please provide your tenant application file on Piolo so that I can review it.",
        "available_tag": "Property available",
        "available_text": "Hello, the property is currently available for rent."
    }
}

fr_locations_detail = {
    "title": "Dossier Locatif",
    "applicant_presentation": "Présentation du candidat",
    "desired_conditions": "Conditions Souhaitées",
    "desired_move_in": "Entrée souhaitée",
    "lease_duration": "Durée du bail",
    "occupants": "Occupants",
    "monthly_income": "Revenus Mensuels",
    "income_per_month": "Revenus / mois",
    "profession": "Profession",
    "employer": "Employeur",
    "not_provided": "Non fourni",
    "guarantor_info": "Informations du Garant",
    "guarantor_name": "Nom du Garant",
    "relationship": "Lien de parenté",
    "phone": "Téléphone",
    "supporting_docs": "Pièces Justificatives (Aperçu direct)",
    "cni_front": "CNI Recto",
    "cni_back": "CNI Verso",
    "guarantor_cni": "CNI du Garant",
    "income_proof": "Justificatif de Revenus",
    "download": "Télécharger",
    "landlord_decision": "Décision du Bailleur",
    "put_under_review": "Mettre en examen",
    "refuse": "Refuser",
    "accept": "Accepter la candidature",
    "decision_reason": "Motif de la décision",
    "remarks_placeholder": "Remarques ou motifs de décision (visible par le locataire)"
}

en_locations_detail = {
    "title": "Rental Application",
    "applicant_presentation": "Applicant profile",
    "desired_conditions": "Desired Rental Terms",
    "desired_move_in": "Desired move-in date",
    "lease_duration": "Lease duration",
    "occupants": "Occupants",
    "monthly_income": "Monthly Income",
    "income_per_month": "Income / month",
    "profession": "Profession",
    "employer": "Employer",
    "not_provided": "Not provided",
    "guarantor_info": "Guarantor Information",
    "guarantor_name": "Guarantor Name",
    "relationship": "Relationship",
    "phone": "Phone number",
    "supporting_docs": "Supporting Documents (Direct preview)",
    "cni_front": "ID Card Front",
    "cni_back": "ID Card Back",
    "guarantor_cni": "Guarantor ID Card",
    "income_proof": "Proof of Income",
    "download": "Download",
    "landlord_decision": "Landlord Decision",
    "put_under_review": "Place under review",
    "refuse": "Reject application",
    "accept": "Accept application",
    "decision_reason": "Decision reason",
    "remarks_placeholder": "Notes or decision reasons (visible to tenant)"
}

fr_visits_detail = {
    "title": "Fiche Rendez-vous",
    "desired_datetime": "Date & Heure souhaitées",
    "confirmed_date": "Date confirmée",
    "confirmed_time": "Heure confirmée",
    "tenant_message": "Message du locataire",
    "landlord_instructions": "Instructions du bailleur :",
    "instructions_placeholder": "Consignes pour le locataire (adresse exacte, étage...)",
    "landlord_decision": "Décision du Bailleur",
    "confirm_visit": "Confirmer le rendez-vous",
    "refuse_visit": "Refuser",
    "visit_confirmed": "Visite confirmée",
    "refusal_reason": "Motif du refus",
    "chat_whatsapp": "Discuter sur WhatsApp"
}

en_visits_detail = {
    "title": "Appointment Sheet",
    "desired_datetime": "Desired Date & Time",
    "confirmed_date": "Confirmed Date",
    "confirmed_time": "Confirmed Time",
    "tenant_message": "Tenant message",
    "landlord_instructions": "Landlord instructions:",
    "instructions_placeholder": "Instructions for tenant (exact address, floor...)",
    "landlord_decision": "Landlord Decision",
    "confirm_visit": "Confirm appointment",
    "refuse_visit": "Decline",
    "visit_confirmed": "Visit confirmed",
    "refusal_reason": "Reason for refusal",
    "chat_whatsapp": "Chat on WhatsApp"
}

fr_calendar = {
    "title": "Calendrier & Disponibilités",
    "view_calendar": "Calendrier",
    "view_list": "Liste",
    "select_property": "-- Choisir un logement --",
    "block_period_btn": "+ Bloquer une période",
    "block_from_date": "Bloquer à partir de cette date",
    "unblock_dates": "Débloquer ces dates",
    "no_visits_day": "Aucune visite pour ce jour",
    "property_available_day": "Logement disponible ce jour",
    "select_date_hint": "Sélectionnez une date avec une pastille sur le calendrier.",
    "chat_whatsapp": "Échanger sur WhatsApp",
    "stats": {
        "total_visits": "Total Visites",
        "reserved_nights": "Nuitées Réservées",
        "confirmed_stays": "Séjours Confirmés",
        "blocked_periods": "Périodes Bloquées",
        "confirmed": "Confirmées",
        "pending": "Demandes en attente",
        "rejected": "Refusées / Annulées"
    },
    "statuses": {
        "available": "Disponible / Libre",
        "reserved": "Réservé (Client)",
        "confirmed_visit": "Visite confirmée",
        "pending_validation": "En attente de validation",
        "blocked_host": "Bloqué manuellement (Hôte)",
        "unavailable_family": "Indisponible (Usage personnel / Famille)",
        "renovation": "Travaux / Rénovation",
        "external_booking": "Réservé en direct / Airbnb / Booking",
        "other": "Autre motif"
    }
}

en_calendar = {
    "title": "Calendar & Availability",
    "view_calendar": "Calendar",
    "view_list": "List",
    "select_property": "-- Select a property --",
    "block_period_btn": "+ Block a period",
    "block_from_date": "Block starting from this date",
    "unblock_dates": "Unblock these dates",
    "no_visits_day": "No visits scheduled for this day",
    "property_available_day": "Property available on this day",
    "select_date_hint": "Select a highlighted date on the calendar.",
    "chat_whatsapp": "Chat on WhatsApp",
    "stats": {
        "total_visits": "Total Visits",
        "reserved_nights": "Booked Nights",
        "confirmed_stays": "Confirmed Stays",
        "blocked_periods": "Blocked Periods",
        "confirmed": "Confirmed",
        "pending": "Pending requests",
        "rejected": "Declined / Cancelled"
    },
    "statuses": {
        "available": "Available / Vacant",
        "reserved": "Booked (Client)",
        "confirmed_visit": "Visit confirmed",
        "pending_validation": "Pending validation",
        "blocked_host": "Manually blocked (Host)",
        "unavailable_family": "Unavailable (Personal / Family use)",
        "renovation": "Maintenance / Renovation",
        "external_booking": "Direct booking / Airbnb / Booking",
        "other": "Other reason"
    }
}

fr_notifications = {
    "title": "Notifications",
    "page_subtitle": "Retrouvez ici tous les événements importants liés à votre compte.",
    "center_title": "Centre de Notifications",
    "all_caught_up": "Vous êtes à jour !",
    "no_notifications": "Aucune notification pour le moment.",
    "error_loading": "Erreur de chargement",
    "retry": "Réessayer",
    "filters": {
        "all": "Tout",
        "unread": "Non lues",
        "read": "Lues",
        "properties": "Biens",
        "visits": "Visites",
        "messages": "Messages",
        "alerts": "Alertes"
    }
}

en_notifications = {
    "title": "Notifications",
    "page_subtitle": "View all important events and updates related to your account.",
    "center_title": "Notification Center",
    "all_caught_up": "You're all caught up!",
    "no_notifications": "No notifications right now.",
    "error_loading": "Failed to load notifications",
    "retry": "Retry",
    "filters": {
        "all": "All",
        "unread": "Unread",
        "read": "Read",
        "properties": "Properties",
        "visits": "Visits",
        "messages": "Messages",
        "alerts": "Alerts"
    }
}

# Update json files
fr_data['chat'] = fr_chat
fr_data['locations_detail'] = fr_locations_detail
fr_data['visits_detail'] = fr_visits_detail
fr_data['calendar'] = fr_calendar
fr_data['notifications'] = fr_notifications

en_data['chat'] = en_chat
en_data['locations_detail'] = en_locations_detail
en_data['visits_detail'] = en_visits_detail
en_data['calendar'] = en_calendar
en_data['notifications'] = en_notifications

with open('src/i18n/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, ensure_ascii=False, indent=2)

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("Updated fr.json and en.json with Lot 6 namespaces successfully!")
