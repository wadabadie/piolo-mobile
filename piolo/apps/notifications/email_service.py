"""Envoi centralisé des emails transactionnels Piolo.

Les notifications in-app restent gérées par ``create_notification``. Ce
module ne fait qu'ajouter un canal email, avec un format commun et des URLs
absolues configurables. Les erreurs sont journalisées sans faire échouer
l'action métier qui vient d'être réalisée.
"""

import logging
from pathlib import Path
from email.mime.image import MIMEImage
from urllib.parse import urljoin

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger('apps.notifications.email')


def _absolute_url(path):
    if not path:
        return None
    if str(path).startswith(('http://', 'https://')):
        return str(path)
    base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/') + '/'
    return urljoin(base, str(path).lstrip('/'))


def _attach_inline_logo(message):
    """Attache le logo Piolo en tant qu'image MIME inline (CID).
    Permet à Gmail, Outlook et Apple Mail d'afficher le logo même en local/sans domaine public.
    """
    logo_candidates = [
        Path(settings.BASE_DIR) / 'static' / 'img' / 'logo-piolo-clean.png',
        Path(settings.BASE_DIR) / 'piolo-frontend' / 'public' / 'img' / 'logo-piolo-clean.png',
        Path(settings.BASE_DIR) / 'static' / 'img' / 'logo-piolo.png',
    ]
    for path in logo_candidates:
        if path.exists():
            try:
                with open(path, 'rb') as f:
                    img_data = f.read()
                img = MIMEImage(img_data, _subtype='png')
                img.add_header('Content-ID', '<piolo_logo>')
                img.add_header('Content-Disposition', 'inline', filename='logo-piolo.png')
                message.attach(img)
                return True
            except Exception as e:
                logger.warning('Impossible d attacher le logo CID : %s', e)
    return False


def send_transactional_email(*, recipient, subject, headline, body, action_url=None,
                             action_label=None, eyebrow='PIOLO IMMOBILIER',
                             icon='🔔', status_type='info', note=None,
                             property_title=None, property_location=None,
                             property_price=None, date_info=None, time_info=None,
                             badge_label=None):
    """Envoie un email HTML + texte ultra-stylisé et premium."""
    email = (getattr(recipient, 'email', '') or '').strip()
    if not email:
        return False
    if not getattr(settings, 'EMAIL_NOTIFICATIONS_ENABLED', True):
        logger.info('Email transactionnel désactivé pour %s (%s)', email, subject)
        return False

    site_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    recipient_name = (
        getattr(recipient, 'get_full_name', lambda: '')() or
        getattr(recipient, 'first_name', '') or
        email.split('@')[0]
    ).strip()

    context = {
        'recipient': recipient,
        'recipient_name': recipient_name,
        'eyebrow': eyebrow,
        'headline': headline,
        'body': body,
        'action_url': _absolute_url(action_url),
        'action_label': action_label,
        'icon': icon,
        'status_type': status_type,
        'badge_label': badge_label,
        'note': note,
        'property_title': property_title,
        'property_location': property_location,
        'property_price': property_price,
        'date_info': date_info,
        'time_info': time_info,
        'site_url': site_url,
    }

    try:
        text_body = render_to_string('emails/notification.txt', context).strip()
        html_body = render_to_string('emails/notification.html', context)
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'Piolo Immobilier <noreply@piolo.cm>'),
            to=[email],
        )
        message.attach_alternative(html_body, 'text/html')
        _attach_inline_logo(message)
        try:
            message.send(fail_silently=False)
            logger.info('Email transactionnel envoyé à %s (%s)', email, subject)
            return True
        except Exception as smtp_err:
            logger.warning("Échec envoi Django standard (%s), tentative via fallback direct SMTP...", smtp_err)
            import ssl
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
            port = getattr(settings, 'EMAIL_PORT', 587)
            user = getattr(settings, 'EMAIL_HOST_USER', '')
            pwd = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', user or 'noreply@piolo.cm')

            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = email
            msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_body, 'html', 'utf-8'))

            ctx = ssl._create_unverified_context()
            with smtplib.SMTP(host, port, timeout=20) as server:
                server.ehlo()
                server.starttls(context=ctx)
                server.ehlo()
                if user and pwd:
                    server.login(user, pwd)
                server.send_message(msg)

            logger.info('Email transactionnel envoyé avec succès via fallback SMTP direct à %s (%s)', email, subject)
            return True
    except Exception:
        logger.exception('Échec email transactionnel à %s (%s)', email, subject)
        return False


def _format_date(dt):
    if not dt:
        return ''
    if hasattr(dt, 'strftime'):
        return dt.strftime('%d/%m/%Y')
    return str(dt)


def _format_time(tm):
    if not tm:
        return ''
    if hasattr(tm, 'strftime'):
        return tm.strftime('%H:%M')
    return str(tm)[:5]


def send_visit_created_email(visit):
    prop = visit.property
    date_label = _format_date(visit.requested_date)
    time_label = _format_time(visit.requested_time)
    price_label = f"{int(prop.price):,} FCFA / mois".replace(',', ' ') if getattr(prop, 'price', None) else None
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or prop.neighborhood or '')
    tenant_name = visit.tenant.get_full_name() or visit.tenant.email
    tenant_phone = getattr(visit.tenant, 'phone', '')
    phone_info = f" (Tél : {tenant_phone})" if tenant_phone else ""

    body_lines = [
        f"Le locataire {tenant_name}{phone_info} souhaite planifier une visite pour votre annonce « {prop.title} ».",
        f"Date et heure souhaitées : {date_label}{(' à ' + time_label) if time_label else ''}."
    ]
    if visit.message:
        body_lines.append(f"Message du locataire : « {visit.message} »")
    body_lines.append("Connectez-vous à votre espace Bailleur pour confirmer ce créneau ou convenir d'une autre heure.")

    return send_transactional_email(
        recipient=prop.owner,
        subject=f'📅 Nouvelle demande de visite — {prop.title}',
        headline='Nouvelle demande de visite ! 📅',
        body="\n\n".join(body_lines),
        action_url=f'/visites/{visit.pk}',
        action_label='Confirmer ou gérer la visite',
        icon='📅',
        status_type='info',
        badge_label='Demande reçue',
        property_title=prop.title,
        property_location=loc_label,
        property_price=price_label,
        date_info=date_label,
        time_info=time_label,
    )


def send_visit_status_email(visit, *, confirmed):
    prop = visit.property
    date_obj = visit.confirmed_date or visit.requested_date
    time_obj = visit.confirmed_time or visit.requested_time
    date_label = _format_date(date_obj)
    time_label = _format_time(time_obj)
    price_label = f"{int(prop.price):,} FCFA / mois".replace(',', ' ') if getattr(prop, 'price', None) else None
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or prop.neighborhood or '')
    note_str = str(visit.bailleur_note).strip() if getattr(visit, 'bailleur_note', None) else None
    owner_name = prop.owner.get_full_name() or prop.owner.email
    owner_phone = getattr(prop.owner, 'phone', '')
    owner_info = f" avec le propriétaire {owner_name}" + (f" (Tél : {owner_phone})" if owner_phone else "")

    if confirmed:
        time_text = f" à {time_label}" if time_label else ""
        body_lines = [
            f"Excellente nouvelle ! Votre demande de visite pour « {prop.title} » a été confirmée par le propriétaire.",
            f"Rendez-vous confirmé le {date_label}{time_text}{owner_info}.",
            "Pensez à arriver à l'heure convenue au lieu du bien et à vous munir d'une pièce d'identité pour la visite."
        ]
        return send_transactional_email(
            recipient=visit.tenant,
            subject=f'🎉 Visite confirmée — {prop.title}',
            headline='Votre visite est confirmée ! 🎉',
            body="\n\n".join(body_lines),
            action_url=f'/visites/{visit.pk}',
            action_label='Voir les détails de ma visite',
            icon='✨',
            status_type='success',
            badge_label='Visite validée',
            note=note_str,
            property_title=prop.title,
            property_location=loc_label,
            property_price=price_label,
            date_info=date_label,
            time_info=time_label,
        )

    # Refusée / Déclinée
    body_lines = [
        f"Le bailleur n'a pas pu valider votre demande de créneau pour la visite de « {prop.title} ».",
    ]
    if note_str:
        body_lines.append(f"Motif ou précision du propriétaire : « {note_str} »")
    body_lines.append("Vous pouvez choisir un autre créneau horaire ou découvrir les autres logements similaires disponibles sur Piolo.")

    return send_transactional_email(
        recipient=visit.tenant,
        subject=f'❌ Demande de visite non retenue — {prop.title}',
        headline='Demande de visite non retenue',
        body="\n\n".join(body_lines),
        action_url='/properties',
        action_label='Découvrir d’autres biens',
        icon='✕',
        status_type='danger',
        badge_label='Créneau décliné',
        note=note_str,
        property_title=prop.title,
        property_location=loc_label,
        property_price=price_label,
        date_info=date_label,
        time_info=time_label,
    )


def send_visit_cancelled_email(visit):
    prop = visit.property
    date_obj = visit.confirmed_date or visit.requested_date
    time_obj = visit.confirmed_time or visit.requested_time
    date_label = _format_date(date_obj)
    time_label = _format_time(time_obj)
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or prop.neighborhood or '')
    tenant_name = visit.tenant.get_full_name() or visit.tenant.email
    time_text = f" à {time_label}" if time_label else ""

    return send_transactional_email(
        recipient=prop.owner,
        subject=f'⚠️ Visite annulée — {prop.title}',
        headline='Un rendez-vous de visite a été annulé ⚠️',
        body=(f"Le locataire {tenant_name} a annulé son rendez-vous de visite prévu le {date_label}{time_text} "
              f"pour le bien « {prop.title} ».\n\n"
              "Ce créneau a été automatiquement libéré dans votre calendrier."),
        action_url=f'/visites/{visit.pk}',
        action_label='Voir mon planning de visites',
        icon='ℹ️',
        status_type='info',
        badge_label='Visite annulée',
        property_title=prop.title,
        property_location=loc_label,
        date_info=date_label,
        time_info=time_label,
    )


def send_location_created_email(location):
    prop = location.property
    price_label = f"{int(prop.price):,} FCFA / mois".replace(',', ' ') if getattr(prop, 'price', None) else None
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or prop.neighborhood or '')
    tenant_name = location.tenant.get_full_name() or location.tenant.email
    tenant_phone = getattr(location.tenant, 'phone', '')
    phone_info = f" (Tél : {tenant_phone})" if tenant_phone else ""
    date_label = _format_date(location.move_in_date)
    income_label = f"{int(location.monthly_income):,} FCFA / mois".replace(',', ' ') if location.monthly_income else "Non précisé"

    body_lines = [
        f"Le locataire candidat {tenant_name}{phone_info} a soumis un dossier complet de candidature pour votre bien « {prop.title} ».",
        f"• Date d'entrée souhaitée : {date_label}",
        f"• Profession : {location.profession or 'Non spécifiée'}{(' chez ' + location.employer) if location.employer else ''}",
        f"• Revenus déclarés : {income_label}",
        f"• Durée du bail souhaitée : {location.lease_duration} mois ({location.tenant_count} occupant{'s' if location.tenant_count > 1 else ''})",
        f"• Garant : {'Oui (' + (location.guarantor_name or 'Garant déclaré') + ')' if location.has_guarantor else 'Non'}",
    ]
    if location.message:
        body_lines.append(f"\nMessage du candidat : « {location.message} »")
    body_lines.append("\nConsultez les pièces justificatives (CNI, fiches de paie/revenus) et rendez votre décision sur Piolo.")

    return send_transactional_email(
        recipient=prop.owner,
        subject=f'📑 Nouveau dossier de location — {prop.title}',
        headline='Nouveau dossier de candidature reçu ! 📑',
        body="\n".join(body_lines),
        action_url=f'/locations/{location.pk}',
        action_label='Examiner le dossier candidat',
        icon='📄',
        status_type='info',
        badge_label='Candidature reçue',
        property_title=prop.title,
        property_location=loc_label,
        property_price=price_label,
        date_info=date_label,
    )


def send_location_status_email(location, status_name):
    prop = location.property
    price_label = f"{int(prop.price):,} FCFA / mois".replace(',', ' ') if getattr(prop, 'price', None) else None
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or prop.neighborhood or '')
    note_str = str(location.bailleur_note).strip() if getattr(location, 'bailleur_note', None) else None
    owner_name = prop.owner.get_full_name() or prop.owner.email
    owner_phone = getattr(prop.owner, 'phone', '')
    owner_contact = f"{owner_name}" + (f" (Tél : {owner_phone})" if owner_phone else "")
    date_label = _format_date(location.move_in_date)

    if status_name == 'accepted':
        body_lines = [
            f"Félicitations ! Votre dossier de candidature pour le logement « {prop.title} » a été accepté par le propriétaire.",
            f"• Propriétaire / Contact : {owner_contact}",
            f"• Date d'entrée convenue : {date_label}",
            f"• Loyer mensuel : {price_label}",
            "\nLe propriétaire va prendre contact avec vous pour finaliser la signature du contrat de bail et organiser l'état des lieux d'entrée.",
        ]
        return send_transactional_email(
            recipient=location.tenant,
            subject=f'🎉 Dossier de location accepté — {prop.title}',
            headline='Votre dossier a été accepté ! 🎉',
            body="\n".join(body_lines),
            action_url=f'/locations/{location.pk}',
            action_label='Consulter les détails de mon contrat',
            icon='✨',
            status_type='success',
            badge_label='Candidature retenue',
            note=note_str,
            property_title=prop.title,
            property_location=loc_label,
            property_price=price_label,
            date_info=date_label,
        )

    elif status_name == 'reviewing':
        body_lines = [
            f"Votre dossier de location pour « {prop.title} » est actuellement en cours d'examen attentif par le propriétaire.",
            "Vous recevrez une notification et un email dès que la décision finale sera arrêtée.",
        ]
        return send_transactional_email(
            recipient=location.tenant,
            subject=f'🔍 Dossier en cours d’examen — {prop.title}',
            headline='Dossier en cours d’analyse 🔍',
            body="\n\n".join(body_lines),
            action_url=f'/locations/{location.pk}',
            action_label='Suivre l’avancement de mon dossier',
            icon='🔍',
            status_type='info',
            badge_label='En examen',
            note=note_str,
            property_title=prop.title,
            property_location=loc_label,
            property_price=price_label,
            date_info=date_label,
        )

    # Refused
    body_lines = [
        f"Le bailleur a finalisé l'étude des candidatures et n'a pas retenu votre dossier pour « {prop.title} ».",
    ]
    if note_str:
        body_lines.append(f"Motif ou précision du propriétaire : « {note_str} »")
    body_lines.append("\nNe vous découragez pas ! De nombreux autres logements de qualité sont disponibles sur Piolo.")

    return send_transactional_email(
        recipient=location.tenant,
        subject=f'❌ Candidature non retenue — {prop.title}',
        headline='Dossier non retenu pour ce logement',
        body="\n".join(body_lines),
        action_url='/properties',
        action_label='Explorer d’autres logements disponibles',
        icon='✕',
        status_type='danger',
        badge_label='Non retenu',
        note=note_str,
        property_title=prop.title,
        property_location=loc_label,
        property_price=price_label,
        date_info=date_label,
    )


def send_location_cancelled_email(location):
    prop = location.property
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or prop.neighborhood or '')
    tenant_name = location.tenant.get_full_name() or location.tenant.email

    return send_transactional_email(
        recipient=prop.owner,
        subject=f'⚠️ Candidature de location annulée — {prop.title}',
        headline='Une candidature de location a été annulée ⚠️',
        body=(f"Le candidat {tenant_name} a retiré / annulé sa candidature de location pour votre annonce « {prop.title} ».\n\n"
              "Votre annonce reste visible pour les autres locataires candidats."),
        action_url=f'/locations/{location.pk}',
        action_label='Gérer mes candidatures',
        icon='ℹ️',
        status_type='info',
        badge_label='Candidature annulée',
        property_title=prop.title,
        property_location=loc_label,
    )


def send_message_email(message, recipient):
    """Envoie une notification par email lors d'un nouveau message, avec debounce anti-spam."""
    if not recipient or not getattr(recipient, 'email', None):
        return False

    # Debounce anti-spam : Max 1 email toutes les 3 minutes par conversation pour éviter les rafales
    try:
        from django.core.cache import cache
        debounce_key = f'msg_email_throttle:{recipient.pk}:{message.conversation_id}'
        if cache.get(debounce_key):
            logger.info("Notification email pour message %s ignorée (throttled)", message.id)
            return False
        cache.set(debounce_key, True, 180)
    except Exception:
        pass

    prop = message.conversation.property
    sender_name = message.sender.get_full_name() or message.sender.email
    sender_role = getattr(message.sender, 'get_role_display', lambda: getattr(message.sender, 'role', ''))()
    property_title = prop.title if prop else None
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop and prop.neighborhood and prop.city else (prop.city if prop else '')
    price_label = f"{int(prop.price):,} FCFA / mois".replace(',', ' ') if prop and getattr(prop, 'price', None) else None

    # Extrait de message propre
    if message.content and message.content.strip():
        preview = message.content.strip()
        if len(preview) > 200:
            preview = preview[:197] + '...'
        msg_preview_text = f"« {preview} »"
    elif message.voice:
        msg_preview_text = "🎤 [Message vocal audio]"
    elif message.file:
        msg_preview_text = "📎 [Document / Fichier joint]"
    else:
        msg_preview_text = "Vous avez reçu un nouveau message."

    body_lines = [
        f"{sender_name} ({sender_role or 'Membre Piolo'}) vous a envoyé un message direct sur Piolo :",
        f"\n{msg_preview_text}\n",
    ]
    if property_title:
        body_lines.append(f"Conversation relative au bien : « {property_title} »")
    body_lines.append("Connectez-vous pour lire la conversation complète et lui répondre en direct.")

    return send_transactional_email(
        recipient=recipient,
        subject=f'💬 Nouveau message de {sender_name}' + (f' — {property_title}' if property_title else ''),
        headline='Vous avez reçu un nouveau message 💬',
        body="\n".join(body_lines),
        action_url=f'/messages/{message.conversation_id}',
        action_label='Répondre au message',
        icon='💬',
        status_type='info',
        badge_label='Nouveau message',
        property_title=property_title,
        property_location=loc_label if prop else None,
        property_price=price_label if prop else None,
    )


def send_welcome_email(user):
    """Envoie un email de bienvenue personnalisé selon le rôle du nouvel utilisateur."""
    role = str(getattr(user, 'role', 'LOCATAIRE')).upper()

    if role == 'BAILLEUR' or getattr(user, 'is_bailleur', False):
        subject = "Bienvenue sur Piolo — Votre Espace Bailleur 🏢"
        headline = "Bienvenue sur Piolo Immobilier ! 🔑"
        body = (
            "Votre inscription en tant que Propriétaire / Bailleur a bien été enregistrée.\n\n"
            "Pour garantir la sécurité de la communauté et certifier vos annonces, notre équipe "
            "procède actuellement à la vérification de vos pièces d'identité (CNI).\n\n"
            "Dès validation de votre dossier, vos points de bienvenue seront crédités et vous pourrez "
            "publier vos biens avec visites virtuelles 360° et vidéos immersives."
        )
        action_url = "/dashboard/bailleur"
        action_label = "Accéder à mon espace Bailleur"
        icon = "🏢"
        badge_label = "Inscription enregistrée"
        note = "Notre équipe valide les dossiers en moins de 24h ouvrées."
    elif role in ('ARCHITECTE', 'PRO', 'PROFESSIONNEL') or getattr(user, 'is_architecte', False) or getattr(user, 'is_pro', False):
        subject = "Bienvenue sur Piolo — Espace Professionnels & Artisans 📐"
        headline = "Bienvenue dans l'Annuaire des Pros Piolo ! 🛠️"
        bonus = getattr(settings, 'POINTS_CONFIG', {}).get('WELCOME_BONUS', 50)
        body = (
            f"Votre compte Professionnel est actif. {bonus} points de bienvenue ont été crédités sur votre compte.\n\n"
            "Vous pouvez dès maintenant compléter votre profil d'artisan / architecte, présenter vos réalisations "
            "et recevoir des demandes de devis qualifiées directement de nos utilisateurs."
        )
        action_url = "/dashboard/pro"
        action_label = "Configurer mon portfolio Pro"
        icon = "📐"
        badge_label = "Compte Professionnel Actif"
        note = "Complétez votre profil à 100% pour être mis en avant auprès des propriétaires."
    else:
        # Locataire
        subject = "Bienvenue sur Piolo — Trouvez le logement qui vous ressemble 🌟"
        headline = "Bienvenue sur Piolo Immobilier ! 🏡"
        bonus = getattr(settings, 'POINTS_CONFIG', {}).get('WELCOME_BONUS', 50)
        body = (
            f"Votre compte est désormais actif et {bonus} points de bienvenue vous sont offerts !\n\n"
            "Découvrez dès maintenant nos logements 100% vérifiés par CNI à Yaoundé et Douala, "
            "explorez les visites virtuelles 360°, le mode vidéo Reels et déposez vos dossiers de location en un clic."
        )
        action_url = "/properties"
        action_label = "Explorer les biens disponibles"
        icon = "🏡"
        badge_label = "Compte Locataire Actif"
        note = "Astuce : Enregistrez vos critères dans « Alertes » pour être notifié des nouvelles annonces en priorité."

    return send_transactional_email(
        recipient=user,
        subject=subject,
        headline=headline,
        body=body,
        action_url=action_url,
        action_label=action_label,
        icon=icon,
        status_type='success',
        badge_label=badge_label,
        note=note,
    )


# ═════════════════════════════════════════════════════════════════
# 5. EMAILS DE DEVIS PROFESSIONNELS & ARTISANS (MODULE 5)
# ═════════════════════════════════════════════════════════════════

def send_pro_quote_created_email(quote):
    """Envoie une alerte détaillée à l'artisan / professionnel lorsqu'un client soumet une demande de devis."""
    pro = quote.professional
    recipient = getattr(pro, 'user', None)
    email = getattr(recipient, 'email', None) or getattr(pro, 'email', None)
    if not email:
        return False

    # Création d'un objet récipient de secours si pro.user n'existe pas directement
    if not recipient:
        class PseudoRecipient:
            def __init__(self, email, name):
                self.email = email
                self.first_name = name
            def get_full_name(self):
                return self.first_name
        recipient = PseudoRecipient(email, pro.business_name)

    client_name = quote.client_name or (quote.client_user.get_full_name() if quote.client_user else "Client Piolo")
    client_phone = quote.client_phone or (getattr(quote.client_user, 'phone', '') if quote.client_user else "Non renseigné")
    client_email = quote.client_email or (getattr(quote.client_user, 'email', '') if quote.client_user else "Non renseigné")
    budget = quote.budget_estimate or "À discuter selon devis"
    delai = quote.desired_date or "Dès que possible"
    ville = quote.city or pro.city or "Cameroun"

    desc = quote.description.strip() if quote.description else "Aucune description complémentaire fournie."

    body = (
        f"Vous avez reçu une nouvelle demande de devis pour votre spécialité ({quote.project_type}) sur Piolo Immobilier.\n\n"
        f"👤 Client : {client_name}\n"
        f"📞 Téléphone / WhatsApp : {client_phone}\n"
        f"📧 Email : {client_email}\n"
        f"📍 Localisation du chantier : {ville}\n"
        f"💰 Budget estimatif client : {budget}\n"
        f"⏱️ Délai souhaité : {delai}\n\n"
        f"📝 Détail du besoin client :\n« {desc} »\n\n"
        f"Consultez l'opportunité dans votre espace professionnel pour accepter le chantier, ajuster vos disponibilités ou entrer directement en contact avec le client."
    )

    return send_transactional_email(
        recipient=recipient,
        subject=f"🔨 Nouvelle opportunité de devis : {quote.project_type} ({ville})",
        headline="Nouvelle demande de devis reçue ! 📐",
        body=body,
        action_url="/dashboard/pro?tab=devis",
        action_label="Gérer la demande & Répondre",
        icon="🔨",
        status_type="info",
        badge_label="Nouvelle Demande de Devis",
        note="Conseil Pro : Un premier contact établi sous 24h augmente de 80% votre taux de conversion en chantier signé.",
    )


def send_pro_quote_status_email(quote, *, status):
    """Alerte le client par email lors de la mise à jour du statut de son devis (Accepté, Refusé, Terminé)."""
    client_email = quote.client_email or (quote.client_user.email if quote.client_user and getattr(quote.client_user, 'email', None) else None)
    if not client_email:
        return False

    recipient = quote.client_user
    if not recipient:
        class PseudoRecipient:
            def __init__(self, email, name):
                self.email = email
                self.first_name = name
            def get_full_name(self):
                return self.first_name
        recipient = PseudoRecipient(client_email, quote.client_name or "Cher Client")

    pro = quote.professional
    pro_phone = pro.whatsapp or pro.phone or (getattr(pro.user, 'phone', '') if pro.user else '')
    pro_email = pro.email or (getattr(pro.user, 'email', '') if pro.user else '')
    client_name = quote.client_name or (recipient.get_full_name() if hasattr(recipient, 'get_full_name') else "Cher Client")

    status_upper = str(status).upper()

    if status_upper == 'ACCEPTED':
        subject = f"🎉 Devis accepté : {pro.business_name} prend en charge votre projet !"
        headline = "Bonne nouvelle ! Votre devis a été accepté 🛠️"
        body = (
            f"L'artisan professionnel {pro.business_name} ({pro.primary_trade}) a examiné votre demande concernant : « {quote.project_type} » "
            f"et a confirmé son accord de prise en charge.\n\n"
            f"👷‍♂️ Coordonnées directes du professionnel :\n"
            f"• Téléphone / WhatsApp : {pro_phone or 'Consulter sur la plateforme'}\n"
            f"• Email : {pro_email or 'Consulter sur la plateforme'}\n"
            f"• Ville / Rayon d'intervention : {pro.city}\n\n"
            f"Nous vous invitons à échanger avec l'artisan pour caler le calendrier des travaux et les modalités d'exécution."
        )
        action_url = "/dashboard/locataire"
        action_label = "Voir mes devis & chantiers"
        icon = "✅"
        status_type = "success"
        badge_label = "Devis Validé par l'Artisan"
        note = "Sécurité Piolo : Veillez à convenir d'un devis chiffré formel avant le démarrage des gros travaux."

    elif status_upper in ('REFUSED', 'REJECTED'):
        subject = f"Mise à jour devis — {pro.business_name} ({quote.project_type})"
        headline = "Information concernant votre demande de devis ⏳"
        body = (
            f"L'artisan {pro.business_name} n'est malheureusement pas disponible actuellement pour prendre en charge votre projet : « {quote.project_type} ».\n\n"
            f"Ne vous inquiétez pas, notre annuaire compte de nombreux autres professionnels et artisans certifiés "
            f"dans le domaine ({pro.primary_trade}) prêts à répondre rapidement à vos besoins."
        )
        action_url = "/professionnels"
        action_label = "Trouver d'autres artisans vérifiés"
        icon = "⏳"
        status_type = "warning"
        badge_label = "Artisan Indisponible"
        note = "Vous pouvez soumettre votre besoin à un autre artisan en un clic."

    elif status_upper == 'COMPLETED':
        subject = f"Chantier clôturé avec succès — {quote.project_type} 🏆"
        headline = "Votre chantier est marqué comme terminé ! ⭐"
        body = (
            f"Le professionnel {pro.business_name} a indiqué que la prestation pour votre projet « {quote.project_type} » est désormais finalisée.\n\n"
            f"Votre avis est précieux pour toute la communauté Piolo ! Prenez un instant pour noter l'artisan "
            f"et partager votre expérience sur la qualité des finitions et le respect des délais."
        )
        action_url = f"/professionnels/{pro.id}"
        action_label = "Laisser un avis vérifié 5★"
        icon = "🌟"
        status_type = "success"
        badge_label = "Chantier Terminé"
        note = "Votre note contribue à valoriser les artisans les plus rigoureux et recommandés du Cameroun."

    else:
        subject = f"Mise à jour de votre devis — {pro.business_name}"
        headline = f"Statut de votre devis : {status_upper} 📋"
        body = (
            f"Le professionnel {pro.business_name} a mis à jour le statut de votre demande de devis pour : « {quote.project_type} ».\n\n"
            f"Statut actuel : {status_upper}."
        )
        action_url = "/dashboard/locataire"
        action_label = "Consulter mon dossier"
        icon = "📋"
        status_type = "info"
        badge_label = f"Statut : {status_upper}"
        note = None

    return send_transactional_email(
        recipient=recipient,
        subject=subject,
        headline=headline,
        body=body,
        action_url=action_url,
        action_label=action_label,
        icon=icon,
        status_type=status_type,
        badge_label=badge_label,
        note=note,
    )


# ═════════════════════════════════════════════════════════════════
# 6. EMAILS ABONNEMENTS, POINTS & PAIEMENTS (MODULE 6)
# ═════════════════════════════════════════════════════════════════

def send_points_recharge_email(user, *, points_added, new_balance, price_paid, payment_method='Orange Money'):
    """Envoie une confirmation détaillée lors de l'achat / recharge d'un pack de points."""
    if not user or not getattr(user, 'email', None):
        return False

    price_formatted = f"{int(price_paid):,} FCFA".replace(',', ' ')
    body = (
        f"Votre recharge de points Piolo a été validée avec succès !\n\n"
        f"💎 Points crédités : +{points_added} pts\n"
        f"📊 Nouveau solde disponible : {new_balance} pts\n"
        f"💳 Montant réglé : {price_formatted} via {payment_method}\n\n"
        f"Vos points vous permettent de :\n"
        f"• Réserver des créneaux de visites immobilières en direct\n"
        f"• Débloquer les contacts vérifiés des propriétaires\n"
        f"• Envoyer des demandes de devis chantiers à nos artisans certifiés\n"
        f"• Accéder aux visites virtuelles 360° et vidéos immersives."
    )

    return send_transactional_email(
        recipient=user,
        subject=f"✨ Recharge réussie : +{points_added} Points crédités sur votre compte",
        headline="Votre solde de points a été rechargé ! 💎",
        body=body,
        action_url="/properties",
        action_label="Explorer les logements disponibles",
        icon="💎",
        status_type="success",
        badge_label=f"+{points_added} Points Crédités",
        note="Astuce : Vous pouvez suivre l'historique complet de vos points depuis votre tableau de bord.",
    )


def send_subscription_activated_email(subscription):
    """Envoie un email de bienvenue et de confirmation lors de l'activation d'un Pass VIP ou Relocation."""
    user = subscription.user
    if not user or not getattr(user, 'email', None):
        return False

    plan_name = subscription.get_plan_type_display() if hasattr(subscription, 'get_plan_type_display') else str(subscription.plan_type)
    billing_cycle = subscription.get_billing_cycle_display() if hasattr(subscription, 'get_billing_cycle_display') else str(subscription.billing_cycle)
    price_formatted = f"{int(subscription.price_paid):,} FCFA".replace(',', ' ')
    expires_str = subscription.expires_at.strftime('%d/%m/%Y')

    body = (
        f"Félicitations ! Votre souscription au {plan_name} est désormais active.\n\n"
        f"👑 Formule : {plan_name} ({billing_cycle})\n"
        f"📅 Valable jusqu'au : {expires_str}\n"
        f"💰 Montant : {price_formatted}\n\n"
        f"Vos privilèges VIP sont immédiatement débloqués :\n"
        f"• 0 point déduit : Visites et contacts bailleurs 100% illimités\n"
        f"• Alertes prioritaires WhatsApp & Email dès parution d'un nouveau bien\n"
        f"• Badge « Candidat VIP Vérifié » sur vos dossiers de location\n"
        f"• Accès immédiat aux visites virtuelles 360° et vidéos immersives Reels."
    )

    return send_transactional_email(
        recipient=user,
        subject=f"👑 Bienvenue dans votre {plan_name} — Piolo VIP",
        headline="Votre Pass VIP est actif ! 🚀",
        body=body,
        action_url="/dashboard/locataire",
        action_label="Accéder à mon espace VIP",
        icon="👑",
        status_type="success",
        badge_label="Pass VIP Actif",
        note="Votre priorité est désormais appliquée sur l'ensemble des annonces de la plateforme.",
    )


def send_subscription_expiring_email(subscription, *, days_left=0):
    """Alerte le locataire à J-5, J-2 ou J-0 avant l'expiration de son abonnement VIP."""
    user = subscription.user
    if not user or not getattr(user, 'email', None):
        return False

    plan_name = subscription.get_plan_type_display() if hasattr(subscription, 'get_plan_type_display') else str(subscription.plan_type)
    expires_str = subscription.expires_at.strftime('%d/%m/%Y')

    if days_left > 0:
        subject = f"⚠️ Votre {plan_name} expire dans {days_left} jours"
        headline = f"Votre Pass VIP expire dans {days_left} jours ⏳"
        body = (
            f"Votre abonnement {plan_name} arrive à son terme le {expires_str}.\n\n"
            f"Ne perdez pas votre avantage sur les meilleurs logements de Yaoundé et Douala ! "
            f"Renouvelez dès maintenant pour conserver vos visites illimitées et vos alertes prioritaires WhatsApp."
        )
        badge_label = f"Expire dans {days_left}j"
        status_type = "warning"
        icon = "⏳"
    else:
        subject = f"Votre {plan_name} est arrivé à échéance 🔑"
        headline = "Votre Pass VIP a pris fin 🔑"
        body = (
            f"Votre abonnement {plan_name} s'est achevé le {expires_str}.\n\n"
            f"Vous pouvez réactiver votre formule à tout moment en 1 clic pour continuer à profiter de toutes vos visites sans décompte de points."
        )
        badge_label = "Pass VIP Expiré"
        status_type = "info"
        icon = "🔑"

    return send_transactional_email(
        recipient=user,
        subject=subject,
        headline=headline,
        body=body,
        action_url="/dashboard/locataire",
        action_label="Prolonger mon Pass VIP",
        icon=icon,
        status_type=status_type,
        badge_label=badge_label,
        note="Renouvellement instantané par Orange Money ou MTN Mobile Money.",
    )


# ═════════════════════════════════════════════════════════════════
# 7. EMAILS ALERTES DE RECHERCHE & FAVORIS (MODULE 7)
# ═════════════════════════════════════════════════════════════════

def send_search_alert_match_email(search_alert, property_obj):
    """Envoie un email avec la fiche du bien lorsqu'une nouvelle annonce correspond aux critères d'une alerte."""
    user = search_alert.user
    if not user or not getattr(user, 'email', None):
        return False

    prop = property_obj
    prop_type_label = getattr(prop, 'get_property_type_display', lambda: prop.property_type)()
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or 'Cameroun')
    price_label = f"{int(prop.price):,} FCFA / mois".replace(',', ' ') if getattr(prop, 'price', None) else "Prix sur demande"

    specs = []
    if getattr(prop, 'bedrooms', None):
        specs.append(f"{prop.bedrooms} ch")
    if getattr(prop, 'bathrooms', None):
        specs.append(f"{prop.bathrooms} sdb")
    if getattr(prop, 'area', None):
        specs.append(f"{prop.area} m²")
    specs_text = " • ".join(specs) if specs else "Logement vérifié"

    body = (
        f"Une nouvelle annonce correspondant précisément à votre alerte « {search_alert.title} » vient d'être publiée sur Piolo !\n\n"
        f"🏡 {prop.title}\n"
        f"📍 Localisation : {loc_label}\n"
        f"💰 Loyer : {price_label}\n"
        f"📐 Caractéristiques : {prop_type_label} ({specs_text})\n\n"
        f"Consultez l'annonce immédiatement pour découvrir les photos, la visite virtuelle 360° et réserver votre créneau de visite avant les autres candidats."
    )

    return send_transactional_email(
        recipient=user,
        subject=f"🔔 Nouveau bien disponible : {prop.title} ({prop.city})",
        headline="Nouveau logement correspondant à votre alerte ! 🏡",
        body=body,
        action_url=f"/properties/{prop.pk}",
        action_label="Consulter la fiche & Réserver une visite",
        icon="🔔",
        status_type="info",
        badge_label="Nouvelle Annonce Correspondante",
        property_title=prop.title,
        property_location=loc_label,
        property_price=price_label,
        note="Conseil : Les biens de qualité se louent en moyenne en moins de 48h. Planifiez votre visite sans attendre.",
    )


def send_price_drop_email(user, property_obj, *, old_price, new_price):
    """Alerte par email un locataire ayant mis un bien en favori lorsque son loyer / prix diminue."""
    if not user or not getattr(user, 'email', None):
        return False

    prop = property_obj
    loc_label = f"{prop.neighborhood}, {prop.city}" if prop.neighborhood and prop.city else (prop.city or 'Cameroun')
    old_formatted = f"{int(old_price):,} FCFA".replace(',', ' ')
    new_formatted = f"{int(new_price):,} FCFA / mois".replace(',', ' ')
    economy = f"{int(old_price - new_price):,} FCFA / mois".replace(',', ' ')

    body = (
        f"Bonne nouvelle ! Le loyer d'un bien que vous avez ajouté à vos favoris vient de baisser :\n\n"
        f"🏡 {prop.title}\n"
        f"📍 Localisation : {loc_label}\n"
        f"📉 Ancien loyer : {old_formatted}\n"
        f"🏷️ Nouveau loyer : {new_formatted}\n"
        f"✨ Économie : -{economy}\n\n"
        f"C'est le moment idéal pour programmer une visite ou déposer votre candidature de location !"
    )

    return send_transactional_email(
        recipient=user,
        subject=f"📉 Baisse de prix sur votre favori : {prop.title}",
        headline="Baisse de prix sur l'un de vos favoris ! 💰",
        body=body,
        action_url=f"/properties/{prop.pk}",
        action_label="Voir le bien au nouveau prix",
        icon="📉",
        status_type="success",
        badge_label=f"-{economy}",
        property_title=prop.title,
        property_location=loc_label,
        property_price=new_formatted,
        note="Profitez de cette opportunité avant qu'un autre locataire ne réserve le bien.",
    )


def notify_matching_search_alerts(property_obj):
    """Parcourt toutes les alertes de recherche actives et notifie les locataires (Email + In-app)."""
    if not property_obj or getattr(property_obj, 'status', '') != 'PUBLISHED' or not getattr(property_obj, 'is_published', False):
        return 0

    try:
        from django.utils import timezone
        from apps.properties.models import SearchAlert
        from apps.notifications.models import Notification

        now = timezone.now()
        matching_alerts = SearchAlert.objects.filter(is_active=True).select_related('user')
        if property_obj.owner:
            matching_alerts = matching_alerts.exclude(user=property_obj.owner)

        notified_count = 0
        for alert in matching_alerts:
            try:
                if alert.matches(property_obj):
                    # In-app notification
                    Notification.objects.create(
                        recipient=alert.user,
                        kind=Notification.Kind.PROPERTY,
                        priority=Notification.Priority.NORMAL,
                        title=f"Alerte : Nouveau bien à {property_obj.city}",
                        body=f"Un bien correspondant à « {alert.title} » est disponible : {property_obj.title}.",
                        url=f"/properties/{property_obj.pk}",
                        dedupe_key=f"search_alert_{alert.id}_{property_obj.pk}",
                    )
                    # Transactional Email
                    send_search_alert_match_email(alert, property_obj)
                    alert.last_notified = now
                    alert.save(update_fields=['last_notified'])
                    notified_count += 1
            except Exception as e:
                logger.warning("Erreur lors de la notification pour l'alerte %s : %s", alert.id, e)

        return notified_count
    except Exception as err:
        logger.error("Erreur dans notify_matching_search_alerts : %s", err)
        return 0



