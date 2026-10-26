"""Reliable, explicit password-reset email delivery for Piolo."""

from pathlib import Path
from email.mime.image import MIMEImage
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def _attach_inline_logo(message):
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
            except Exception:
                pass
    return False


def send_password_reset_email(*, user, request):
    """Generate a token and hand off one branded reset email."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    site_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    recipient_name = (
        getattr(user, 'get_full_name', lambda: '')() or
        getattr(user, 'first_name', '') or
        user.email.split('@')[0]
    ).strip()

    context = {
        'email': user.email,
        'user': user,
        'recipient_name': recipient_name,
        'domain': request.get_host() if request else 'localhost:8080',
        'protocol': 'https' if (request and request.is_secure()) else 'http',
        'site_url': site_url,
        'uid': uid,
        'token': token,
    }
    subject = render_to_string('emails/password_reset_subject.txt', context).strip().replace('\n', ' ')
    text_body = render_to_string('emails/password_reset.txt', context)
    html_body = render_to_string('emails/password_reset.html', context)
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'Piolo Immobilier <noreply@piolo.cm>'),
        to=[user.email],
    )
    message.attach_alternative(html_body, 'text/html')
    _attach_inline_logo(message)
    return message.send(fail_silently=False)

