import io
import re
from pathlib import Path

from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.exceptions import ValidationError


IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.bmp'}
IMAGE_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/bmp'}
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.m4v', '.mkv', '.avi', '.quicktime', '.3gp', '.ts', '.m2ts'}
VIDEO_MIME_TYPES = {
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
    'video/m4v', 'video/x-matroska', 'video/avi', 'video/msvideo',
    'video/3gpp', 'video/mp2t', 'video/ogg',
    'application/octet-stream'
}
DOCUMENT_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.pdf'}
DOCUMENT_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'application/pdf'}


def validate_uploaded_file(upload, *, allowed_extensions, allowed_mime_types=None,
                           max_size=None, label='Fichier'):
    if not upload:
        return upload
    max_size = max_size or getattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE', 250 * 1024 * 1024)
    extension = Path(getattr(upload, 'name', '')).suffix.lower()
    allowed_extensions = {str(value).lower() for value in allowed_extensions}
    if extension and extension not in allowed_extensions:
        raise ValidationError({label: f'Format de fichier ({extension}) non autorisé.'})
    if getattr(upload, 'size', 0) > max_size:
        raise ValidationError({label: f'Fichier trop volumineux (maximum {max_size // (1024 * 1024)} Mo).'})
    if allowed_mime_types:
        raw_mime = getattr(upload, 'content_type', '') or ''
        clean_mime = raw_mime.split(';')[0].strip().lower()
        allowed_set = {m.lower() for m in allowed_mime_types}
        if clean_mime and clean_mime not in allowed_set and clean_mime != 'application/octet-stream':
            raise ValidationError({label: f'Type MIME de fichier ({clean_mime}) non autorisé.'})
    return upload


def verify_image_integrity(upload, label='Image'):
    """
    Vérifie avec Pillow qu'un fichier image n'est pas tronqué ou corrompu par une coupure réseau.
    Si le fichier est un PDF ou un autre document, il passe sans modification.
    """
    if not upload:
        return upload

    extension = Path(getattr(upload, 'name', '')).suffix.lower()
    if extension in {'.pdf'}:
        return upload

    is_image = extension in IMAGE_EXTENSIONS or getattr(upload, 'content_type', '').startswith('image/')
    if not is_image:
        return upload

    try:
        from PIL import Image, ImageFile
        ImageFile.LOAD_TRUNCATED_IMAGES = False

        pos = upload.tell() if hasattr(upload, 'tell') else 0
        if hasattr(upload, 'seek'):
            upload.seek(0)

        img = Image.open(upload)
        img.verify()

        if hasattr(upload, 'seek'):
            upload.seek(pos)
    except Exception as exc:
        if hasattr(upload, 'seek'):
            upload.seek(0)
        raise ValidationError({label: f"Le fichier image est incomplet ou endommagé ({str(exc)}). Veuillez réimporter une photo nette."})

    return upload


def sanitize_and_optimize_image(upload, max_dim=1600, quality=85):
    """
    Normalise et compresse une image côté serveur (sRGB standard, orientation EXIF, dimensions max).
    Évite les artefacts arc-en-ciel, strips corrompus et surcharges disque.
    Si le fichier est un PDF ou un format non-image, le retourne intact.
    """
    if not upload:
        return upload

    extension = Path(getattr(upload, 'name', '')).suffix.lower()
    if extension in {'.pdf'}:
        return upload

    is_image = extension in IMAGE_EXTENSIONS or getattr(upload, 'content_type', '').startswith('image/')
    if not is_image:
        return upload

    try:
        from PIL import Image, ImageOps

        pos = upload.tell() if hasattr(upload, 'tell') else 0
        if hasattr(upload, 'seek'):
            upload.seek(0)

        img = Image.open(upload)
        # Redressement automatique selon orientation EXIF de l'appareil
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        # Conversion propre en sRGB pour éliminer tout bug de décodage de canal alpha ou CMYK
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Redimensionnement proportionnel si supérieur à max_dim
        w, h = img.size
        if w > max_dim or h > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)

        raw_stem = Path(getattr(upload, 'name', 'doc')).stem
        safe_stem = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_stem) or 'doc'
        safe_name = f"{safe_stem}.jpg"

        optimized_file = InMemoryUploadedFile(
            file=output,
            field_name=getattr(upload, 'field_name', None),
            name=safe_name,
            content_type='image/jpeg',
            size=output.getbuffer().nbytes,
            charset=None
        )
        return optimized_file
    except Exception:
        if hasattr(upload, 'seek'):
            upload.seek(0)
        return upload


