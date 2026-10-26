# apps/properties/views.py
"""
Vues pour l'application Properties (Immobilier)
Combine vues Django (Templates HTML) et API REST (DRF pour React)
"""

from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.properties.models import Property
from .serializers import PropertySerializer
# apps/properties/views.py

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.utils.text import slugify
from django.db import transaction
from django.conf import settings

from .models import Property, PropertyStatus
from .forms import PropertyCreateForm  # À créer
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Property, PropertyImage
from django.db import models as db_models
from apps.core.file_validation import (
    validate_uploaded_file, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES,
    VIDEO_EXTENSIONS, VIDEO_MIME_TYPES,
)

# ==========================================
# 🌐 VUES DJANGO (Templates HTML)
# ==========================================

class PropertyListView(ListView):
    """Page principale listant tous les biens immobiliers publiés"""
    model = Property
    template_name = 'properties/list.html'
    context_object_name = 'properties'
    paginate_by = 12

    def get_queryset(self):
        return Property.objects.filter(is_published=True).select_related('owner').prefetch_related('images').order_by('-owner__verification_level', '-created_at')


class PropertySearchView(ListView):
    """Page de recherche avec filtres dynamiques"""
    model = Property
    template_name = 'properties/search.html'
    context_object_name = 'properties'

    def get_queryset(self):
        queryset = Property.objects.filter(is_published=True)
        
        # Filtres basiques (récupérés depuis les paramètres GET de l'URL)
        city = self.request.GET.get('city')
        min_price = self.request.GET.get('min_price')
        max_price = self.request.GET.get('max_price')
        prop_type = self.request.GET.get('property_type')

        if city:
            queryset = queryset.filter(city__icontains=city)
        if prop_type:
            queryset = queryset.filter(property_type=prop_type)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset.order_by('-owner__verification_level', '-created_at')


@require_GET
def interactive_map_view(request):
    """Page de la carte interactive (Split-Screen Google Maps)"""
    from django.conf import settings
    # On récupère les filtres optionnels pour la Sidebar de gauche
    context = {
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY,
    }
    return render(request, 'properties/interactive_map.html', context)


class PropertyCreateView(LoginRequiredMixin, CreateView):
    """Formulaire pour publier une nouvelle annonce (réservé aux connectés)"""
    model = Property
    template_name = 'properties/create.html'
    # Champs affichés dans le formulaire
    fields = [
        'title', 'description', 'property_type', 'transaction_type',
        'price', 'area', 'city', 'neighborhood', 'address',
        'bedrooms', 'bathrooms', 'main_image'
    ]
    login_url = '/accounts/login/'

    def form_valid(self, form):
        # Assigne automatiquement l'utilisateur connecté comme propriétaire
        form.instance.owner = self.request.user
        return super().form_valid(form)


class PropertyDetailView(DetailView):
    """Page détaillée d'un bien immobilier"""
    model = Property
    template_name = 'properties/detail.html'
    context_object_name = 'property'


# ==========================================
# 🚀 VUES API (Django REST Framework - Pour React/Mobile)
# ==========================================

class PropertyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API Endpoint pour React ou applications mobiles
    Routes automatiques : 
      GET /properties/api/properties/ 
      GET /properties/api/properties/<id>/
    """
    queryset = Property.objects.filter(is_published=True)
    serializer_class = PropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Champs filtrables via l'API (?city=Douala&property_type=villa)
    filterset_fields = ['property_type', 'transaction_type', 'city', 'neighborhood']
    
    # Recherche plein texte (?search=bonapriso)
    search_fields = ['title', 'description', 'city', 'neighborhood']
    
    # Tri possible (?ordering=-price)
    ordering_fields = ['price', 'created_at', 'area']
    ordering = ['-created_at']



# apps/properties/views.py — ligne ~151

@login_required(login_url='accounts:auth')
def property_create_view(request):
    """Page de création d'annonce."""
 
    if not request.user.is_bailleur or not request.user.is_bailleur_active:
        from django.contrib import messages
        messages.error(request, "Seuls les bailleurs vérifiés peuvent publier.")
        return redirect('accounts:bailleur_dashboard')
 
    if request.user.points < 20:
        from django.contrib import messages
        messages.error(request, 'Solde insuffisant. 20 points requis.')
        return redirect('accounts:bailleur_dashboard')
 
    if request.method == 'POST':
        form = PropertyCreateForm(request.POST, request.FILES)
 
        if form.is_valid():
            property = form.save(commit=False)
            property.owner = request.user
            property.status = 'PUBLISHED'
            property.is_published = True
            property.published_at = timezone.now()
            property.save()

            request.user.deduct_points(20, f"Publication : {property.title}")

            try:
                from apps.notifications.email_service import notify_matching_search_alerts
                notify_matching_search_alerts(property)
            except Exception:
                pass

            return redirect('accounts:bailleur_dashboard')

        else:
            from django.contrib import messages
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = PropertyCreateForm()
 
    return render(request, 'properties/create.html', {
        'form': form,
        'active_section': 'publier',
        # 🔑 Clé Google Maps injectée depuis settings.py — JAMAIS en dur dans le template
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY,
    })

# apps/properties/views.py — API endpoint corrigé

@require_POST
@login_required(login_url='accounts:auth')
def property_create_api(request):
    """
    Endpoint API pour création d'annonce avec déduction de points.
    Reçoit les données via FormData et sauvegarde en base.
    """
    from django.db import transaction
    from django.utils import timezone
    import logging
    
    logger = logging.getLogger('apps.properties')
    
    # Vérifications préalables
    if not request.user.is_bailleur or not request.user.is_bailleur_active:
        return JsonResponse({'ok': False, 'error': 'Accès refusé'}, status=403)
    
    if request.user.points < 20:
        return JsonResponse({
            'ok': False, 
            'error': 'Solde insuffisant. Il vous faut au moins 20 points pour publier une annonce.'
        }, status=400)
    
    try:
        # ── Récupération et validation des données ──────────────────────
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        transaction_type = request.POST.get('transaction_type', 'LOCATION')
        property_type = request.POST.get('property_type', '')
        
        # Validation prix
        # Dans property_create_api, remplacez la validation du prix par ceci :

        # Validation prix
        print("=" * 50)
        print("POST COMPLET =", request.POST)
        print("PRICE RAW =", repr(request.POST.get('price')))
        print("=" * 50)
        import re
        try:
            price_raw = request.POST.get('price', '0')

            price_clean = re.sub(r'\D', '', str(price_raw))

            price = int(price_clean)

            if price < 10000:
                raise ValueError("Prix trop bas")

        except (TypeError, ValueError):
            return JsonResponse({
                'ok': False,
                'errors': {
                    'price': 'Prix invalide. Utilisez uniquement des chiffres.'
                }
            }, status=400)
        # Localisation
        address = request.POST.get('address', '').strip()
        city = request.POST.get('city', '').strip()
        neighborhood = request.POST.get('neighborhood', '').strip()
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        
        # Caractéristiques
        try:
            area = int(request.POST.get('area', 0))
            bedrooms = int(request.POST.get('bedrooms', 0))
            bathrooms = int(request.POST.get('bathrooms', 1))
        except (TypeError, ValueError):
            return JsonResponse({'ok': False, 'errors': {'area': 'Valeur numérique requise'}}, status=400)
        
        # Équipements (checkboxes → boolean)
        def get_bool(field): return request.POST.get(field) == 'on'
        
        # ── Validation des champs obligatoires ─────────────────────────
        errors = {}
        if not title: errors['title'] = 'Titre requis'
        if not description or len(description) < 50: errors['description'] = 'Description trop courte (min 50 caractères)'
        if not property_type: errors['property_type'] = 'Type de bien requis'
        if not address: errors['address'] = 'Adresse requise'
        if not city: errors['city'] = 'Ville requise'
        if not latitude or not longitude: errors['location'] = 'Localisation précise requise'
        if area < 10: errors['area'] = 'Surface minimale : 10 m²'
        
        if errors:
            return JsonResponse({'ok': False, 'errors': errors}, status=400)
        
        # ── Transaction atomique pour sauvegarde ───────────────────────
        with transaction.atomic():
            # Créer la propriété
            property = Property(
                owner=request.user,
                title=title,
                description=description,
                transaction_type=transaction_type,
                property_type=property_type,
                price=price,
                price_negotiable=get_bool('price_negotiable'),
                address=address,
                city=city,
                neighborhood=neighborhood,
                latitude=latitude if latitude else None,
                longitude=longitude if longitude else None,
                area=area,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                furnished=get_bool('furnished'),
                balcony=get_bool('balcony'),
                parking=get_bool('parking'),
                security=get_bool('security'),
                water=get_bool('water'),
                electricity=get_bool('electricity'),
                status='PUBLISHED',
                is_published=True,
                published_at=timezone.now(),
            )
            
            # Gérer l'image principale
            if 'main_image' in request.FILES:
                validate_uploaded_file(
                    request.FILES['main_image'], allowed_extensions=IMAGE_EXTENSIONS,
                    allowed_mime_types=IMAGE_MIME_TYPES, label='main_image',
                )
                property.main_image = request.FILES['main_image']
            else:
                return JsonResponse({'ok': False, 'errors': {'main_image': 'Image principale requise'}}, status=400)
            
            property.save()

            # ═══════════════════════════════════════════════════════════
            # ✅ TRAITER LES IMAGES SECONDAIRES
            # ═══════════════════════════════════════════════════════════
            secondary_images = request.FILES.getlist('secondary_images')
            for order, img in enumerate(secondary_images):
                validate_uploaded_file(
                    img, allowed_extensions=IMAGE_EXTENSIONS,
                    allowed_mime_types=IMAGE_MIME_TYPES, label='secondary_images',
                )
                PropertyImage.objects.create(
                    property=property,  # ← la variable s'appelle `property`
                    image=img,
                    order=order,
                )
            
            # Déduire 20 points et enregistrer la transaction
            request.user.deduct_points(20, f"Publication annonce: {property.title}")
        
        logger.info(f"✅ Annonce créée: {property.title} par {request.user.email}")
        
        return JsonResponse({
            'ok': True,
            'redirect': '/accounts/bailleur/dashboard/#annonces',
            'property_id': str(property.pk),
            'message': 'Annonce publiée avec succès ! 20 points déduits.',
            'points_remaining': request.user.points
        })
    
        
    except Exception as e:
        logger.error(f"❌ Erreur création propriété: {e}", exc_info=True)
        return JsonResponse({
            'ok': False,
            'error': f'Erreur serveur: {str(e)}'
        }, status=500)
    
    

def property_detail_view(request, slug):
    """
    Page de détail d'une annonce — style fr.immobilier.com.
    """
    property = get_object_or_404(
        Property.objects.select_related('owner').prefetch_related(
            'images', 
            'virtual_tours', 
            'virtual_tours__scenes'
        ),
        slug=slug
    )

    if property.status != PropertyStatus.PUBLISHED and request.user != property.owner:
        from django.http import Http404
        raise Http404("Cette annonce n'est plus disponible.")

    # Increment view count if published
    if property.status == PropertyStatus.PUBLISHED:
        property.views_count += 1
        property.save(update_fields=['views_count'])
 
    # Similar properties (same city & type)
    similar = Property.objects.select_related('owner').prefetch_related('images').filter(
        city=property.city,
        property_type=property.property_type,
        status=PropertyStatus.PUBLISHED,
        is_published=True
    ).exclude(pk=property.pk)[:4]
 
    context = {
        'property': property,
        'similar_properties': similar,
        'owner_verification_level': property.owner.verification_level,
        # 🔑 Sans cette ligne, la carte Google Maps ne s'initialise jamais
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY,
    }
 
    return render(request, 'properties/detail.html', context)


@login_required(login_url='accounts:auth')
def property_update_view(request, slug):
    """Page de modification d'annonce pour le bailleur."""
    property = get_object_or_404(Property, slug=slug, owner=request.user)

    if request.method == 'POST':
        form = PropertyCreateForm(request.POST, request.FILES, instance=property)
        if form.is_valid():
            form.save()
            from django.contrib import messages
            messages.success(request, "Annonce mise à jour avec succès.")
            return redirect('properties:detail', slug=property.slug)
    else:
        form = PropertyCreateForm(instance=property)

    return render(request, 'properties/update.html', {
        'form': form,
        'property': property,
        'active_section': 'mes-annonces',
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY,
    })

@require_POST
@login_required(login_url='accounts:auth')
def property_archive_view(request, slug):
    """Bascule le statut d'une annonce en ARCHIVED ou PUBLISHED."""
    property = get_object_or_404(Property, slug=slug, owner=request.user)
    
    if property.status == 'ARCHIVED':
        property.status = 'PUBLISHED'
        property.is_published = True
        property.save(update_fields=['status', 'is_published'])
        from django.contrib import messages
        messages.success(request, "L'annonce a été republiée avec succès.")
    else:
        property.status = 'ARCHIVED'
        property.is_published = False
        property.save(update_fields=['status', 'is_published'])
        from django.contrib import messages
        messages.success(request, "L'annonce a été archivée avec succès. Elle n'est plus visible par les locataires.")
        
    return redirect('properties:detail', slug=property.slug)


# views.py — remplace property_list_view
def property_list_view(request):
    from apps.properties.models import Property, Favorite
    from django.utils import timezone

    properties = Property.objects.filter(
        status=PropertyStatus.PUBLISHED,
        is_published=True
    ).select_related('owner').prefetch_related('images')

    city          = request.GET.get('city', '').strip()
    property_type = request.GET.get('type', '').strip()
    min_price     = request.GET.get('min_price', '').strip()
    max_price     = request.GET.get('max_price', '').strip()
    transaction   = request.GET.get('transaction', '').strip()

    if city:          properties = properties.filter(city__icontains=city)
    if property_type: properties = properties.filter(property_type=property_type)
    if min_price:     properties = properties.filter(price__gte=min_price)
    if max_price:     properties = properties.filter(price__lte=max_price)
    if transaction:   properties = properties.filter(transaction_type=transaction)

    # Favoris de l'utilisateur connecté
    favoris_ids = []
    if request.user.is_authenticated:
        from .models import Favorite
        favoris_ids = list(
            Favorite.objects.filter(user=request.user).values_list('property_id', flat=True)
        )

    context = {
        'properties':   properties.order_by('-owner__verification_level', '-published_at'),
        'favoris_ids':  favoris_ids,
        'filters': {
            'city': city, 'type': property_type,
            'min_price': min_price, 'max_price': max_price,
            'transaction': transaction,
        }
    }
    return render(request, 'properties/list.html', context)


# ══════════════════════════════════════════════════════════════
# DEMANDES DE VISITE
# ══════════════════════════════════════════════════════════════

@require_POST
@login_required(login_url='accounts:auth')
def visit_request_create(request, property_id):
    """Locataire crée une demande de visite — déduit 20 pts."""
    from .models import VisitRequest
    from django.utils import timezone

    prop = get_object_or_404(Property, pk=property_id, is_published=True)

    # Pas de visite sur son propre bien
    if prop.owner == request.user:
        return JsonResponse({'ok': False, 'error': 'Vous ne pouvez pas visiter votre propre bien.'}, status=400)

    # Vérifier doublon
    existing = VisitRequest.objects.filter(
        property=prop, tenant=request.user,
        status__in=['PENDING', 'CONFIRMED']
    ).first()
    if existing:
        return JsonResponse({'ok': False, 'error': 'Vous avez déjà une demande en cours pour ce bien.'}, status=400)

    # Vérifier les points (5 pts ou 0 si VIP)
    is_vip = getattr(request.user, 'is_vip_tenant', False)
    visit_cost = 0 if is_vip else 5
    if not is_vip and request.user.points < visit_cost:
        return JsonResponse({'ok': False, 'error': f'Solde insuffisant. {visit_cost} points requis.'}, status=400)

    requested_date = request.POST.get('requested_date')
    requested_time = request.POST.get('requested_time') or None
    message        = request.POST.get('message', '').strip()

    if not requested_date:
        return JsonResponse({'ok': False, 'error': 'Date de visite requise.'}, status=400)

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

        from apps.notifications.services import create_notification
        from apps.notifications.models import Notification
        from apps.notifications.email_service import send_visit_created_email, send_visit_status_email, send_visit_cancelled_email

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

    return JsonResponse({
        'ok': True,
        'message': f'Demande de visite envoyée ! ({visit_cost} points déduits)' if visit_cost > 0 else 'Demande de visite envoyée ! (Inclus Pass VIP)',
        'visit_id': visit.pk,
        'points_remaining': request.user.points,
    })


@require_POST
@login_required(login_url='accounts:auth')
def visit_request_action(request, visit_id):
    """
    Bailleur confirme ou refuse une demande de visite.
    action = 'confirm' | 'refuse' | 'cancel'
    """
    from .models import VisitRequest
    from apps.notifications.services import create_notification
    from apps.notifications.models import Notification
    from apps.notifications.email_service import send_visit_status_email, send_visit_cancelled_email

    visit = get_object_or_404(VisitRequest, pk=visit_id)

    # Seul le bailleur du bien peut agir (sauf cancel = locataire)
    action = request.POST.get('action')

    if action == 'cancel':
        if visit.tenant != request.user:
            return JsonResponse({'ok': False, 'error': 'Interdit.'}, status=403)
        visit.cancel()
        send_visit_cancelled_email(visit)
        return JsonResponse({'ok': True, 'message': 'Demande annulée.'})

    if visit.property.owner != request.user:
        return JsonResponse({'ok': False, 'error': 'Accès refusé.'}, status=403)

    note           = request.POST.get('note', '')
    confirmed_date = request.POST.get('confirmed_date') or None
    confirmed_time = request.POST.get('confirmed_time') or None

    if action == 'confirm':
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
        return JsonResponse({'ok': True, 'message': 'Visite confirmée ! Le locataire a été notifié.'})

    elif action == 'refuse':
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
        return JsonResponse({'ok': True, 'message': 'Demande refusée.'})

    return JsonResponse({'ok': False, 'error': 'Action inconnue.'}, status=400)


# ══════════════════════════════════════════════════════════════
# DEMANDES DE LOCATION
# ══════════════════════════════════════════════════════════════

@require_POST
@login_required(login_url='accounts:auth')
def location_request_create(request, property_id):
    """Locataire soumet un dossier de location — déduit 20 pts."""
    from .models import LocationRequest

    prop = get_object_or_404(Property, pk=property_id, is_published=True)

    if prop.owner == request.user:
        return JsonResponse({'ok': False, 'error': 'Action impossible sur votre propre bien.'}, status=400)

    existing = LocationRequest.objects.filter(
        property=prop, tenant=request.user,
        status__in=['PENDING', 'REVIEWING', 'ACCEPTED']
    ).first()
    if existing:
        return JsonResponse({'ok': False, 'error': 'Vous avez déjà un dossier en cours pour ce bien.'}, status=400)

    is_vip = getattr(request.user, 'is_vip_tenant', False)
    loc_cost = 0 if is_vip else 6
    if not is_vip and request.user.points < loc_cost:
        return JsonResponse({'ok': False, 'error': f'Solde insuffisant. {loc_cost} points requis.'}, status=400)

    move_in_date = request.POST.get('move_in_date')
    if not move_in_date:
        return JsonResponse({'ok': False, 'error': "Date d'entrée requise."}, status=400)

    with transaction.atomic():
        loc = LocationRequest(
            property=prop,
            tenant=request.user,
            move_in_date=move_in_date,
            lease_duration  = int(request.POST.get('lease_duration', 12)),
            tenant_count    = int(request.POST.get('tenant_count', 1)),
            monthly_income  = request.POST.get('monthly_income') or None,
            profession      = request.POST.get('profession', '').strip(),
            employer        = request.POST.get('employer', '').strip(),
            message         = request.POST.get('message', '').strip(),
            has_guarantor   = request.POST.get('has_guarantor') == 'on',
            guarantor_name  = request.POST.get('guarantor_name', '').strip(),
            guarantor_phone = request.POST.get('guarantor_phone', '').strip(),
            guarantor_relation = request.POST.get('guarantor_relation', '').strip(),
            guarantor_income   = request.POST.get('guarantor_income') or None,
            points_deducted    = (loc_cost > 0),
        )

        # Pièces justificatives
        if 'cni_front'    in request.FILES: loc.cni_front    = request.FILES['cni_front']
        if 'cni_back'     in request.FILES: loc.cni_back     = request.FILES['cni_back']
        if 'income_proof' in request.FILES: loc.income_proof = request.FILES['income_proof']
        if 'guarantor_cni' in request.FILES: loc.guarantor_cni = request.FILES['guarantor_cni']

        loc.save()
        if loc_cost > 0:
            request.user.deduct_points(loc_cost, f"Dossier de location : {prop.title}")

        from apps.notifications.services import create_notification
        from apps.notifications.models import Notification
        from apps.notifications.email_service import send_location_created_email
        from apps.notifications.whatsapp_service import send_location_created_whatsapp

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

    return JsonResponse({
        'ok': True,
        'message': f'Dossier envoyé avec succès ! ({loc_cost} points déduits)' if loc_cost > 0 else 'Dossier envoyé avec succès ! (Inclus Pass VIP)',
        'location_id': loc.pk,
        'points_remaining': request.user.points,
        'dossier_completion': loc.get_dossier_completion(),
    })


@require_POST
@login_required(login_url='accounts:auth')
def location_request_action(request, location_id):
    """Bailleur accepte ou refuse un dossier. action = 'accept' | 'refuse' | 'cancel' | 'review'"""
    from .models import LocationRequest, PropertyStatus
    from apps.notifications.services import create_notification
    from apps.notifications.models import Notification
    from apps.notifications.email_service import (
        send_location_status_email, send_location_cancelled_email
    )
    from apps.notifications.whatsapp_service import send_location_status_whatsapp

    loc    = get_object_or_404(LocationRequest, pk=location_id)
    action = request.POST.get('action')
    note   = request.POST.get('note', '')

    if action == 'cancel':
        if loc.tenant != request.user:
            return JsonResponse({'ok': False, 'error': 'Interdit.'}, status=403)
        loc.cancel()
        send_location_cancelled_email(loc)
        return JsonResponse({'ok': True, 'message': 'Dossier annulé.'})

    if loc.property.owner != request.user:
        return JsonResponse({'ok': False, 'error': 'Accès refusé.'}, status=403)

    if action == 'accept':
        loc.accept(note)
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
        return JsonResponse({'ok': True, 'message': 'Dossier accepté ! Le locataire a été notifié.'})

    elif action == 'refuse':
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
        return JsonResponse({'ok': True, 'message': 'Dossier refusé.'})

    elif action == 'review':
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
        return JsonResponse({'ok': True, 'message': 'Dossier en cours d\'examen.'})

    return JsonResponse({'ok': False, 'error': 'Action inconnue.'}, status=400)


@login_required(login_url='accounts:auth')
def visit_detail_view(request, pk):
    """Page de détail d'une demande de visite."""
    from .models import VisitRequest

    visit = get_object_or_404(
        VisitRequest.objects.select_related('property', 'tenant'),
        pk=pk
    )

    # Seul le bailleur du bien ou le locataire concerné peut voir
    if request.user != visit.property.owner and request.user != visit.tenant:
        from django.http import Http404
        raise Http404

    return render(request, 'properties/visit_detail.html', {
        'visit': visit,
        'is_bailleur': request.user == visit.property.owner,
    })


@login_required(login_url='accounts:auth')
def location_detail_view(request, pk):
    """Page de détail d'un dossier de location."""
    from .models import LocationRequest

    loc = get_object_or_404(
        LocationRequest.objects.select_related('property', 'tenant'),
        pk=pk
    )

    if request.user != loc.property.owner and request.user != loc.tenant:
        from django.http import Http404
        raise Http404

    return render(request, 'properties/location_detail.html', {
        'loc': loc,
        'is_bailleur': request.user == loc.property.owner,
        'dossier_completion': loc.get_dossier_completion(),
    })


# ══════════════════════════════════════════════════════════════
# FAVORIS
# ══════════════════════════════════════════════════════════════

@require_POST
@login_required(login_url='accounts:auth')
def toggle_favorite(request, property_id):
    """Toggle favori — ajoute ou retire."""
    from .models import Favorite

    prop = get_object_or_404(Property, pk=property_id, is_published=True)
    
    if getattr(request.user, 'role', '') == 'BAILLEUR':
        bailleur_likes = request.session.get('bailleur_likes', [])
        str_id = str(property_id)
        
        if str_id in bailleur_likes:
            bailleur_likes.remove(str_id)
            is_favorite = False
            if prop.favorites_count > 0:
                prop.favorites_count -= 1
        else:
            bailleur_likes.append(str_id)
            is_favorite = True
            prop.favorites_count += 1
            
        request.session['bailleur_likes'] = bailleur_likes
        prop.save(update_fields=['favorites_count'])
    else:
        fav, created = Favorite.objects.get_or_create(user=request.user, property=prop)

        if not created:
            fav.delete()
            is_favorite = False
            if prop.favorites_count > 0:
                prop.favorites_count -= 1
        else:
            is_favorite = True
            prop.favorites_count += 1

        prop.save(update_fields=['favorites_count'])

    return JsonResponse({
        'ok': True,
        'is_favorite': is_favorite,
        'count': prop.favorites_count,
    })


# ══════════════════════════════════════════════════════════════
# ALERTES DE RECHERCHE
# ══════════════════════════════════════════════════════════════

@login_required(login_url='accounts:auth')
def search_alerts_view(request):
    """Page de gestion des alertes."""
    from .models import SearchAlert, PropertyType, TransactionType
    alerts = SearchAlert.objects.filter(user=request.user)
    return render(request, 'properties/search_alerts.html', {
        'alerts': alerts,
        'property_types': PropertyType.choices,
        'transaction_types': TransactionType.choices,
    })


@require_POST
@login_required(login_url='accounts:auth')
def create_search_alert(request):
    """Créer une alerte de recherche."""
    from .models import SearchAlert

    title           = request.POST.get('title', '').strip()
    city            = request.POST.get('city', '').strip()
    property_type   = request.POST.get('property_type', '').strip()
    transaction_type = request.POST.get('transaction_type', 'LOCATION').strip()
    min_price       = request.POST.get('min_price') or None
    max_price       = request.POST.get('max_price') or None
    min_area        = request.POST.get('min_area') or None

    if not title:
        return JsonResponse({'ok': False, 'error': 'Nom de l\'alerte requis.'})

    alert = SearchAlert.objects.create(
        user=request.user,
        title=title,
        city=city,
        property_type=property_type,
        transaction_type=transaction_type,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
    )

    return JsonResponse({
        'ok': True,
        'alert_id': alert.pk,
        'message': f'Alerte "{title}" créée avec succès.',
    })


@require_POST
@login_required(login_url='accounts:auth')
def delete_search_alert(request, alert_id):
    """Supprimer une alerte."""
    from .models import SearchAlert
    alert = get_object_or_404(SearchAlert, pk=alert_id, user=request.user)
    alert.delete()
    return JsonResponse({'ok': True, 'message': 'Alerte supprimée.'})
# ==============================================================================
# VISITE VIRTUELLE 360°
# ==============================================================================

@login_required(login_url='accounts:auth')
def tour_editor_view(request, slug):
    """Éditeur de la visite virtuelle 360° (côté bailleur)."""
    from apps.properties.models import VirtualTour, PanoramaScene, PanoramaHotspot
    property_obj = get_object_or_404(Property, slug=slug, owner=request.user)
    
    # Récupérer ou créer le tour
    tour, created = VirtualTour.objects.get_or_create(property=property_obj)
    
    if request.method == 'POST':
        # Gestion d'upload d'une nouvelle pièce
        if 'new_room_image' in request.FILES:
            room_name = request.POST.get('room_name', 'Nouvelle pièce')
            PanoramaScene.objects.create(
                tour=tour,
                name=room_name,
                image=request.FILES['new_room_image'],
                order=tour.scenes.count()
            )
            messages.success(request, f"La pièce '{room_name}' a été ajoutée avec succès.")
            return redirect('properties:tour_editor', slug=slug)
            
        # Gestion de l'ajout d'un hotspot via formulaire caché
        elif 'pitch' in request.POST and 'yaw' in request.POST:
            try:
                source_scene_id = request.POST.get('source_scene_id')
                target_scene_id = request.POST.get('target_scene_id')
                pitch = float(request.POST.get('pitch'))
                yaw = float(request.POST.get('yaw'))
                text = request.POST.get('hotspot_text', 'Aller à la pièce')
                
                source_scene = PanoramaScene.objects.get(id=source_scene_id, tour=tour)
                target_scene = PanoramaScene.objects.get(id=target_scene_id, tour=tour)
                
                PanoramaHotspot.objects.create(
                    scene=source_scene,
                    target_scene=target_scene,
                    pitch=pitch,
                    yaw=yaw,
                    label=text
                )
                messages.success(request, "Hotspot ajouté avec succès.")
            except Exception as e:
                messages.error(request, f"Erreur lors de l'ajout du hotspot : {str(e)}")
            return redirect('properties:tour_editor', slug=slug)

    scenes = tour.scenes.all().prefetch_related('hotspots', 'hotspots__target_scene')
    
    context = {
        'property': property_obj,
        'tour': tour,
        'scenes': scenes,
    }
    return render(request, 'properties/tour_editor.html', context)

def tour_viewer_view(request, slug):
    """Lecteur de la visite virtuelle 360° pour les locataires et bailleurs."""
    from apps.properties.models import VirtualTour, PanoramaScene
    return JsonResponse({'ok': True, 'message': 'Alerte supprimée.'})
# ==============================================================================
# VISITE VIRTUELLE 360°
# ==============================================================================

@login_required(login_url='accounts:auth')
def tour_editor_view(request, slug):
    """Éditeur de la visite virtuelle 360° (côté bailleur)."""
    from apps.properties.models import VirtualTour, PanoramaScene, PanoramaHotspot
    property_obj = get_object_or_404(Property, slug=slug, owner=request.user)
    
    # Récupérer ou créer le tour
    tour, created = VirtualTour.objects.get_or_create(property=property_obj)
    
    if request.method == 'POST':
        # Gestion d'upload d'une nouvelle pièce
        if 'new_room_image' in request.FILES:
            room_name = request.POST.get('room_name', 'Nouvelle pièce')
            PanoramaScene.objects.create(
                tour=tour,
                name=room_name,
                image=request.FILES['new_room_image'],
                order=tour.scenes.count()
            )
            messages.success(request, f"La pièce '{room_name}' a été ajoutée avec succès.")
            return redirect('properties:tour_editor', slug=slug)
            
        # Gestion de l'ajout d'un hotspot via formulaire caché
        elif 'pitch' in request.POST and 'yaw' in request.POST:
            try:
                source_scene_id = request.POST.get('source_scene_id')
                target_scene_id = request.POST.get('target_scene_id')
                pitch = float(request.POST.get('pitch'))
                yaw = float(request.POST.get('yaw'))
                text = request.POST.get('hotspot_text', 'Aller à la pièce')
                
                source_scene = PanoramaScene.objects.get(id=source_scene_id, tour=tour)
                target_scene = PanoramaScene.objects.get(id=target_scene_id, tour=tour)
                
                PanoramaHotspot.objects.create(
                    scene=source_scene,
                    target_scene=target_scene,
                    pitch=pitch,
                    yaw=yaw,
                    label=text
                )
                messages.success(request, "Hotspot ajouté avec succès.")
            except Exception as e:
                messages.error(request, f"Erreur lors de l'ajout du hotspot : {str(e)}")
            return redirect('properties:tour_editor', slug=slug)

    scenes = tour.scenes.all().prefetch_related('hotspots', 'hotspots__target_scene')
    
    context = {
        'property': property_obj,
        'tour': tour,
        'scenes': scenes,
    }
    return render(request, 'properties/tour_editor.html', context)

def tour_viewer_view(request, slug):
    """Lecteur de la visite virtuelle 360° pour les locataires et bailleurs."""
    from apps.properties.models import VirtualTour, PanoramaScene
    property_obj = get_object_or_404(Property, slug=slug)
    tour = get_object_or_404(VirtualTour, property=property_obj)
    
    scenes = tour.scenes.all().prefetch_related('hotspots', 'hotspots__target_scene')
    
    context = {
        'property': property_obj,
        'tour': tour,
        'scenes': scenes,
    }
    return render(request, 'properties/tour_viewer.html', context)


# ==========================================
# 📱 MODE DÉCOUVERTE (TikTok Immobilier)
# ==========================================

def decouverte_view(request):
    """Affiche le mode découverte avec défilement vertical type TikTok"""
    properties = Property.objects.exclude(video_reel='').exclude(video_reel__isnull=True).filter(status=PropertyStatus.PUBLISHED).order_by('-published_at')
    
    favoris_ids = []
    if request.user.is_authenticated:
        if getattr(request.user, 'role', '') == 'BAILLEUR':
            # Les bailleurs utilisent la session pour les likes (pour ne pas polluer leurs favoris inexistants)
            bailleur_likes = request.session.get('bailleur_likes', [])
            import uuid
            favoris_ids = [uuid.UUID(uid) for uid in bailleur_likes if uid]
        else:
            from .models import Favorite
            favoris_ids = list(Favorite.objects.filter(user=request.user).values_list('property_id', flat=True))
    
    # Si un slug est passé en paramètre (ex: depuis le dashboard bailleur "Voir le Reel"), on l'envoie au template pour scroller
    target_slug = request.GET.get('prop', '')
    
    return render(request, 'properties/decouverte.html', {
        'properties': properties,
        'favoris_ids': favoris_ids,
        'target_slug': target_slug,
    })

@login_required
@require_POST
def property_upload_reel(request, slug):
    """Uploade la vidéo Reel (découverte) via AJAX"""
    property_obj = get_object_or_404(Property, slug=slug, owner=request.user)
    
    if 'video_reel' in request.FILES:
        video = request.FILES['video_reel']
        try:
            validate_uploaded_file(
                video, allowed_extensions=VIDEO_EXTENSIONS,
                allowed_mime_types=VIDEO_MIME_TYPES, label='video_reel',
                max_size=200 * 1024 * 1024,
            )
        except Exception as exc:
            return JsonResponse({'success': False, 'error': str(exc)}, status=400)
            
        if property_obj.video_reel:
            property_obj.video_reel.delete(save=False)
            
        property_obj.video_reel = video
        
    desc = request.POST.get('reel_description') or request.POST.get('caption')
    if desc is not None:
        property_obj.reel_description = desc.strip()
        
    if 'video_reel' in request.FILES or desc is not None:
        property_obj.save()
        return JsonResponse({'success': True})
        
    return JsonResponse({'success': False, 'error': "Aucune donnée fournie."})

# ==========================================
# 🌟 FAVORIS
# ==========================================

@login_required(login_url='accounts:auth')
def favorites_list_view(request):
    """Affiche la liste des biens favoris de l'utilisateur."""
    from apps.properties.models import Favorite
    favorites = Favorite.objects.filter(user=request.user).select_related('property')
    properties = [fav.property for fav in favorites]
    
    # We will pass the list of favoris_ids so the heart icon can be highlighted
    favoris_ids = [prop.id for prop in properties]
    
    return render(request, 'properties/favorites_list.html', {
        'properties': properties,
        'favoris_ids': favoris_ids,
    })

# ==========================================
# 📅 VISITES
# ==========================================

@login_required(login_url='accounts:auth')
def visits_list_view(request):
    """Affiche la liste de toutes les visites du locataire."""
    from apps.properties.models import VisitRequest
    visits = VisitRequest.objects.filter(tenant=request.user).select_related('property').order_by('-created_at')
    
    return render(request, 'properties/visits_list.html', {
        'visits': visits,
    })
# ==========================================
# 💬 MESSAGES
# ==========================================

@login_required(login_url='accounts:auth')
def messages_list_view(request):
    """Affiche la liste des messages de l'utilisateur."""
    # Placeholder pour la messagerie
    return render(request, 'properties/messages_list.html')
