import os
import mimetypes
import re
from django.conf import settings
from django.http import HttpResponse, StreamingHttpResponse, Http404
from django.utils.http import http_date

RANGE_RE = re.compile(r'bytes\s*=\s*(\d+)\s*-\s*(\d*)', re.I)


def file_iterator(file_path, offset=0, length=None, chunk_size=262144):
    """Générateur de flux de fichiers découpé en fragments optimisés pour le streaming vidéo rapide."""
    with open(file_path, 'rb') as f:
        f.seek(offset)
        remaining = length
        while True:
            read_size = chunk_size if remaining is None else min(chunk_size, remaining)
            data = f.read(read_size)
            if not data:
                break
            if remaining is not None:
                remaining -= len(data)
            yield data
            if remaining is not None and remaining <= 0:
                break


import urllib.parse

def serve_media_with_range(request, path):
    """
    Sert les fichiers média avec support complet des requêtes HTTP Range (206 Partial Content).
    Permet un streaming instantané, le saut dans la timeline (seeking) et la fluidité des vidéos de 2 à 3 minutes.
    """
    clean_path = urllib.parse.unquote(path)
    full_path = os.path.abspath(os.path.join(settings.MEDIA_ROOT, clean_path))
    
    # Sécurité anti-traversal
    if not full_path.startswith(os.path.abspath(settings.MEDIA_ROOT)):
        raise Http404("Accès refusé.")
        
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise Http404("Fichier introuvable.")

    stat_result = os.stat(full_path)
    file_size = stat_result.st_size
    content_type, _ = mimetypes.guess_type(full_path)
    content_type = content_type or 'application/octet-stream'

    range_header = request.META.get('HTTP_RANGE', '').strip()
    
    # Gestion des requêtes partielles (Range)
    if range_header:
        match = RANGE_RE.match(range_header)
        if match:
            start_str, end_str = match.groups()
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1

            if start >= file_size or end >= file_size or start > end:
                response = HttpResponse(status=416)
                response['Content-Range'] = f"bytes */{file_size}"
                return response

            length = end - start + 1
            response = StreamingHttpResponse(
                file_iterator(full_path, offset=start, length=length, chunk_size=262144),
                status=206,
                content_type=content_type
            )
            response['Content-Range'] = f"bytes {start}-{end}/{file_size}"
            response['Content-Length'] = str(length)
            response['Accept-Ranges'] = 'bytes'
            response['Last-Modified'] = http_date(stat_result.st_mtime)
            response['Cache-Control'] = 'public, max-age=86400'
            return response

    # Requête standard (200 OK)
    response = StreamingHttpResponse(
        file_iterator(full_path, offset=0, length=file_size, chunk_size=524288),
        status=200,
        content_type=content_type
    )
    response['Content-Length'] = str(file_size)
    response['Accept-Ranges'] = 'bytes'
    response['Last-Modified'] = http_date(stat_result.st_mtime)
    response['Cache-Control'] = 'public, max-age=86400'
    return response
