from rest_framework import viewsets, filters, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction, models
from django.utils import timezone
from django.http import FileResponse
from apps.properties.models import (
    Property, PropertyStatus, VisitRequest, LocationRequest,
    ShortStayBooking, PropertyImage, Favorite, SearchAlert,
    VirtualTour, PanoramaScene, PanoramaHotspot,
    PropertyBoost, BOOST_DURATIONS, BOOST_POINT_COSTS, _sync_property_boost
)
from apps.accounts.models import AuditLog, UserRole
from apps.notifications.models import Notification
from apps.notifications.services import create_notification
from apps.notifications.email_service import (
    send_visit_created_email, send_visit_status_email, send_visit_cancelled_email,
    send_location_created_email, send_location_status_email, send_location_cancelled_email,
)
from apps.notifications.whatsapp_service import (
    send_visit_created_whatsapp, send_visit_status_whatsapp,
    send_location_status_whatsapp, send_location_created_whatsapp,
)
from .serializers import PropertySerializer, PropertyCreateUpdateSerializer, PropertyCardSerializer, PanoramaSceneSerializer, PanoramaHotspotSerializer, RentEstimateSerializer
from apps.properties.ml.estimator import get_rent_estimator
from apps.core.file_validation import (
    validate_uploaded_file, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES,
    VIDEO_EXTENSIONS, VIDEO_MIME_TYPES, DOCUMENT_EXTENSIONS, DOCUMENT_MIME_TYPES,
)
import uuid
import logging

logger = logging.getLogger(__name__)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user and (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', '') == UserRole.ADMIN):
            return True
        return obj.owner == request.user


def _request_property_payload(request, prop):
    image = None
    if prop.main_image and getattr(prop.main_image, 'name', ''):
        try:
            image = request.build_absolute_uri(prop.main_image.url)
        except Exception:
            image = None
    return {
        'id': str(prop.id),
        'title': prop.title,
        'slug': prop.slug,
        'price': str(prop.price),
        'city': prop.city or '',
        'neighborhood': prop.neighborhood or '',
        'property_type': prop.property_type,
        'main_image': image,
    }


def _request_user_payload(user):
    return {
        'id': str(user.id),
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'full_name': user.get_full_name() or user.email,
        'email': user.email,
        'phone': getattr(user, 'phone', '') or '',
    }


class VisitRequestsListAPIView(APIView):
    """Liste complète des demandes de visite de l'utilisateur connecté."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') == 'BAILLEUR':
            queryset = VisitRequest.objects.filter(property__owner=request.user)
        else:
            queryset = VisitRequest.objects.filter(tenant=request.user)

        results = []
        for visit in queryset.select_related('property', 'tenant').order_by('-created_at'):
            results.append({
                'id': visit.pk,
                'status': visit.status,
                'status_display': visit.get_status_display(),
                'requested_date': str(visit.requested_date),
                'requested_time': str(visit.requested_time) if visit.requested_time else None,
                'confirmed_date': str(visit.confirmed_date) if visit.confirmed_date else None,
                'confirmed_time': str(visit.confirmed_time) if visit.confirmed_time else None,
                'message': visit.message or '',
                'bailleur_note': visit.bailleur_note or '',
                'created_at': visit.created_at.isoformat(),
                'property': _request_property_payload(request, visit.property),
                'tenant': _request_user_payload(visit.tenant),
            })
        return Response({'results': results, 'count': len(results)})


class LocationRequestsListAPIView(APIView):
    """Liste complète des dossiers de location de l'utilisateur connecté."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') == 'BAILLEUR':
            queryset = LocationRequest.objects.filter(property__owner=request.user)
        else:
            queryset = LocationRequest.objects.filter(tenant=request.user)

        results = []
        for location in queryset.select_related('property', 'tenant').order_by('-created_at'):
            results.append({
                'id': location.pk,
                'status': location.status,
                'status_display': location.get_status_display(),
                'move_in_date': str(location.move_in_date),
                'lease_duration': location.lease_duration,
                'tenant_count': location.tenant_count,
                'profession': location.profession or '',
                'employer': location.employer or '',
                'bailleur_note': location.bailleur_note or '',
                'dossier_completion': location.get_dossier_completion(),
                'created_at': location.created_at.isoformat(),
                'property': _request_property_payload(request, location.property),
                'tenant': _request_user_payload(location.tenant),
            })
        return Response({'results': results, 'count': len(results)})


class BookingRequestsListAPIView(APIView):
    """Liste des réservations de court séjour pour l'utilisateur connecté (Bailleur ou Voyageur)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') == 'BAILLEUR':
            queryset = ShortStayBooking.objects.filter(property__owner=request.user)
        else:
            queryset = ShortStayBooking.objects.filter(guest=request.user)

        property_id = request.query_params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        results = []
        for b in queryset.select_related('property', 'guest').order_by('-created_at'):
            results.append({
                'id': b.pk,
                'property': _request_property_payload(request, b.property),
                'guest': _request_user_payload(b.guest) if b.guest else {
                    'full_name': b.guest_name or 'Voyageur',
                    'phone': b.guest_phone or '',
                    'email': '',
                },
                'check_in_date': str(b.check_in_date),
                'check_out_date': str(b.check_out_date),
                'guests_count': b.guests_count,
                'nights_count': b.nights_count,
                'total_price': str(b.total_price),
                'status': b.status,
                'status_display': b.get_status_display(),
                'is_blocked_by_host': b.is_blocked_by_host,
                'block_reason': b.block_reason or '',
                'guest_note': b.guest_note or '',
                'host_note': b.host_note or '',
                'created_at': b.created_at.isoformat(),
            })
        return Response({'results': results, 'count': len(results)})


class PropertyViewSet(viewsets.ModelViewSet):
    """
    API Endpoint pour React ou applications mobiles.
    Routes CRUD complètes.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateUpdateSerializer
        return PropertySerializer

    def perform_create(self, serializer):
        user = self.request.user
        # Déduction des 20 points de publication bailleur si applicable
        if hasattr(user, 'points') and user.points >= 20:
            try:
                user.deduct_points(20, f"Publication de l'annonce : {serializer.validated_data.get('title', 'Bien immobilier')}")
            except Exception:
                pass

        instance = serializer.save(
            owner=user,
            status=PropertyStatus.PUBLISHED,
            is_published=True,
            published_at=timezone.now()
        )
        # Gestion des photos secondaires de la galerie
        secondary_images = self.request.FILES.getlist('secondary_images')
        for f in secondary_images:
            PropertyImage.objects.create(property=instance, image=f)

        # Notification automatique des alertes de recherche correspondantes (Module 7)
        try:
            from apps.notifications.email_service import notify_matching_search_alerts
            notify_matching_search_alerts(instance)
        except Exception:
            pass

    def perform_update(self, serializer):
        old_price = getattr(self.get_object(), 'price', None)
        instance = serializer.save()
        secondary_images = self.request.FILES.getlist('secondary_images')
        for f in secondary_images:
            PropertyImage.objects.create(property=instance, image=f)

        # Si baisse de prix sur un bien publié, alerter les utilisateurs ayant le bien en favori (Module 7)
        if instance.is_published and instance.status == PropertyStatus.PUBLISHED:
            if old_price and instance.price and instance.price < old_price:
                try:
                    from apps.notifications.email_service import send_price_drop_email
                    from apps.properties.models import Favorite
                    from apps.notifications.models import Notification
                    favs = Favorite.objects.filter(property=instance).select_related('user')
                    for fav in favs:
                        if fav.user and fav.user != instance.owner:
                            Notification.objects.create(
                                recipient=fav.user,
                                kind=Notification.Kind.PROPERTY,
                                priority=Notification.Priority.NORMAL,
                                title=f"Baisse de prix : {instance.title}",
                                body=f"Ce bien est passé de {int(old_price):,} FCFA à {int(instance.price):,} FCFA/mois.",
                                url=f"/properties/{instance.pk}",
                                dedupe_key=f"price_drop_{instance.pk}_{int(instance.price)}",
                            )
                            send_price_drop_email(fav.user, instance, old_price=old_price, new_price=instance.price)
                except Exception:
                    pass

    
    # Configuration des filtres et de la recherche
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtres exacts (?city=Douala&property_type=villa)
    filterset_fields = ['property_type', 'transaction_type', 'city', 'neighborhood', 'water_source', 'electricity_type', 'road_access', 'network_quality']
    
    # Recherche plein texte (?search=bonapriso)
    search_fields = ['title', 'description', 'city', 'neighborhood']
    
    # Tri (?ordering=-price ou ?ordering=created_at)
    ordering_fields = ['price', 'created_at', 'area']
    ordering = ['-created_at']

    def get_queryset(self):
        # Base queryset
        queryset = Property.objects.select_related('owner').prefetch_related('images', 'virtual_tours')
        
        if self.request.user.is_authenticated:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(is_published=True, status=PropertyStatus.PUBLISHED) | 
                Q(owner=self.request.user)
            )
        else:
            queryset = queryset.filter(is_published=True, status=PropertyStatus.PUBLISHED)

        owner_param = self.request.query_params.get('owner')
        if owner_param == 'mine' and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        transaction_type = self.request.query_params.get('transaction_type')

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        # ── Filtres de Réalité Terrain (Indice de Vie du Quartier) ──
        has_forage = self.request.query_params.get('has_forage')
        if has_forage in ['true', '1', True]:
            queryset = queryset.filter(water_source__in=['FORAGE', 'FORAGE_CAMWATER'])

        is_prepaid = self.request.query_params.get('is_prepaid')
        if is_prepaid in ['true', '1', True]:
            queryset = queryset.filter(electricity_type='PREPAYE')

        is_tarred = self.request.query_params.get('is_tarred')
        if is_tarred in ['true', '1', True]:
            queryset = queryset.filter(road_access='GOUDRON_DIRECT')

        water_source = self.request.query_params.get('water_source')
        if water_source:
            queryset = queryset.filter(water_source=water_source)

        electricity_type = self.request.query_params.get('electricity_type')
        if electricity_type:
            queryset = queryset.filter(electricity_type=electricity_type)

        road_access = self.request.query_params.get('road_access')
        if road_access:
            queryset = queryset.filter(road_access=road_access)

        return queryset

    @action(detail=True, methods=['post'], url_path='admin-moderate', permission_classes=[IsAuthenticated])
    def admin_moderate(self, request, pk=None):
        """Publie, archive ou remet en brouillon une annonce depuis l’espace admin."""
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        prop = get_object_or_404(Property, pk=pk)
        decision = str(request.data.get('action', '')).lower()
        if decision == 'publish':
            prop.status = PropertyStatus.PUBLISHED
            prop.is_published = True
            prop.published_at = prop.published_at or timezone.now()
            try:
                from apps.notifications.email_service import notify_matching_search_alerts
                notify_matching_search_alerts(prop)
            except Exception:
                pass
        elif decision == 'archive':
            prop.status = PropertyStatus.ARCHIVED
            prop.is_published = False
        elif decision == 'draft':
            prop.status = PropertyStatus.DRAFT
            prop.is_published = False
        else:
            return Response({'error': 'Décision de modération invalide.'}, status=400)
        prop.save(update_fields=['status', 'is_published', 'published_at', 'updated_at'])

        AuditLog.objects.create(
            user=request.user, email=prop.owner.email if prop.owner else '',
            action=f'PROPERTY_{decision.upper()}',
            details=f'Modération de l’annonce « {prop.title} » ({prop.id}).',
            ip_address=request.META.get('REMOTE_ADDR', ''), user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response({'ok': True, 'status': prop.status, 'is_published': prop.is_published})

    @action(detail=True, methods=['post'], url_path='book', permission_classes=[IsAuthenticated])
    def book_stay(self, request, pk=None):
        """Création d'une demande de réservation court séjour."""
        prop = self.get_object()
        if prop.transaction_type != 'COURTE_DUREE':
            return Response({'error': 'Ce logement n’est pas configuré pour des courts séjours.'}, status=400)

        check_in = request.data.get('check_in_date')
        check_out = request.data.get('check_out_date')
        guests_count = int(request.data.get('guests_count', 1))
        guest_note = request.data.get('guest_note', '').strip()

        if not check_in or not check_out:
            return Response({'error': 'Dates d’arrivée et de départ requises.'}, status=400)

        import datetime
        try:
            d_in = datetime.date.fromisoformat(str(check_in))
            d_out = datetime.date.fromisoformat(str(check_out))
        except ValueError:
            return Response({'error': 'Format de date invalide (YYYY-MM-DD attendu).'}, status=400)

        if d_in >= d_out:
            return Response({'error': 'La date de départ doit être postérieure à la date d’arrivée.'}, status=400)

        nights = (d_out - d_in).days
        total_price = (prop.price or 0) * nights

        # Vérifier conflit de dates
        conflict = ShortStayBooking.objects.filter(
            property=prop,
            status__in=['PENDING', 'CONFIRMED'],
            check_in_date__lt=d_out,
            check_out_date__gt=d_in
        ).exists()
        if conflict:
            return Response({'error': 'Ces dates sont déjà réservées ou indisponibles.'}, status=400)

        booking = ShortStayBooking.objects.create(
            property=prop,
            guest=request.user,
            guest_name=request.user.get_full_name() or request.user.email,
            guest_phone=getattr(request.user, 'phone', '') or '',
            check_in_date=d_in,
            check_out_date=d_out,
            guests_count=guests_count,
            nights_count=nights,
            total_price=total_price,
            guest_note=guest_note,
            status=ShortStayBooking.Status.PENDING
        )
        return Response({
            'ok': True,
            'booking_id': booking.pk,
            'message': 'Demande de réservation enregistrée avec succès.',
            'nights_count': nights,
            'total_price': str(total_price)
        }, status=201)

    @action(detail=True, methods=['post'], url_path='block-dates', permission_classes=[IsAuthenticated])
    def block_dates(self, request, pk=None):
        """Le bailleur bloque manuellement une plage de dates pour son logement."""
        prop = self.get_object()
        if prop.owner != request.user and not request.user.is_staff:
            return Response({'error': 'Seul le bailleur propriétaire peut bloquer des dates.'}, status=403)

        check_in = request.data.get('check_in_date')
        check_out = request.data.get('check_out_date')
        reason = request.data.get('block_reason', 'Indisponible (Hôte)').strip()

        if not check_in or not check_out:
            return Response({'error': 'Dates requises.'}, status=400)

        import datetime
        try:
            d_in = datetime.date.fromisoformat(str(check_in))
            d_out = datetime.date.fromisoformat(str(check_out))
        except ValueError:
            return Response({'error': 'Format de date invalide (YYYY-MM-DD attendu).'}, status=400)

        if d_in >= d_out:
            return Response({'error': 'La date de fin doit être postérieure à la date de début.'}, status=400)

        booking = ShortStayBooking.objects.create(
            property=prop,
            check_in_date=d_in,
            check_out_date=d_out,
            nights_count=(d_out - d_in).days,
            is_blocked_by_host=True,
            block_reason=reason,
            status=ShortStayBooking.Status.CONFIRMED
        )
        return Response({'ok': True, 'id': booking.pk, 'message': 'Dates bloquées avec succès.'}, status=201)

    @action(detail=True, methods=['post'], url_path='unblock-date', permission_classes=[IsAuthenticated])
    def unblock_date(self, request, pk=None):
        """Débloque une date spécifique précédemment bloquée par l'hôte."""
        prop = self.get_object()
        if prop.owner != request.user and not request.user.is_staff:
            return Response({'error': 'Non autorisé.'}, status=403)

        target_date = request.data.get('date')
        if not target_date:
            return Response({'error': 'Date requise.'}, status=400)

        deleted_count, _ = ShortStayBooking.objects.filter(
            property=prop,
            is_blocked_by_host=True,
            check_in_date__lte=target_date,
            check_out_date__gt=target_date
        ).delete()

        return Response({'ok': True, 'deleted': deleted_count, 'message': 'Date débloquée avec succès.'})
        
    def perform_create(self, serializer):
        if self.request.user.role != 'BAILLEUR' and self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les bailleurs peuvent créer des annonces.")

        if self.request.user.role == 'BAILLEUR' and not self.request.user.is_bailleur_active:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les bailleurs vérifiés peuvent publier une annonce.")

        if self.request.user.points < 20:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'points': 'Solde insuffisant. 20 points requis pour publier une annonce.'})

        with transaction.atomic():
            prop = serializer.save(
                owner=self.request.user,
                status=PropertyStatus.PUBLISHED,
                is_published=True,
                published_at=timezone.now(),
            )
            self._handle_secondary_images(prop)
            self.request.user.deduct_points(20, f"Publication annonce: {prop.title}")

    def perform_update(self, serializer):
        prop = serializer.save()
        self._handle_secondary_images(prop)

    def _handle_secondary_images(self, prop):
        # Gestion des images secondaires uploadées en multipart/form-data (champ 'secondary_images')
        images = self.request.FILES.getlist('secondary_images')
        if images:
            existing_count = prop.images.count()
            if existing_count + len(images) > 10:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'secondary_images': 'Vous pouvez ajouter jusqu’à 10 photos supplémentaires.'})
            # Pour l'ajout, on calcule le prochain 'order'
            current_max = prop.images.aggregate(models.Max('order'))['order__max']
            start_order = (current_max or 0) + 1
            
            for i, image in enumerate(images):
                validate_uploaded_file(
                    image, allowed_extensions=IMAGE_EXTENSIONS,
                    allowed_mime_types=IMAGE_MIME_TYPES, label='secondary_images',
                )
                PropertyImage.objects.create(
                    property=prop,
                    image=image,
                    order=start_order + i
                )

    @action(detail=True, methods=['post'], url_path='tour/scenes', permission_classes=[IsAuthenticated])
    def create_tour_scene(self, request, pk=None):
        """Ajoute une scène panoramique à la visite du bien du bailleur."""
        prop = self.get_object()
        if prop.owner_id != request.user.id:
            return Response({'detail': 'Vous ne pouvez modifier que vos propres biens.'}, status=403)
        image = request.FILES.get('image')
        name = str(request.data.get('room_name', '')).strip()
        if not image:
            return Response({'detail': 'Une image panoramique est requise.'}, status=400)
        validate_uploaded_file(
            image, allowed_extensions=IMAGE_EXTENSIONS,
            allowed_mime_types=IMAGE_MIME_TYPES, label='image',
        )
        if not name:
            return Response({'detail': 'Le nom de la pièce est requis.'}, status=400)
        tour, _ = VirtualTour.objects.get_or_create(property=prop)
        scene = PanoramaScene.objects.create(tour=tour, name=name, image=image, order=tour.scenes.count())
        return Response(PanoramaSceneSerializer(scene, context={'request': request}).data, status=201)

    @action(detail=True, methods=['post'], url_path='tour/stitch', permission_classes=[IsAuthenticated])
    def stitch_tour_scene(self, request, pk=None):
        """Assemble automatiquement les prises de vue capturées par le smartphone en un panorama 360° équirectangulaire."""
        prop = self.get_object()
        if prop.owner_id != request.user.id and not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Vous ne pouvez modifier que vos propres biens.'}, status=403)

        name = str(request.data.get('room_name', '')).strip()
        if not name:
            return Response({'detail': 'Le nom de la pièce est requis.'}, status=400)

        metadata_raw = request.data.get('metadata')
        if not metadata_raw:
            return Response({'detail': 'Les métadonnées d’orientation sont requises.'}, status=400)

        import json
        import cv2
        import numpy as np
        from django.core.files.base import ContentFile
        from apps.properties.pano.stitcher import Frame, stitch_equirectangular

        try:
            if isinstance(metadata_raw, str):
                metadata = json.loads(metadata_raw)
            else:
                metadata = metadata_raw
        except Exception as e:
            return Response({'detail': f'Format JSON des métadonnées invalide: {e}'}, status=400)

        frames_files = request.FILES.getlist('frames')
        if not frames_files or len(frames_files) < 4:
            return Response({'detail': 'Au moins 4 prises de vue sont requises pour générer un 360°.'}, status=400)

        if len(frames_files) != len(metadata):
            return Response({'detail': f'Nombre d’images ({len(frames_files)}) différent des métadonnées ({len(metadata)}).'}, status=400)

        frames_list = []
        for i, file_obj in enumerate(frames_files):
            meta = metadata[i]
            file_bytes = file_obj.read()
            img_bgr = cv2.imdecode(np.frombuffer(file_bytes, np.uint8), cv2.IMREAD_COLOR)
            if img_bgr is None:
                continue

            r_flat = meta.get('R')
            if not r_flat or len(r_flat) != 9:
                continue
            r_mat = np.array(r_flat, dtype=np.float64).reshape((3, 3))
            focal = float(meta.get('focal', 0.0))
            if focal <= 0:
                h, w = img_bgr.shape[:2]
                focal = float((h / 2.0) / np.tan(np.radians(65.0 / 2.0)))

            frames_list.append(Frame(image=img_bgr, R=r_mat, focal=focal))

        if len(frames_list) < 4:
            return Response({'detail': 'Trop peu de clichés exploitables reçus.'}, status=400)

        try:
            out_width = int(request.data.get('out_width', 4096))
            out_width = min(max(out_width, 2048), 6000)
            refine = str(request.data.get('refine', 'true')).lower() in ('true', '1')

            jpeg_bytes = stitch_equirectangular(
                frames_list,
                out_width=out_width,
                refine=refine,
                jpeg_quality=92
            )
        except Exception as e:
            logger.exception("Erreur lors de l'assemblage 360°: %s", e)
            return Response({'detail': f"Erreur lors de l'assemblage 360°: {str(e)}"}, status=500)

        file_name = f"{name.lower().replace(' ', '_')}_360.jpg"
        content_file = ContentFile(jpeg_bytes, name=file_name)

        tour, _ = VirtualTour.objects.get_or_create(property=prop)
        scene = PanoramaScene.objects.create(
            tour=tour,
            name=name,
            image=content_file,
            order=tour.scenes.count()
        )
        return Response(PanoramaSceneSerializer(scene, context={'request': request}).data, status=201)


    @action(detail=True, methods=['delete'], url_path='tour/scenes/(?P<scene_id>[^/.]+)', permission_classes=[IsAuthenticated])
    def delete_tour_scene(self, request, pk=None, scene_id=None):
        prop = self.get_object()
        if prop.owner_id != request.user.id:
            return Response({'detail': 'Accès interdit.'}, status=403)
        scene = get_object_or_404(PanoramaScene, id=scene_id, tour__property=prop)
        scene.delete()
        return Response({'ok': True})

    @action(detail=True, methods=['post'], url_path='tour/hotspots', permission_classes=[IsAuthenticated])
    def create_tour_hotspot(self, request, pk=None):
        prop = self.get_object()
        if prop.owner_id != request.user.id:
            return Response({'detail': 'Accès interdit.'}, status=403)
        scene = get_object_or_404(PanoramaScene, id=request.data.get('scene_id'), tour__property=prop)
        target = get_object_or_404(PanoramaScene, id=request.data.get('target_scene_id'), tour__property=prop)
        try:
            pitch = float(request.data.get('pitch', 0))
            yaw = float(request.data.get('yaw', 0))
        except (TypeError, ValueError):
            return Response({'detail': 'Position du hotspot invalide.'}, status=400)
        hotspot = PanoramaHotspot.objects.create(
            scene=scene, target_scene=target, pitch=max(-90, min(90, pitch)),
            yaw=max(-180, min(180, yaw)), hotspot_type='scene',
            label=str(request.data.get('label', '')).strip()[:100]
        )
        return Response(PanoramaHotspotSerializer(hotspot, context={'request': request}).data, status=201)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        prop = self.get_object()
        try:
            image = prop.images.get(id=image_id)
            image.delete()
            return Response({'ok': True, 'message': 'Image supprimée avec succès.'})
        except PropertyImage.DoesNotExist:
            return Response({'ok': False, 'error': 'Image introuvable.'}, status=404)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Property.objects.filter(pk=instance.pk).update(views_count=models.F('views_count') + 1)
        instance.refresh_from_db(fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='view', permission_classes=[permissions.AllowAny])
    def record_view(self, request, pk=None):
        """Incrémenter le compteur de vues d'un bien / reel."""
        prop = self.get_object()
        Property.objects.filter(pk=prop.pk).update(views_count=models.F('views_count') + 1)
        prop.refresh_from_db(fields=['views_count'])
        return Response({'ok': True, 'views_count': prop.views_count})

    @action(detail=True, methods=['post'], url_path='favorite', permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        """Locataire ajoute ou retire un bien de ses favoris."""
        prop = self.get_object()
        
        # Check if already favorited
        fav = Favorite.objects.filter(user=request.user, property=prop).first()
        if fav:
            # Unfavorite
            fav.delete()
            is_favorite = False
            if prop.favorites_count > 0:
                prop.favorites_count -= 1
                prop.save(update_fields=['favorites_count'])
        else:
            # Favorite
            Favorite.objects.create(user=request.user, property=prop)
            is_favorite = True
            prop.favorites_count += 1
            prop.save(update_fields=['favorites_count'])
            
        return Response({
            'ok': True,
            'is_favorite': is_favorite,
            'count': prop.favorites_count
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        """Liste des annonces favorites de l'utilisateur connecté."""
        properties = Property.objects.filter(
            favorited_by__user=request.user
        ).exclude(
            status='ARCHIVED'
        ).select_related('owner').prefetch_related('images', 'virtual_tours').order_by('-favorited_by__created_at')
        return Response(PropertyCardSerializer(properties, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def alerts(self, request):
        """Consulter ou créer les alertes de recherche React."""
        if request.method == 'GET':
            alerts = SearchAlert.objects.filter(user=request.user)
            return Response([self._serialize_alert(alert) for alert in alerts])

        required = ['title']
        missing = [field for field in required if not str(request.data.get(field, '')).strip()]
        if missing:
            return Response({'detail': "Le nom de l'alerte est requis."}, status=400)
        alert = SearchAlert.objects.create(
            user=request.user,
            title=str(request.data['title']).strip(),
            city=str(request.data.get('city', '')).strip(),
            neighborhood=str(request.data.get('neighborhood', '')).strip(),
            property_type=str(request.data.get('property_type', '')).strip(),
            transaction_type=str(request.data.get('transaction_type', 'LOCATION')).strip(),
            min_price=request.data.get('min_price') or None,
            max_price=request.data.get('max_price') or None,
            min_area=request.data.get('min_area') or None,
        )
        return Response(self._serialize_alert(alert), status=201)

    @action(detail=False, methods=['delete'], url_path='alerts/(?P<alert_id>[^/.]+)', permission_classes=[IsAuthenticated])
    def delete_alert(self, request, alert_id=None):
        alert = get_object_or_404(SearchAlert, id=alert_id, user=request.user)
        alert.delete()
        return Response({'ok': True})

    @action(detail=False, methods=['get'], url_path='alerts/(?P<alert_id>[^/.]+)/results', permission_classes=[IsAuthenticated])
    def alert_results(self, request, alert_id=None):
        alert = get_object_or_404(SearchAlert, id=alert_id, user=request.user)
        properties = self._alert_matches(alert).select_related('owner').prefetch_related('images')
        return Response(PropertyCardSerializer(properties, many=True, context={'request': request}).data)

    @staticmethod
    def _alert_matches(alert):
        properties = Property.objects.filter(is_published=True, status=PropertyStatus.PUBLISHED)
        if alert.city:
            properties = properties.filter(city__icontains=alert.city)
        if alert.neighborhood:
            properties = properties.filter(neighborhood__icontains=alert.neighborhood)
        if alert.property_type:
            properties = properties.filter(property_type=alert.property_type)
        if alert.transaction_type:
            properties = properties.filter(transaction_type=alert.transaction_type)
        if alert.min_price:
            properties = properties.filter(price__gte=alert.min_price)
        if alert.max_price:
            properties = properties.filter(price__lte=alert.max_price)
        if alert.min_area:
            properties = properties.filter(area__gte=alert.min_area)
        return properties.order_by('-published_at')

    @staticmethod
    def _serialize_alert(alert):
        return {
            'id': alert.id, 'title': alert.title, 'city': alert.city,
            'neighborhood': alert.neighborhood,
            'property_type': alert.property_type, 'transaction_type': alert.transaction_type,
            'min_price': alert.min_price, 'max_price': alert.max_price,
            'min_area': alert.min_area, 'is_active': alert.is_active,
            'created_at': alert.created_at,
            'matches_count': PropertyViewSet._alert_matches(alert).count(),
        }

    def get_object(self):
        """
        Override pour permettre la recherche par slug OU par pk (UUID).
        Si la valeur ressemble à un UUID, on cherche par pk.
        Sinon, on cherche par slug.
        """
        lookup_value = self.kwargs.get(self.lookup_field)
        queryset = self.filter_queryset(self.get_queryset())
        
        # Détecter si c'est un UUID ou un slug
        try:
            uuid.UUID(str(lookup_value))
            # C'est un UUID → chercher par pk
            obj = queryset.get(pk=lookup_value)
        except (ValueError, AttributeError):
            # C'est un slug → chercher par slug
            obj = queryset.get(slug=lookup_value)
        
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get'])
    def discovery(self, request):
        """
        Endpoint spécifique pour le mode Découverte (style TikTok)
        Ne renvoie que les propriétés publiées avec une vidéo 'video_reel' et autorisées par la modération.
        URL: /api/v1/properties/discovery/
        """
        properties = self.get_queryset().exclude(video_reel='').exclude(video_reel__isnull=True).filter(
            status=PropertyStatus.PUBLISHED,
            is_published=True,
            is_in_discovery=True
        ).order_by('-is_discovery_featured', '-discovery_priority', '-published_at')

        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='discovery-view')
    def discovery_view(self, request, pk=None):
        """Incrémente le compteur de vues Découverte."""
        prop = self.get_object()
        prop.discovery_views_count = models.F('discovery_views_count') + 1
        prop.save(update_fields=['discovery_views_count'])
        prop.refresh_from_db(fields=['discovery_views_count'])
        return Response({'ok': True, 'views_count': prop.discovery_views_count})

    @action(detail=True, methods=['post'], url_path='discovery-like', permission_classes=[IsAuthenticated])
    def discovery_like(self, request, pk=None):
        """Incrémente/décrémente le like du Reel Découverte."""
        prop = self.get_object()
        prop.discovery_likes_count = models.F('discovery_likes_count') + 1
        prop.save(update_fields=['discovery_likes_count'])
        prop.refresh_from_db(fields=['discovery_likes_count'])
        return Response({'ok': True, 'likes_count': prop.discovery_likes_count})

    @action(detail=True, methods=['post'], url_path='admin-discovery-moderate', permission_classes=[IsAuthenticated])
    def admin_discovery_moderate(self, request, pk=None):
        """
        Contrôle complet SuperAdmin du trafic et de la modération du Mode Découverte.
        Permet d'activer/bloquer un reel du flux, le mettre en vedette, ajuster la priorité,
        ou supprimer la vidéo.
        URL: /api/v1/properties/{id}/admin-discovery-moderate/
        """
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', '') == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        prop = self.get_object()
        action_type = str(request.data.get('action', '')).lower()
        
        if action_type == 'toggle_visibility':
            prop.is_in_discovery = not prop.is_in_discovery
            if prop.is_in_discovery:
                prop.discovery_blocked_reason = ''
            else:
                prop.discovery_blocked_reason = request.data.get('reason', 'Bloqué par la modération')
        elif action_type == 'approve':
            prop.is_in_discovery = True
            prop.discovery_blocked_reason = ''
        elif action_type == 'block':
            prop.is_in_discovery = False
            prop.discovery_blocked_reason = request.data.get('reason', 'Bloqué par l\'administrateur')
        elif action_type == 'toggle_featured':
            prop.is_discovery_featured = not prop.is_discovery_featured
        elif action_type == 'set_priority':
            prop.discovery_priority = int(request.data.get('priority', 0))
        elif action_type == 'delete_video':
            if prop.video_reel:
                try:
                    prop.video_reel.delete(save=False)
                except Exception:
                    pass
                prop.video_reel = None
                prop.reel_description = ''
                prop.is_in_discovery = False
        else:
            return Response({'error': 'Action de modération Découverte inconnue.'}, status=400)

        prop.save()

        # Audit Log
        AuditLog.objects.create(
            user=request.user,
            email=prop.owner.email if prop.owner else '',
            action=f'DISCOVERY_{action_type.upper()}',
            details=f"Modération Découverte sur « {prop.title} » ({prop.id}) : InDiscovery={prop.is_in_discovery}, Featured={prop.is_discovery_featured}, Priority={prop.discovery_priority}.",
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        return Response({
            'ok': True,
            'is_in_discovery': prop.is_in_discovery,
            'is_discovery_featured': prop.is_discovery_featured,
            'discovery_priority': prop.discovery_priority,
            'discovery_blocked_reason': prop.discovery_blocked_reason,
            'message': 'Modération du mode Découverte enregistrée avec succès.'
        })

    @action(detail=True, methods=['post', 'patch', 'delete'], url_path='video-reel', permission_classes=[IsAuthenticated])
    def video_reel(self, request, pk=None):
        """
        Gère l'upload, la modification ou la suppression du Reel Vidéo + Légende (Studio Reel)
        URL: /api/v1/properties/{id}/video-reel/
        """
        prop = self.get_object()
        if prop.owner != request.user and not request.user.is_staff:
            return Response({'ok': False, 'error': 'Non autorisé.'}, status=403)

        if request.method == 'DELETE':
            if prop.video_reel:
                try:
                    prop.video_reel.delete(save=False)
                except Exception:
                    pass
                prop.video_reel = None
                prop.reel_description = ''
                prop.save(update_fields=['video_reel', 'reel_description'])
            return Response({'ok': True, 'message': 'Vidéo supprimée avec succès.'})

        # Upload de fichier vidéo
        if 'video_reel' in request.FILES:
            video = request.FILES['video_reel']
            try:
                validate_uploaded_file(
                    video, allowed_extensions=VIDEO_EXTENSIONS,
                    allowed_mime_types=VIDEO_MIME_TYPES, label='video_reel',
                    max_size=200 * 1024 * 1024,
                )
            except Exception as exc:
                return Response({'ok': False, 'error': str(exc)}, status=400)

            if prop.video_reel:
                try:
                    prop.video_reel.delete(save=False)
                except Exception:
                    pass
            prop.video_reel = video

        # Mise à jour de la description/légende
        description = request.data.get('reel_description') or request.data.get('caption') or request.POST.get('reel_description') or request.POST.get('caption')
        if description is not None:
            prop.reel_description = str(description).strip()

        prop.save()
        return Response({
            'ok': True,
            'message': 'Reel enregistré avec succès.',
            'data': self.get_serializer(prop).data
        })

    @action(detail=True, methods=['post'], url_path='visit', permission_classes=[IsAuthenticated])
    def visit(self, request, pk=None):
        """Locataire crée une demande de visite — déduit 20 pts (via API)."""
        prop = self.get_object()

        if prop.status != PropertyStatus.PUBLISHED or not prop.is_published:
            return Response({'ok': False, 'error': 'Ce logement n’est plus disponible pour une visite.'}, status=400)

        if prop.owner == request.user:
            return Response({'ok': False, 'error': 'Vous ne pouvez pas visiter votre propre bien.'}, status=400)

        existing = VisitRequest.objects.filter(
            property=prop, tenant=request.user,
            status__in=['PENDING', 'CONFIRMED']
        ).first()
        if existing:
            return Response({'ok': False, 'error': 'Vous avez déjà une demande en cours pour ce bien.'}, status=400)

        is_vip = getattr(request.user, 'is_vip_tenant', False)
        visit_cost = 0 if is_vip else 5

        if not is_vip and request.user.points < visit_cost:
            return Response({'ok': False, 'error': f'Solde insuffisant. {visit_cost} points requis.'}, status=400)

        requested_date = request.data.get('requested_date')
        requested_time = request.data.get('requested_time') or None
        message = request.data.get('message', '').strip()

        if not requested_date:
            return Response({'ok': False, 'error': 'Date de visite requise.'}, status=400)

        with transaction.atomic():
            visit = VisitRequest.objects.create(
                property=prop,
                tenant=request.user,
                requested_date=requested_date,
                requested_time=requested_time,
                message=message,
                points_deducted=(visit_cost > 0),
            )
            if visit_cost > 0:
                request.user.deduct_points(visit_cost, f"Demande de visite : {prop.title}")
            transaction.on_commit(lambda: create_notification(
                prop.owner,
                Notification.Kind.VISIT,
                'Nouvelle demande de visite',
                f'{request.user.get_full_name() or request.user.email} souhaite visiter « {prop.title} ».',
                actor=request.user,
                url=f'/visites/{visit.pk}',
                entity_type='visit',
                entity_id=visit.pk,
                data={'property_id': str(prop.pk), 'requested_date': str(visit.requested_date)},
                priority=Notification.Priority.HIGH,
                dedupe_key=f'visit:{visit.pk}:created',
            ))
            transaction.on_commit(lambda: send_visit_created_email(visit))
            transaction.on_commit(lambda: send_visit_created_whatsapp(visit))

        return Response({
            'ok': True,
            'message': f'Demande de visite envoyée ! ({visit_cost} points déduits)' if visit_cost > 0 else 'Demande de visite envoyée ! (Inclus Pass VIP)',
            'visit_id': visit.pk,
            'points_remaining': request.user.points,
        })

    @action(detail=True, methods=['post'], url_path='location', permission_classes=[IsAuthenticated])
    def location(self, request, pk=None):
        """Locataire soumet un dossier de location — déduit 6 pts ou 0 si VIP."""
        prop = self.get_object()

        if prop.status != PropertyStatus.PUBLISHED or not prop.is_published:
            return Response({'ok': False, 'error': 'Ce logement n’est plus disponible à la location.'}, status=400)

        if prop.owner == request.user:
            return Response({'ok': False, 'error': 'Action impossible sur votre propre bien.'}, status=400)

        existing = LocationRequest.objects.filter(
            property=prop, tenant=request.user,
            status__in=['PENDING', 'REVIEWING', 'ACCEPTED']
        ).first()
        if existing:
            return Response({'ok': False, 'error': 'Vous avez déjà un dossier en cours pour ce bien.'}, status=400)

        is_vip = getattr(request.user, 'is_vip_tenant', False)
        loc_cost = 0 if is_vip else 6

        if not is_vip and request.user.points < loc_cost:
            return Response({'ok': False, 'error': f'Solde insuffisant. {loc_cost} points requis.'}, status=400)

        move_in_date = request.data.get('move_in_date')
        if not move_in_date:
            return Response({'ok': False, 'error': "Date d'entrée requise."}, status=400)

        with transaction.atomic():
            loc = LocationRequest(
                property=prop,
                tenant=request.user,
                move_in_date=move_in_date,
                lease_duration=int(request.data.get('lease_duration', 12)),
                tenant_count=int(request.data.get('tenant_count', 1)),
                monthly_income=request.data.get('monthly_income') or None,
                profession=request.data.get('profession', '').strip(),
                employer=request.data.get('employer', '').strip(),
                message=request.data.get('message', '').strip(),
                has_guarantor=str(request.data.get('has_guarantor')).lower() in ['true', 'on', '1', 'yes'],
                guarantor_name=request.data.get('guarantor_name', '').strip(),
                guarantor_phone=request.data.get('guarantor_phone', '').strip(),
                guarantor_relation=request.data.get('guarantor_relation', '').strip(),
                guarantor_income=request.data.get('guarantor_income') or None,
                points_deducted=(loc_cost > 0),
            )

            upload_fields = {
                'cni_front': 'cni_front',
                'cni_back': 'cni_back',
                'income_proof': 'income_proof',
                'guarantor_cni': 'guarantor_cni',
                # Compatibilité avec les anciens noms envoyés par le frontend.
                'pay_slip': 'income_proof',
                'tax_notice': 'income_proof',
            }
            for request_field, model_field in upload_fields.items():
                upload = request.FILES.get(request_field)
                if upload:
                    validate_uploaded_file(
                        upload, allowed_extensions=DOCUMENT_EXTENSIONS,
                        allowed_mime_types=DOCUMENT_MIME_TYPES, label=request_field,
                    )
                    setattr(loc, model_field, upload)

            loc.save()
            if loc_cost > 0:
                request.user.deduct_points(loc_cost, f"Dossier de location : {prop.title}")
            transaction.on_commit(lambda: create_notification(
                prop.owner,
                Notification.Kind.RENTAL,
                'Nouvelle demande de location',
                f'{request.user.get_full_name() or request.user.email} a soumis un dossier pour « {prop.title} ».',
                actor=request.user,
                url=f'/locations/{loc.pk}',
                entity_type='location',
                entity_id=loc.pk,
                data={'property_id': str(prop.pk), 'move_in_date': str(loc.move_in_date)},
                priority=Notification.Priority.HIGH,
                dedupe_key=f'location:{loc.pk}:created',
            ))
            transaction.on_commit(lambda: send_location_created_email(loc))
            transaction.on_commit(lambda: send_location_created_whatsapp(loc))

        return Response({
            'ok': True,
            'message': f'Dossier de location soumis avec succès ! ({loc_cost} points déduits)' if loc_cost > 0 else 'Dossier de location soumis avec succès ! (Inclus Pass VIP)',
            'location_id': loc.pk,
            'points_remaining': request.user.points,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def archive(self, request, pk=None):
        """Bailleur archive son annonce."""
        prop = self.get_object()
        if prop.owner != request.user and request.user.role != 'ADMIN':
            return Response({'ok': False, 'error': 'Non autorisé.'}, status=403)
        prop.status = PropertyStatus.ARCHIVED
        prop.is_published = False
        prop.save(update_fields=['status', 'is_published'])
        return Response({'ok': True, 'message': 'Annonce archivée avec succès.', 'status': prop.status})


class VisitDetailAPIView(APIView):
    """API pour consulter ou agir sur une demande de visite spécifique."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        visit = get_object_or_404(VisitRequest.objects.select_related('property', 'tenant'), pk=pk)
        if request.user != visit.property.owner and request.user != visit.tenant and getattr(request.user, 'role', '') != 'ADMIN':
            return Response({'error': 'Accès refusé.'}, status=403)

        prop = visit.property
        tenant = visit.tenant

        prop_image_url = None
        if prop.main_image and hasattr(prop.main_image, 'url'):
            try:
                prop_image_url = request.build_absolute_uri(prop.main_image.url)
            except Exception:
                pass

        data = {
            'id': visit.id,
            'status': visit.status,
            'status_display': visit.get_status_display(),
            'created_at': visit.created_at.strftime('%Y-%m-%d') if visit.created_at else '',
            'requested_date': str(visit.requested_date) if visit.requested_date else '',
            'requested_time': str(visit.requested_time)[:5] if visit.requested_time else '',
            'confirmed_date': str(visit.confirmed_date) if visit.confirmed_date else '',
            'confirmed_time': str(visit.confirmed_time)[:5] if visit.confirmed_time else '',
            'message': visit.message or '',
            'bailleur_note': visit.bailleur_note or '',
            'is_bailleur': request.user == prop.owner,
            'property': {
                'id': str(prop.id),
                'title': prop.title,
                'slug': prop.slug,
                'city': prop.city or '',
                'neighborhood': prop.neighborhood or '',
                'price': float(prop.price) if prop.price else 0,
                'main_image': prop_image_url
            },
            'tenant': {
                'first_name': tenant.first_name or '',
                'last_name': tenant.last_name or '',
                'full_name': tenant.get_full_name() or f"{tenant.first_name} {tenant.last_name}".strip() or getattr(tenant, 'email', ''),
                'email': getattr(tenant, 'email', '') or '',
                'phone': getattr(tenant, 'phone', '') or ''
            }
        }
        return Response(data)

    def post(self, request, pk):
        visit = get_object_or_404(VisitRequest, pk=pk)
        action_name = request.data.get('action')

        if action_name == 'cancel':
            if visit.tenant != request.user and getattr(request.user, 'role', '') != 'ADMIN':
                return Response({'ok': False, 'error': 'Interdit.'}, status=403)
            visit.cancel()
            send_visit_cancelled_email(visit)
            return Response({'ok': True, 'message': 'Demande annulée.'})

        if visit.property.owner != request.user and getattr(request.user, 'role', '') != 'ADMIN':
            return Response({'ok': False, 'error': 'Accès refusé.'}, status=403)

        note = request.data.get('note', '')
        confirmed_date = request.data.get('confirmed_date') or None
        confirmed_time = request.data.get('confirmed_time') or None

        if action_name == 'confirm':
            visit.confirm(confirmed_date, confirmed_time, note)
            create_notification(
                visit.tenant,
                Notification.Kind.VISIT,
                'Visite confirmée',
                f'Votre visite pour « {visit.property.title} » a été confirmée.',
                actor=request.user,
                url=f'/visites/{visit.pk}',
                entity_type='visit',
                entity_id=visit.pk,
                data={'property_id': str(visit.property_id), 'confirmed_date': str(visit.confirmed_date), 'confirmed_time': str(visit.confirmed_time or '')},
                priority=Notification.Priority.HIGH,
                dedupe_key=f'visit:{visit.pk}:confirmed',
            )
            send_visit_status_email(visit, confirmed=True)
            send_visit_status_whatsapp(visit, confirmed=True)
            return Response({'ok': True, 'message': 'Visite confirmée ! Le locataire a été notifié par email et WhatsApp.'})
        elif action_name == 'refuse':
            visit.refuse(note)
            create_notification(
                visit.tenant,
                Notification.Kind.VISIT,
                'Demande de visite refusée',
                f'La demande de visite pour « {visit.property.title} » a été refusée.',
                actor=request.user,
                url=f'/visites/{visit.pk}',
                entity_type='visit',
                entity_id=visit.pk,
                priority=Notification.Priority.NORMAL,
                dedupe_key=f'visit:{visit.pk}:refused',
            )
            send_visit_status_email(visit, confirmed=False)
            send_visit_status_whatsapp(visit, confirmed=False)
            return Response({'ok': True, 'message': 'Demande refusée.'})

        return Response({'ok': False, 'error': 'Action inconnue.'}, status=400)


class LocationDetailAPIView(APIView):
    """API pour consulter ou agir sur un dossier de location spécifique."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        loc = get_object_or_404(LocationRequest.objects.select_related('property', 'tenant'), pk=pk)
        if request.user != loc.property.owner and request.user != loc.tenant and getattr(request.user, 'role', '') != 'ADMIN':
            return Response({'error': 'Accès refusé.'}, status=403)

        prop = loc.property
        tenant = loc.tenant

        def get_url(file_field):
            if file_field and hasattr(file_field, 'url') and getattr(file_field, 'name', None):
                try:
                    return request.build_absolute_uri(file_field.url)
                except Exception:
                    pass
            return None

        data = {
            'id': loc.id,
            'status': loc.status,
            'status_display': loc.get_status_display(),
            'dossier_completion': loc.get_dossier_completion(),
            'move_in_date': str(loc.move_in_date) if loc.move_in_date else '',
            'lease_duration': loc.lease_duration,
            'tenant_count': loc.tenant_count,
            'profession': loc.profession or '',
            'employer': loc.employer or '',
            'monthly_income': float(loc.monthly_income) if loc.monthly_income else None,
            'message': loc.message or '',
            'has_guarantor': loc.has_guarantor,
            'guarantor_name': loc.guarantor_name or '',
            'guarantor_phone': loc.guarantor_phone or '',
            'guarantor_relation': loc.guarantor_relation or '',
            'guarantor_income': float(loc.guarantor_income) if loc.guarantor_income else None,
            'cni_front': request.build_absolute_uri(f'/api/v1/properties/locations/{loc.pk}/documents/cni_front/') if loc.cni_front else None,
            'cni_back': request.build_absolute_uri(f'/api/v1/properties/locations/{loc.pk}/documents/cni_back/') if loc.cni_back else None,
            'income_proof': request.build_absolute_uri(f'/api/v1/properties/locations/{loc.pk}/documents/income_proof/') if loc.income_proof else None,
            'guarantor_cni': request.build_absolute_uri(f'/api/v1/properties/locations/{loc.pk}/documents/guarantor_cni/') if loc.guarantor_cni else None,
            'bailleur_note': loc.bailleur_note or '',
            'is_bailleur': request.user == prop.owner,
            'property': {
                'id': str(prop.id),
                'title': prop.title,
                'slug': prop.slug,
                'city': prop.city or '',
                'neighborhood': prop.neighborhood or '',
                'price': float(prop.price) if prop.price else 0,
                'main_image': get_url(prop.main_image)
            },
            'tenant': {
                'first_name': tenant.first_name or '',
                'last_name': tenant.last_name or '',
                'full_name': tenant.get_full_name() or f"{tenant.first_name} {tenant.last_name}".strip() or getattr(tenant, 'email', ''),
                'email': getattr(tenant, 'email', '') or '',
                'phone': getattr(tenant, 'phone', '') or ''
            }
        }
        return Response(data)


class LocationDocumentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, field):
        loc = get_object_or_404(LocationRequest.objects.select_related('property'), pk=pk)
        if request.user != loc.property.owner and request.user != loc.tenant and not request.user.is_staff:
            return Response({'detail': 'Accès refusé.'}, status=403)
        if field not in {'cni_front', 'cni_back', 'income_proof', 'guarantor_cni'}:
            return Response({'detail': 'Document invalide.'}, status=404)
        file_field = getattr(loc, field, None)
        if not file_field:
            return Response({'detail': 'Document introuvable.'}, status=404)
        response = FileResponse(file_field.open('rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{field}"'
        response['X-Content-Type-Options'] = 'nosniff'
        return response

    def post(self, request, pk):
        loc = get_object_or_404(LocationRequest, pk=pk)
        action_name = request.data.get('action')

        if action_name == 'cancel':
            if loc.tenant != request.user and getattr(request.user, 'role', '') != 'ADMIN':
                return Response({'ok': False, 'error': 'Interdit.'}, status=403)
            loc.cancel()
            send_location_cancelled_email(loc)
            return Response({'ok': True, 'message': 'Dossier annulé.'})

        if loc.property.owner != request.user and getattr(request.user, 'role', '') != 'ADMIN':
            return Response({'ok': False, 'error': 'Accès refusé.'}, status=403)

        note = request.data.get('note', '')

        if action_name == 'accept':
            with transaction.atomic():
                loc = LocationRequest.objects.select_for_update().select_related('property', 'tenant').get(pk=loc.pk)
                prop = Property.objects.select_for_update().get(pk=loc.property_id)
                if loc.status not in (LocationRequest.Status.PENDING, LocationRequest.Status.REVIEWING):
                    return Response({'ok': False, 'error': 'Ce dossier n’est plus en attente de décision.'}, status=400)
                if prop.status == PropertyStatus.RENTED:
                    return Response({'ok': False, 'error': 'Ce logement est déjà loué.'}, status=400)
                loc.accept(note)
                prop.status = PropertyStatus.RENTED
                prop.is_published = False
                prop.save(update_fields=['status', 'is_published', 'updated_at'])
                LocationRequest.objects.filter(
                    property_id=prop.pk,
                    status__in=[LocationRequest.Status.PENDING, LocationRequest.Status.REVIEWING],
                ).exclude(pk=loc.pk).update(
                    status=LocationRequest.Status.REFUSED,
                    bailleur_note='Logement attribué à un autre dossier.',
                    updated_at=timezone.now(),
                )
                VisitRequest.objects.filter(
                    property_id=prop.pk,
                    status__in=[VisitRequest.Status.PENDING, VisitRequest.Status.CONFIRMED],
                ).update(status=VisitRequest.Status.CANCELLED, updated_at=timezone.now())
            create_notification(
                loc.tenant,
                Notification.Kind.RENTAL,
                'Dossier de location accepté',
                f'Votre dossier pour « {loc.property.title} » a été accepté.',
                actor=request.user,
                url=f'/locations/{loc.pk}',
                entity_type='location',
                entity_id=loc.pk,
                priority=Notification.Priority.HIGH,
                dedupe_key=f'location:{loc.pk}:accepted',
            )
            send_location_status_email(loc, 'accepted')
            send_location_status_whatsapp(loc, accepted=True)
            return Response({'ok': True, 'message': 'Dossier accepté ! Le locataire a été notifié par email et WhatsApp.'})
        elif action_name == 'refuse':
            loc.refuse(note)
            create_notification(
                loc.tenant,
                Notification.Kind.RENTAL,
                'Dossier de location refusé',
                f'Votre dossier pour « {loc.property.title} » a été refusé.',
                actor=request.user,
                url=f'/locations/{loc.pk}',
                entity_type='location',
                entity_id=loc.pk,
                priority=Notification.Priority.NORMAL,
                dedupe_key=f'location:{loc.pk}:refused',
            )
            send_location_status_email(loc, 'refused')
            send_location_status_whatsapp(loc, accepted=False)
            return Response({'ok': True, 'message': 'Dossier refusé.'})
        elif action_name == 'review':
            loc.status = LocationRequest.Status.REVIEWING
            loc.save(update_fields=['status', 'updated_at'])
            create_notification(
                loc.tenant,
                Notification.Kind.RENTAL,
                'Dossier en cours d’examen',
                f'Votre dossier pour « {loc.property.title} » est en cours d’examen.',
                actor=request.user,
                url=f'/locations/{loc.pk}',
                entity_type='location',
                entity_id=loc.pk,
                dedupe_key=f'location:{loc.pk}:reviewing',
            )
            send_location_status_email(loc, 'reviewing')
            return Response({'ok': True, 'message': 'Dossier en cours d\'examen.'})

        return Response({'ok': False, 'error': 'Action inconnue.'}, status=400)


# Le POST historique des dossiers de location doit rester disponible sur
# /locations/<id>/ (la route utilisée par le frontend). Le contrôleur de
# documents conserve uniquement son GET, mais on réutilise ici la méthode
# existante afin de ne pas casser les actions accepter/refuser/revoir.
LocationDetailAPIView.post = LocationDocumentAPIView.post


class BookingDetailAPIView(APIView):
    """Détail et mise à jour d'une réservation de court séjour."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        booking = get_object_or_404(ShortStayBooking.objects.select_related('property', 'guest'), pk=pk)
        is_owner = booking.property.owner == request.user
        is_guest = booking.guest == request.user
        if not (is_owner or is_guest or request.user.is_staff):
            return Response({'error': 'Accès refusé.'}, status=403)

        return Response({
            'id': booking.pk,
            'property': _request_property_payload(request, booking.property),
            'guest': _request_user_payload(booking.guest) if booking.guest else {
                'full_name': booking.guest_name or 'Voyageur',
                'phone': booking.guest_phone or '',
                'email': '',
            },
            'check_in_date': str(booking.check_in_date),
            'check_out_date': str(booking.check_out_date),
            'guests_count': booking.guests_count,
            'nights_count': booking.nights_count,
            'total_price': str(booking.total_price),
            'status': booking.status,
            'status_display': booking.get_status_display(),
            'is_blocked_by_host': booking.is_blocked_by_host,
            'block_reason': booking.block_reason or '',
            'guest_note': booking.guest_note or '',
            'host_note': booking.host_note or '',
            'created_at': booking.created_at.isoformat(),
        })

    def patch(self, request, pk):
        booking = get_object_or_404(ShortStayBooking.objects.select_related('property', 'guest'), pk=pk)
        is_owner = booking.property.owner == request.user
        is_guest = booking.guest == request.user
        if not (is_owner or is_guest or request.user.is_staff):
            return Response({'error': 'Accès non autorisé.'}, status=403)

        action_name = request.data.get('action')
        host_note = request.data.get('host_note', '').strip()
        if host_note:
            booking.host_note = host_note

        if action_name == 'accept':
            if not is_owner:
                return Response({'error': 'Seul le bailleur peut accepter.'}, status=403)
            booking.status = ShortStayBooking.Status.CONFIRMED
        elif action_name == 'refuse':
            if not is_owner:
                return Response({'error': 'Seul le bailleur peut refuser.'}, status=403)
            booking.status = ShortStayBooking.Status.REFUSED
        elif action_name == 'cancel':
            booking.status = ShortStayBooking.Status.CANCELLED
        elif action_name == 'complete':
            if not is_owner:
                return Response({'error': 'Seul le bailleur peut clore un séjour.'}, status=403)
            booking.status = ShortStayBooking.Status.COMPLETED
        else:
            return Response({'error': 'Action invalide.'}, status=400)

        booking.save()
        return Response({'ok': True, 'status': booking.status, 'status_display': booking.get_status_display()})

    def delete(self, request, pk):
        booking = get_object_or_404(ShortStayBooking, pk=pk)
        if booking.property.owner != request.user and not request.user.is_staff:
            return Response({'error': 'Accès non autorisé.'}, status=403)
        booking.delete()
        return Response({'ok': True, 'message': 'Supprimé avec succès.'})


class RentEstimateAPIView(APIView):
    """
    Endpoint d'estimation de loyer IA Piolo pour les bailleurs.
    Accepte les caractéristiques d'un bien et renvoie une prédiction avec fourchette,
    score de confiance, décomposition des facteurs et biens comparables.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RentEstimateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Données invalides', 'details': serializer.errors}, status=400)

        data = serializer.validated_data
        estimator = get_rent_estimator()
        prediction = estimator.predict(data)

        # Recherche de biens comparables réels sur Piolo
        city = data.get('city', 'Yaoundé')
        prop_type = data.get('property_type', 'APPARTEMENT')
        neighborhood = data.get('neighborhood', '')

        comparables_qs = Property.objects.filter(
            status=PropertyStatus.PUBLISHED,
            city__iexact=city
        )
        if neighborhood:
            comp_neigh = comparables_qs.filter(neighborhood__icontains=neighborhood)
            if comp_neigh.exists():
                comparables_qs = comp_neigh
        
        if prop_type:
            comp_type = comparables_qs.filter(property_type=prop_type)
            if comp_type.exists():
                comparables_qs = comp_type

        comparables = []
        for p in comparables_qs[:3]:
            img_url = None
            if p.main_image:
                try:
                    img_url = request.build_absolute_uri(p.main_image.url)
                except Exception:
                    pass
            comparables.append({
                'id': str(p.id),
                'title': p.title,
                'slug': p.slug,
                'price': int(p.price),
                'surface': p.area,
                'bedrooms': p.bedrooms,
                'neighborhood': p.neighborhood,
                'city': p.city,
                'image_url': img_url
            })

        prediction['comparables'] = comparables
        return Response(prediction)


# ══════════════════════════════════════════════════════════════════════════════
# ── BOOST D'ANNONCES — Endpoints API Réels ───────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

class PropertyBoostAPIView(APIView):
    """
    POST /api/properties/api/boost/<property_id>/
    Applique un boost sur une annonce (bailleur propriétaire uniquement).
    Déduit les points correspondants du bailleur.
    Body: { "boost_type": "flash_48h" | "vedette_7j" | "multiboost_30j" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, property_id):
        prop = get_object_or_404(Property, pk=property_id)

        # Vérification propriété
        if prop.owner != request.user:
            return Response({'error': 'Vous n\'êtes pas propriétaire de ce bien.'}, status=403)

        boost_type = request.data.get('boost_type', 'vedette_7j')
        if boost_type not in BOOST_DURATIONS:
            return Response({
                'error': 'Type de boost invalide.',
                'valid_types': list(BOOST_DURATIONS.keys())
            }, status=400)

        points_required = BOOST_POINT_COSTS.get(boost_type, 30)
        user_points = getattr(request.user, 'points', 0) or 0

        # ── Paiement simulé MoMo ──────────────────────────────────────────────
        # Lorsque payment_confirmed=true est passé (validation depuis la modal),
        # on crédite automatiquement les points nécessaires pour simuler le
        # débit MoMo. À remplacer par la callback du prestataire de paiement.
        payment_confirmed = str(request.data.get('payment_confirmed', '')).lower() in ('true', '1', 'yes')
        if payment_confirmed and user_points < points_required:
            request.user.points = user_points + points_required
            request.user.save(update_fields=['points'])
            user_points = request.user.points

        if user_points < points_required:
            return Response({
                'error': f'Points insuffisants. Il vous faut {points_required} pts (solde actuel : {user_points} pts).',
                'ok': False,
                'required': points_required,
                'current': user_points,
                'missing': points_required - user_points
            }, status=402)

        with transaction.atomic():
            # Désactiver les boosts actifs précédents sur ce bien
            PropertyBoost.objects.filter(
                property=prop, is_active=True
            ).update(is_active=False)

            # Calculer la date d'expiration
            days = BOOST_DURATIONS[boost_type]
            expires_at = timezone.now() + timezone.timedelta(days=days)

            # Créer le nouveau boost
            boost = PropertyBoost.objects.create(
                property=prop,
                owner=request.user,
                boost_type=boost_type,
                points_spent=points_required,
                expires_at=expires_at,
                is_active=True
            )

            # Déduire les points du bailleur
            request.user.points = user_points - points_required
            request.user.save(update_fields=['points'])

            # Synchroniser les champs boost sur la Property
            _sync_property_boost(prop)

        return Response({
            'ok': True,
            'boost_id': boost.id,
            'boost_type': boost.boost_type,
            'activated_at': boost.activated_at.isoformat(),
            'expires_at': boost.expires_at.isoformat(),
            'days': days,
            'points_spent': points_required,
            'new_balance': request.user.points,
            'message': f'Boost "{boost_type}" activé avec succès pour {days} jour(s).'
        }, status=201)


class PropertyBoostStatusAPIView(APIView):
    """
    GET /api/properties/api/boost/<property_id>/status/
    Retourne le statut de boost d'un bien (accessible par tous les utilisateurs authentifiés).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, property_id):
        prop = get_object_or_404(Property, pk=property_id, is_published=True)
        now = timezone.now()

        active_boost = PropertyBoost.objects.filter(
            property=prop, is_active=True, expires_at__gt=now
        ).order_by('-expires_at').first()

        if active_boost:
            return Response({
                'is_boosted': True,
                'boost_type': active_boost.boost_type,
                'activated_at': active_boost.activated_at.isoformat(),
                'expires_at': active_boost.expires_at.isoformat(),
                'days_remaining': (active_boost.expires_at - now).days,
                'boosted_views': active_boost.boosted_views,
            })
        return Response({'is_boosted': False})


class PropertyBoostListAPIView(APIView):
    """
    GET /api/properties/api/my-boosts/
    Liste tous les boosts du bailleur connecté (actifs et expirés).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        boosts = PropertyBoost.objects.filter(
            owner=request.user
        ).select_related('property').order_by('-activated_at')

        results = []
        for b in boosts:
            prop = b.property
            img_url = None
            if prop.main_image:
                try:
                    img_url = request.build_absolute_uri(prop.main_image.url)
                except Exception:
                    pass
            results.append({
                'id': b.id,
                'boost_type': b.boost_type,
                'is_active': b.is_active,
                'is_valid': b.is_boost_valid(),
                'activated_at': b.activated_at.isoformat(),
                'expires_at': b.expires_at.isoformat(),
                'days_remaining': max(0, (b.expires_at - now).days) if b.is_boost_valid() else 0,
                'points_spent': b.points_spent,
                'boosted_views': b.boosted_views,
                'property': {
                    'id': str(prop.id),
                    'title': prop.title,
                    'slug': prop.slug,
                    'city': prop.city,
                    'main_image': img_url,
                    'is_boosted': prop.is_boosted,
                    'boost_type': prop.boost_type,
                    'boost_expires_at': prop.boost_expires_at.isoformat() if prop.boost_expires_at else None,
                }
            })
        return Response({'results': results, 'count': len(results)})


# ── Conciergerie & Gestion Déléguée API Views ─────────────────────────────────

def _format_mandate_dict(m):
    """Formate un mandat pour l'affichage React & Dashboard."""
    return {
        'id': m.id,
        'propertyTitle': m.property_title,
        'property_title': m.property_title,
        'city': m.city,
        'neighborhood': m.neighborhood,
        'packageType': m.package_type,
        'package_type': m.package_type,
        'packageName': m.package_name,
        'package_name': m.package_name,
        'price': m.price,
        'status': m.status,
        'statusLabel': m.status_label,
        'status_label': m.status_label,
        'progressPercent': m.progress_percent,
        'progress_percent': m.progress_percent,
        'leadAgent': m.lead_agent,
        'lead_agent': m.lead_agent,
        'assignedAgent': m.lead_agent,
        'assignedAgentPhone': m.assigned_agent_phone,
        'assigned_agent_phone': m.assigned_agent_phone,
        'contactName': m.contact_name,
        'contact_name': m.contact_name,
        'contactPhone': m.contact_phone,
        'contact_phone': m.contact_phone,
        'paymentPhone': m.payment_phone,
        'payment_phone': m.payment_phone,
        'paymentOperator': m.payment_operator,
        'payment_operator': m.payment_operator,
        'preferredDate': m.preferred_date,
        'preferred_date': m.preferred_date,
        'timeSlot': m.time_slot,
        'time_slot': m.time_slot,
        'notes': m.notes,
        'visitsConducted': m.visits_conducted,
        'visits_conducted': m.visits_conducted,
        'qualifiedCandidates': m.qualified_candidates,
        'qualified_candidates': m.qualified_candidates,
        'createdDate': m.created_at.strftime('%d/%m/%Y'),
        'created_at': m.created_at.isoformat(),
        'updated_at': m.updated_at.isoformat(),
    }


class ConciergeMandateListCreateAPIView(APIView):
    """
    GET /api/properties/api/concierge-mandates/
    Liste les mandats de conciergerie du bailleur connecté.
    
    POST /api/properties/api/concierge-mandates/
    Crée un nouveau mandat et le persiste en base de données.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.properties.models import ConciergeMandate
        qs = ConciergeMandate.objects.filter(landlord=request.user).order_by('-created_at')
        mandates = [_format_mandate_dict(m) for m in qs]
        return Response({'results': mandates, 'count': len(mandates)})

    def post(self, request):
        from apps.properties.models import ConciergeMandate, Property
        data = request.data
        
        prop_id = data.get('propertyId') or data.get('property_id')
        prop_obj = None
        if prop_id and prop_id != 'custom':
            try:
                prop_obj = Property.objects.filter(pk=prop_id, owner=request.user).first()
            except Exception:
                pass

        prop_title = data.get('propertyTitle') or data.get('property_title') or (prop_obj.title if prop_obj else 'Logement Clé en Main')
        pkg_type = data.get('packageType') or data.get('package_type') or data.get('packageId') or 'full_management'
        pkg_name = data.get('packageName') or data.get('package_name') or ('Gestion Déléguée Intégrale Piolo Signature' if pkg_type == 'full_management' else 'Captation 360° & Production Média')
        price = int(data.get('price') or (19000 if pkg_type == 'full_management' else 9500))

        mandate = ConciergeMandate.objects.create(
            landlord=request.user,
            property=prop_obj,
            property_title=prop_title,
            city=data.get('city') or (prop_obj.city if prop_obj else 'Douala'),
            neighborhood=data.get('neighborhood') or (prop_obj.neighborhood if prop_obj else 'Bonapriso'),
            package_type=pkg_type,
            package_name=pkg_name,
            price=price,
            status='SHOOTING_PLANNED',
            status_label='Équipe technique planifiée',
            progress_percent=25,
            lead_agent='Équipe Logistique Piolo',
            assigned_agent_phone='+237 658 32 42 85',
            contact_name=data.get('contactName') or data.get('contact_name') or f"{request.user.first_name} {request.user.last_name}".strip(),
            contact_phone=data.get('contactPhone') or data.get('contact_phone') or request.user.phone_number or '',
            payment_phone=data.get('paymentPhone') or data.get('payment_phone') or '',
            payment_operator=data.get('paymentOperator') or data.get('payment_operator') or data.get('operator') or 'OM',
            preferred_date=data.get('preferredDate') or data.get('preferred_date') or '',
            time_slot=data.get('timeSlot') or data.get('time_slot') or 'morning',
            notes=data.get('notes') or '',
        )

        return Response(_format_mandate_dict(mandate), status=201)


class ConciergeMandateDetailAPIView(APIView):
    """
    GET /api/properties/api/concierge-mandates/<id>/
    Détail d'un mandat spécifique.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from apps.properties.models import ConciergeMandate
        mandate = get_object_or_404(ConciergeMandate, pk=pk, landlord=request.user)
        return Response(_format_mandate_dict(mandate))



