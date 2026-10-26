"""Service centralisé d'envoi de messages et notifications WhatsApp pour Piolo.

Supporte :
1. L'envoi automatique via API passerelle (Meta WhatsApp Cloud API, UltraMsg, Green-API, Twilio).
2. Le mode simulation local (journalisation propre sans bloquer le serveur si aucune clé d'API n'est configurée).
3. La génération de liens d'action rapide WhatsApp (https://wa.me/...) pour les boutons 1-clic côté frontend.
"""

import logging
import re
import urllib.parse
from django.conf import settings
import urllib.request
import json

logger = logging.getLogger('apps.notifications.whatsapp')


def normalize_phone_number(phone):
    """Normalise un numéro de téléphone pour WhatsApp.
    
    Exemples :
    - '699 00 11 22' -> '237699001122'
    - '+237 677-88-99-00' -> '237677889900'
    - '00237655443322' -> '237655443322'
    - '237699001122' -> '237699001122'
    """
    if not phone:
        return ''
    
    digits = re.sub(r'\D', '', str(phone))
    
    # Suppression du double zéro au début (00237...)
    if digits.startswith('00'):
        digits = digits[2:]
        
    # Si le numéro commence par 237 et a 12 chiffres
    if digits.startswith('237') and len(digits) == 12:
        return digits
    
    # Si c'est un numéro camerounais standard à 9 chiffres (6XXXXXXXX)
    if len(digits) == 9 and digits.startswith(('6', '2')):
        return f'237{digits}'
        
    return digits


def get_whatsapp_direct_url(phone, message):
    """Génère un lien direct https://wa.me/... avec texte pré-rempli."""
    clean_phone = normalize_phone_number(phone)
    if not clean_phone:
        return None
    encoded_text = urllib.parse.quote(message.strip())
    return f"https://wa.me/{clean_phone}?text={encoded_text}"


def send_whatsapp_message(phone_number, message_text, recipient_name=None, action_title=None, details_text=None):
    """
    Envoie un message WhatsApp via la passerelle configurée (Meta Cloud API, UltraMsg, ou Simulation).
    """
    clean_phone = normalize_phone_number(phone_number)
    if not clean_phone:
        logger.warning("[WhatsApp] Numéro invalide, envoi annulé : %s", phone_number)
        return False

    whatsapp_enabled = getattr(settings, 'WHATSAPP_NOTIFICATIONS_ENABLED', True)
    api_provider = getattr(settings, 'WHATSAPP_API_PROVIDER', 'META').upper()
    api_token = getattr(settings, 'WHATSAPP_API_TOKEN', '')
    api_url = getattr(settings, 'WHATSAPP_API_URL', '')

    logger.info("[WhatsApp Notification] Vers +%s :\n%s", clean_phone, message_text.encode('ascii', 'replace').decode('ascii'))

    if not whatsapp_enabled:
        logger.info("[WhatsApp] Notifications désactivées dans les paramètres.")
        return True

    # Mode Simulation / Local (Par défaut si pas d'API Token configuré)
    if api_provider == 'SIMULATION' or not api_token:
        logger.info("[WhatsApp Simulation] Message enregistré avec succès pour +%s", clean_phone)
        return True

    # Mode Meta WhatsApp Cloud API
    if api_provider == 'META':
        import requests
        phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '')
        endpoint = api_url or f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }

        # 1. Tentative d'envoi via le modèle officiel direct (Template piolo_notification)
        if recipient_name and action_title:
            try:
                template_payload = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": str(clean_phone),
                    "type": "template",
                    "template": {
                        "name": getattr(settings, 'WHATSAPP_DEFAULT_TEMPLATE', 'piolo_notification'),
                        "language": {"code": "fr"},
                        "components": [
                            {
                                "type": "body",
                                "parameters": [
                                    {"type": "text", "text": str(recipient_name)},
                                    {"type": "text", "text": str(action_title)},
                                    {"type": "text", "text": str(details_text or 'Consultez votre espace Piolo pour plus de détails.')}
                                ]
                            }
                        ]
                    }
                }
                res = requests.post(endpoint, json=template_payload, headers=headers, timeout=15)
                if res.status_code in (200, 201):
                    logger.info("WhatsApp Template envoyé avec succès à +%s via Meta Cloud API", clean_phone)
                    return True
                else:
                    logger.warning("[WhatsApp Meta Template Error] %d : %s", res.status_code, res.text)
            except Exception as e:
                logger.warning("Échec template Meta, fallback en message texte : %s", e)

        # 2. Envoi en message texte libre
        try:
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": str(clean_phone),
                "type": "text",
                "text": {
                    "preview_url": False,
                    "body": str(message_text)
                }
            }
            res = requests.post(endpoint, json=payload, headers=headers, timeout=15)
            if res.status_code in (200, 201):
                logger.info("WhatsApp envoyé avec succès à +%s via Meta Cloud API", clean_phone)
                return True
            else:
                logger.error("[WhatsApp Meta Text Error] %d pour +%s : %s", res.status_code, clean_phone, res.text)
                return False
        except Exception as e:
            logger.exception("Erreur lors de l'envoi WhatsApp Meta Cloud API à +%s: %s", clean_phone, e)
            return False

    # Mode UltraMsg / Green-API générique
    if api_provider == 'ULTRAMSG' and api_url:
        import requests
        try:
            payload = {
                "token": api_token,
                "to": clean_phone,
                "body": message_text
            }
            res = requests.post(api_url, data=payload, timeout=15)
            if res.status_code == 200:
                logger.info("WhatsApp envoyé avec succès à +%s via UltraMsg", clean_phone)
                return True
        except Exception as e:
            logger.exception("Erreur lors de l'envoi WhatsApp UltraMsg à +%s: %s", clean_phone, e)
            return False

    return True


def send_whatsapp_hello_world(to_phone):
    """Envoie le template officiel par défaut de Meta (hello_world) pour tester la liaison immédiate."""
    import requests
    clean_phone = normalize_phone_number(to_phone)
    if not clean_phone:
        return False

    api_token = getattr(settings, 'WHATSAPP_API_TOKEN', '')
    phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '')
    endpoint = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_phone,
        "type": "template",
        "template": {
            "name": "hello_world",
            "language": {"code": "en_US"}
        }
    }
    try:
        res = requests.post(endpoint, json=payload, headers=headers, timeout=15)
        if res.status_code in (200, 201):
            logger.info("Meta Hello World envoyé avec succès à +%s", clean_phone)
            return True
        else:
            logger.error("[Meta Hello World Error] %d : %s", res.status_code, res.text)
            return False
    except Exception as e:
        logger.exception("Erreur Meta Hello World: %s", e)
        return False


# ═════════════════════════════════════════════════════════════════
# 1. NOTIFICATIONS DE VISITES IMMOBILIÈRES
# ═════════════════════════════════════════════════════════════════

def send_visit_created_whatsapp(visit):
    """Alerte le bailleur sur WhatsApp qu'un locataire souhaite visiter son bien."""
    prop = visit.property
    landlord = prop.owner
    landlord_phone = getattr(landlord, 'phone', '') or getattr(prop, 'contact_phone', '')
    if not landlord_phone:
        return False

    tenant_name = visit.tenant.get_full_name() or visit.tenant.first_name or "Un locataire Piolo"
    tenant_phone = getattr(visit.tenant, 'phone', '')
    date_str = str(visit.requested_date or 'Dès que possible')
    time_str = f" à {str(visit.requested_time)[:5]}" if getattr(visit, 'requested_time', None) else ""
    site_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')

    message = (
        f"🏠 *PIOLO IMMOBILIER — Nouvelle Demande de Visite*\n\n"
        f"Bonjour {landlord.first_name or 'Propriétaire'} ! 👋\n"
        f"*{tenant_name}* souhaite visiter votre bien :\n"
        f"📌 *{prop.title}* ({prop.city or 'Cameroun'})\n\n"
        f"📅 *Date souhaitée :* {date_str}{time_str}\n"
        f"{f'💬 *Message du locataire :* {visit.message}' if visit.message else ''}\n"
        f"{f'📞 *Numéro du locataire :* +{normalize_phone_number(tenant_phone)}' if tenant_phone else ''}\n\n"
        f"👉 *Pour confirmer ou proposer un autre créneau :*\n"
        f"{site_url}/visites/{visit.pk}\n\n"
        f"_Piolo — L'Immobilier en toute confiance au Cameroun._"
    )

    return send_whatsapp_message(
        landlord_phone,
        message,
        recipient_name=landlord.first_name or 'Propriétaire',
        action_title=f"Nouvelle demande de visite pour {prop.title}",
        details_text=f"Par {tenant_name} pour le {date_str}{time_str}. Consultez votre compte Piolo."
    )


def send_visit_status_whatsapp(visit, *, confirmed):
    """Alerte le locataire sur WhatsApp lorsque sa visite est confirmée ou refusée."""
    tenant = visit.tenant
    tenant_phone = getattr(tenant, 'phone', '')
    if not tenant_phone:
        return False

    prop = visit.property
    tenant_name = tenant.first_name or tenant.get_full_name() or "Cher locataire"
    date_str = str(visit.confirmed_date or visit.requested_date or '')
    time_str = f" à {str(visit.confirmed_time or visit.requested_time)[:5]}" if (visit.confirmed_time or visit.requested_time) else ""
    site_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')

    if confirmed:
        message = (
            f"🎉 *PIOLO IMMOBILIER — Visite Confirmée !*\n\n"
            f"Bonjour {tenant_name} ! 👋\n"
            f"Excellente nouvelle : votre demande de visite pour *{prop.title}* a été *CONFIRMÉE* par le bailleur.\n\n"
            f"📅 *Rendez-vous :* {date_str}{time_str}\n"
            f"📍 *Lieu :* {prop.neighborhood or ''}, {prop.city or 'Cameroun'}\n"
            f"{f'📝 *Note du bailleur :* {visit.bailleur_note}' if visit.bailleur_note else ''}\n\n"
            f"👉 *Voir l'itinéraire et les détails sur Piolo :*\n"
            f"{site_url}/visites/{visit.pk}\n\n"
            f"À très bientôt pour votre visite !"
        )
        action = f"Votre visite pour {prop.title} a été confirmée !"
        details = f"Rendez-vous : {date_str}{time_str} ({prop.city or 'Cameroun'})."
    else:
        message = (
            f"ℹ️ *PIOLO IMMOBILIER — Mise à jour de votre demande*\n\n"
            f"Bonjour {tenant_name} ! 👋\n"
            f"Le créneau demandé pour la visite du bien *{prop.title}* n'a pas pu être retenu par le bailleur.\n"
            f"{f'📝 *Motif :* {visit.bailleur_note}' if visit.bailleur_note else ''}\n\n"
            f"👉 *Vous pouvez reprogrammer un autre créneau ou explorer d'autres logements :*\n"
            f"{site_url}/properties\n\n"
            f"_L'équipe Piolo reste à votre disposition._"
        )
        action = f"Mise à jour concernant votre visite pour {prop.title}"
        details = f"{visit.bailleur_note or 'Créneau non retenu'}. Vous pouvez choisir un autre créneau sur Piolo."

    return send_whatsapp_message(
        tenant_phone,
        message,
        recipient_name=tenant_name,
        action_title=action,
        details_text=details
    )


# ═════════════════════════════════════════════════════════════════
# 2. NOTIFICATIONS DE DOSSIERS DE LOCATION
# ═════════════════════════════════════════════════════════════════

def send_location_status_whatsapp(location, *, accepted):
    """Alerte le locataire sur WhatsApp lorsque son dossier de location est validé."""
    tenant = location.tenant
    tenant_phone = getattr(tenant, 'phone', '')
    if not tenant_phone:
        return False

    prop = location.property
    tenant_name = tenant.first_name or tenant.get_full_name() or "Cher locataire"
    site_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')

    if accepted:
        message = (
            f"🎊 *FÉLICITATIONS ! Candidature de Location Acceptée !* 🔑\n\n"
            f"Bonjour {tenant_name} ! 👋\n"
            f"Le propriétaire a *VALIDÉ* votre dossier de location pour le logement :\n"
            f"🏡 *{prop.title}* ({prop.city or 'Cameroun'})\n\n"
            f"💰 *Loyer :* {int(prop.price):,} FCFA / mois\n"
            f"{f'📝 *Consignes du bailleur :* {location.bailleur_notes}' if getattr(location, 'bailleur_notes', None) else ''}\n\n"
            f"👉 *Accéder à votre dossier et contrat sur Piolo :*\n"
            f"{site_url}/locations/{location.pk}\n\n"
            f"Bienvenue dans votre futur chez-vous !"
        )
        action_title = f"Candidature de location validée pour {prop.title}"
        details_text = f"Loyer : {int(prop.price):,} FCFA/mois. Rendez-vous sur {site_url}"
    else:
        message = (
            f"ℹ️ *PIOLO IMMOBILIER — Dossier de Location*\n\n"
            f"Bonjour {tenant_name},\n"
            f"Votre dossier de location pour *{prop.title}* n'a pas été retenu pour ce logement.\n\n"
            f"👉 *Découvrez d'autres logements disponibles immédiatement :*\n"
            f"{site_url}/properties\n\n"
            f"_Piolo Immobilier_"
        )
        action_title = f"Mise à jour pour votre dossier {prop.title}"
        details_text = f"Consultez les autres biens disponibles sur {site_url}/properties"

    return send_whatsapp_message(
        tenant_phone,
        message,
        recipient_name=tenant_name,
        action_title=action_title,
        details_text=details_text
    )


def send_location_created_whatsapp(location):
    """Alerte le bailleur sur WhatsApp lorsqu'un locataire dépose un dossier de location complet."""
    prop = location.property
    landlord = prop.owner
    landlord_phone = getattr(landlord, 'phone', '') or getattr(prop, 'contact_phone', '')
    if not landlord_phone:
        return False

    tenant = location.tenant
    tenant_name = tenant.get_full_name() or tenant.first_name or "Un locataire Piolo"
    tenant_phone = getattr(tenant, 'phone', '')
    site_url = getattr(settings, 'FRONTEND_URL', 'https://piolo-immo.tech').rstrip('/')
    income_str = f"{int(location.monthly_income):,} FCFA/mois" if location.monthly_income else "Non précisé"

    message = (
        f"📄 *PIOLO IMMOBILIER — Nouveau Dossier de Candidature !* 🔑\n\n"
        f"Bonjour {landlord.first_name or 'Propriétaire'} ! 👋\n"
        f"*{tenant_name}* vient de soumettre un dossier de location complet pour votre bien :\n"
        f"🏡 *{prop.title}* ({prop.city or 'Cameroun'})\n\n"
        f"👤 *Candidat :* {tenant_name}\n"
        f"💼 *Profession :* {location.profession or 'Non précisé'}\n"
        f"💰 *Revenus déclarés :* {income_str}\n"
        f"📅 *Date d'entrée souhaitée :* {location.move_in_date}\n"
        f"{f'📞 *Contact candidat :* +{normalize_phone_number(tenant_phone)}' if tenant_phone else ''}\n\n"
        f"👉 *Examiner le dossier et les pièces justificatives :*\n"
        f"{site_url}/dashboard/bailleur?tab=candidatures\n\n"
        f"_Piolo — Gestion locative simplifiée._"
    )
    return send_whatsapp_message(
        landlord_phone,
        message,
        recipient_name=landlord.first_name or 'Propriétaire',
        action_title=f"Nouveau dossier déposé pour {prop.title}",
        details_text=f"Par {tenant_name}. Loyer proposé pour le {location.move_in_date}."
    )


# ═════════════════════════════════════════════════════════════════
# 3. NOTIFICATIONS DE CERTIFICATION BAILLEUR (KYC)
# ═════════════════════════════════════════════════════════════════

def send_bailleur_kyc_status_whatsapp(dossier, *, approved):
    """Alerte le bailleur sur WhatsApp lorsque son dossier KYC de certification est validé ou rejeté."""
    user = dossier.user
    phone = getattr(user, 'phone', '')
    if not phone:
        return False

    bonus = getattr(settings, 'POINTS_CONFIG', {}).get('BAILLEUR_WELCOME', 10)
    site_url = getattr(settings, 'FRONTEND_URL', 'https://piolo-immo.tech').rstrip('/')
    user_name = user.first_name or user.get_full_name() or "Propriétaire Bailleur"

    if approved:
        message = (
            f"🎉 *PIOLO — Félicitations ! Votre profil Bailleur est Certifié !* 🛡️\n\n"
            f"Bonjour {user_name} ! 👋\n"
            f"Votre dossier de certification a été examiné et *APPROUVÉ* avec succès par notre équipe de modération.\n\n"
            f"✨ *Vos avantages activés :*\n"
            f"• Badge officiel *Bailleur Vérifié* sur l'ensemble de vos annonces\n"
            f"• *+{bonus} points de confiance* crédités sur votre compte\n"
            f"• Visibilité prioritaire auprès des locataires solvables\n\n"
            f"👉 *Accéder à votre Dashboard Bailleur :*\n"
            f"{site_url}/dashboard/bailleur\n\n"
            f"_Piolo — L'Immobilier de standing en toute sérénité au Cameroun._"
        )
        action_title = "Compte Bailleur Vérifié et Validé"
        details_text = f"Badge officiel activé et +{bonus} points crédités sur votre compte."
    else:
        max_rej = getattr(settings, 'BAILLEUR_CONFIG', {}).get('MAX_REJECTIONS', 3)
        remaining = max(0, max_rej - dossier.rejection_count)
        reason = dossier.rejection_reason or "Pièces justificatives floues ou non conformes."
        message = (
            f"📋 *PIOLO — Information concernant votre Dossier Bailleur*\n\n"
            f"Bonjour {user_name},\n"
            f"L'examen de votre dossier de certification nécessite quelques ajustements avant d'être validé.\n\n"
            f"📝 *Motif indiqué par l'équipe :*\n"
            f"« {reason} »\n\n"
            f"🔄 *Tentatives restantes :* {remaining}/{max_rej}\n\n"
            f"👉 *Corriger et soumettre vos documents :*\n"
            f"{site_url}/dashboard/bailleur\n\n"
            f"_Besoin d'assistance ? Notre support WhatsApp : +237 658 32 42 85_"
        )
        action_title = "Ajustements requis sur votre dossier Bailleur"
        details_text = f"Motif : {reason}. Rendez-vous sur {site_url}/dashboard/bailleur"

    return send_whatsapp_message(
        phone,
        message,
        recipient_name=user_name,
        action_title=action_title,
        details_text=details_text
    )


# ═════════════════════════════════════════════════════════════════
# 4. NOTIFICATIONS DE DEVIS ARTISANS & BTP
# ═════════════════════════════════════════════════════════════════

def send_pro_quote_created_whatsapp(quote):
    """Alerte l'artisan / professionnel sur WhatsApp lorsqu'un client lui demande un devis."""
    pro = quote.professional
    pro_phone = pro.whatsapp or pro.phone or (pro.user.phone if hasattr(pro.user, 'phone') else '')
    if not pro_phone:
        return False

    client_name = quote.client_name or (quote.client_user.get_full_name() if quote.client_user else "Un client Piolo")
    site_url = getattr(settings, 'FRONTEND_URL', 'https://piolo-immo.tech').rstrip('/')

    message = (
        f"🔨 *PIOLO BTP & HABITAT — Nouvelle Demande de Devis !*\n\n"
        f"Bonjour {pro.business_name} ! 👷‍♂️\n"
        f"Vous avez reçu une nouvelle opportunité de chantier sur Piolo :\n\n"
        f"👤 *Client :* {client_name}\n"
        f"📌 *Type de projet :* {quote.project_type}\n"
        f"📍 *Ville / Quartier :* {quote.city or 'Cameroun'}\n"
        f"💰 *Budget estimé client :* {quote.budget_estimate or 'À discuter'}\n"
        f"📝 *Description :* {quote.description[:180] + ('...' if len(quote.description) > 180 else '')}\n\n"
        f"👉 *Consulter et répondre dans votre Dashboard Pro :*\n"
        f"{site_url}/dashboard/pro?tab=devis\n\n"
        f"_Piolo — Les meilleurs chantiers & artisans vérifiés au Cameroun._"
    )

    return send_whatsapp_message(
        pro_phone,
        message,
        recipient_name=pro.business_name,
        action_title=f"Nouveau projet BTP de {client_name}",
        details_text=f"Projet : {quote.project_type} ({quote.city or 'Cameroun'}). Voir {site_url}"
    )


def send_pro_quote_status_whatsapp(quote, *, status):
    """Alerte le client sur WhatsApp lorsque l'artisan a répondu ou mis à jour le devis."""
    client_phone = quote.client_phone or (quote.client_user.phone if quote.client_user and hasattr(quote.client_user, 'phone') else '')
    if not client_phone:
        return False

    pro = quote.professional
    client_name = quote.client_name or "Cher client"
    site_url = getattr(settings, 'FRONTEND_URL', 'https://piolo-immo.tech').rstrip('/')

    status_labels = {
        'CONTACTED': 'pris en compte (prise de contact)',
        'ACCEPTED': 'accepté',
        'COMPLETED': 'terminé avec succès',
        'REJECTED': 'décliné (artisan indisponible)'
    }
    status_label = status_labels.get(status, status)

    message = (
        f"🛠️ *PIOLO BTP — Suivi de votre Demande de Devis*\n\n"
        f"Bonjour {client_name} ! 👋\n"
        f"L'artisan *{pro.business_name}* a mis à jour votre demande concernant : *{quote.project_type}*.\n"
        f"📊 *Statut :* {status_label.upper()}\n\n"
        f"👉 *Voir les détails sur Piolo :*\n"
        f"{site_url}/dashboard/locataire\n\n"
        f"_Piolo BTP & Mobilier sur-mesure._"
    )

    return send_whatsapp_message(
        client_phone,
        message,
        recipient_name=client_name,
        action_title=f"Mise à jour devis par {pro.business_name}",
        details_text=f"Statut : {status_label}. Consultez votre espace sur {site_url}"
    )
