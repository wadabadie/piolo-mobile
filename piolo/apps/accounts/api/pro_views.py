from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from django.db import transaction

from ..models import (
    ProfessionalProfile,
    ProfessionalProject,
    ProfessionalProjectLike,
    ProfessionalReview,
    ProfessionalQuoteRequest,
    CustomUser,
)
from .pro_serializers import (
    ProfessionalProfileSerializer,
    ProfessionalProjectSerializer,
    ProfessionalReviewSerializer,
    ProfessionalQuoteRequestSerializer,
)


class ProfessionalListAPIView(APIView):
    """Liste publique de tous les professionnels certifiés enregistrés en base."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Garantir que tous les utilisateurs ayant le rôle Pro / Architecte ont leur profil
        pro_users = CustomUser.objects.filter(role__in=['ARCHITECTE', 'PROFESSIONNEL']).exclude(
            id__in=ProfessionalProfile.objects.values_list('user_id', flat=True)
        )
        for u in pro_users:
            ProfessionalProfile.objects.get_or_create(
                user=u,
                defaults={
                    'business_name': f"{u.first_name} {u.last_name}".strip() or "Artisan Certifié",
                    'city': u.city or "Yaoundé",
                    'phone': u.phone or "",
                    'whatsapp': u.phone or ""
                }
            )

        queryset = ProfessionalProfile.objects.select_related('user').prefetch_related('projects', 'reviews').all()

        category = request.query_params.get('category')
        city = request.query_params.get('city')
        search = request.query_params.get('search')

        if category and category != 'all':
            queryset = queryset.filter(
                Q(primary_trade__icontains=category) |
                Q(secondary_trades__icontains=category)
            )

        if city and city != 'all':
            queryset = queryset.filter(city__icontains=city)

        if search:
            queryset = queryset.filter(
                Q(business_name__icontains=search) |
                Q(primary_trade__icontains=search) |
                Q(bio__icontains=search) |
                Q(secondary_trades__icontains=search)
            )

        serializer = ProfessionalProfileSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfessionalDetailAPIView(APIView):
    """Détail complet d'un professionnel par son identifiant UUID."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            profile = ProfessionalProfile.objects.select_related('user').prefetch_related('projects', 'reviews').filter(Q(id=pk) | Q(user__id=pk)).first()
            if not profile:
                profile = get_object_or_404(ProfessionalProfile, pk=pk)
        except Exception:
            profile = get_object_or_404(ProfessionalProfile, pk=pk)
        
        # Incrémentation du compteur de vues profil
        if not (request.user.is_authenticated and profile.user_id == request.user.id):
            ProfessionalProfile.objects.filter(pk=profile.pk).update(views_count=F('views_count') + 1)
            profile.refresh_from_db(fields=['views_count'])

        serializer = ProfessionalProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfessionalMeProfileAPIView(APIView):
    """Récupération et mise à jour du profil professionnel de l'utilisateur connecté."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = ProfessionalProfile.objects.get_or_create(
            user=user,
            defaults={
                'business_name': f"{user.first_name} {user.last_name}".strip() or "Mon Entreprise Pro",
                'primary_trade': "Artisan du Bâtiment & Habitat",
                'city': user.city or "Yaoundé",
                'phone': user.phone or "",
                'whatsapp': user.phone or "",
            }
        )
        serializer = ProfessionalProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        profile, _ = ProfessionalProfile.objects.get_or_create(user=user)

        data = request.data
        profile.business_name = data.get('business_name', profile.business_name)
        profile.primary_trade = data.get('primary_trade', profile.primary_trade)
        if 'secondary_trades' in data:
            profile.secondary_trades = data.get('secondary_trades')
        profile.city = data.get('city', profile.city)
        profile.neighborhoods = data.get('neighborhoods', profile.neighborhoods)
        profile.experience_years = data.get('experience_years', profile.experience_years)
        profile.phone = data.get('phone', profile.phone)
        profile.whatsapp = data.get('whatsapp', profile.whatsapp)
        profile.pricing_indicative = data.get('pricing_indicative', profile.pricing_indicative)
        profile.bio = data.get('bio', profile.bio)

        if 'latitude' in data and data.get('latitude') not in [None, '']:
            try:
                profile.latitude = float(data.get('latitude'))
            except (ValueError, TypeError):
                pass

        if 'longitude' in data and data.get('longitude') not in [None, '']:
            try:
                profile.longitude = float(data.get('longitude'))
            except (ValueError, TypeError):
                pass

        if 'address' in data:
            profile.address = data.get('address', profile.address)

        if 'cover_image' in request.FILES:
            profile.cover_image = request.FILES['cover_image']

        profile.save()
        serializer = ProfessionalProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


import base64
import uuid
from django.core.files.base import ContentFile

def parse_image_data(file_obj, data_str, prefix='pro_proj'):
    if file_obj:
        return file_obj, ''
    if data_str and isinstance(data_str, str):
        if data_str.startswith('data:image'):
            try:
                header, img_str = data_str.split(';base64,')
                ext = header.split('/')[-1]
                if ext == 'jpeg': ext = 'jpg'
                file_name = f"{prefix}_{uuid.uuid4().hex[:8]}.{ext}"
                return ContentFile(base64.b64decode(img_str), name=file_name), ''
            except Exception:
                pass
        return None, data_str
    return None, ''


class ProfessionalProjectListCreateAPIView(APIView):
    """Liste de toutes les réalisations réelles ou création d'une nouvelle réalisation."""
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        pro_id = request.query_params.get('pro_id')
        queryset = ProfessionalProject.objects.select_related('professional', 'professional__user').all()

        if pro_id:
            queryset = queryset.filter(professional_id=pro_id)

        serializer = ProfessionalProjectSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        profile, _ = ProfessionalProfile.objects.get_or_create(
            user=user,
            defaults={
                'business_name': f"{user.first_name} {user.last_name}".strip() or "Mon Entreprise Pro",
                'city': user.city or "Yaoundé"
            }
        )

        # Déduire 5 points du compte de l'artisan (s'il n'a pas d'abonnement illimité)
        has_vip = profile.subscription_plan in ['PRO', 'CABINET', 'ILLIMITE']
        if not has_vip:
            if user.points < 5:
                return Response(
                    {"detail": "Solde insuffisant. Vous devez disposer d'au moins 5 points pour publier ce projet."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.points -= 5
            user.save(update_fields=['points'])

        data = request.data
        
        main_file = request.FILES.get('main_image') or request.FILES.get('image')
        main_str = data.get('main_image_url') or data.get('image') or data.get('main_image')
        main_img, main_url = parse_image_data(main_file, main_str, prefix='pro_main')

        before_file = request.FILES.get('before_image')
        before_str = data.get('before_image_url') or data.get('beforeImage') or data.get('before_image')
        before_img, before_url = parse_image_data(before_file, before_str, prefix='pro_before')

        materials_val = data.get('materials', [])
        if isinstance(materials_val, str):
            try:
                import json
                materials_val = json.loads(materials_val)
            except Exception:
                materials_val = [m.strip() for m in materials_val.split(',') if m.strip()]

        # Traitement complet des photos de la galerie
        import os
        from django.conf import settings

        gallery_input = data.get('gallery_images') or data.get('galleryImages') or data.get('gallery') or []
        if isinstance(gallery_input, str):
            try:
                import json
                gallery_input = json.loads(gallery_input)
            except Exception:
                gallery_input = [gallery_input]

        parsed_gallery = []
        if isinstance(gallery_input, list):
            for idx, g_item in enumerate(gallery_input):
                g_str = g_item.get('url') if isinstance(g_item, dict) else g_item
                if g_str and isinstance(g_str, str):
                    if g_str.startswith('data:image'):
                        try:
                            header, img_str = g_str.split(';base64,')
                            ext = header.split('/')[-1]
                            if ext == 'jpeg': ext = 'jpg'
                            file_name = f"pro_gal_{uuid.uuid4().hex[:8]}.{ext}"
                            file_path = os.path.join(settings.MEDIA_ROOT, 'pro_projects', file_name)
                            os.makedirs(os.path.dirname(file_path), exist_ok=True)
                            with open(file_path, 'wb') as f:
                                f.write(base64.b64decode(img_str))
                            parsed_gallery.append(f"/media/pro_projects/{file_name}")
                        except Exception:
                            pass
                    else:
                        parsed_gallery.append(g_str)

        for f in request.FILES.getlist('gallery_images') + request.FILES.getlist('gallery'):
            try:
                ext = f.name.split('.')[-1] if '.' in f.name else 'jpg'
                file_name = f"pro_gal_{uuid.uuid4().hex[:8]}.{ext}"
                file_path = os.path.join(settings.MEDIA_ROOT, 'pro_projects', file_name)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'wb') as dest:
                    for chunk in f.chunks():
                        dest.write(chunk)
                parsed_gallery.append(f"/media/pro_projects/{file_name}")
            except Exception:
                pass

        # Traitement des vidéos du projet (Fichiers & Base64)
        videos_input = data.get('videos') or []
        if isinstance(videos_input, str):
            try:
                import json
                videos_input = json.loads(videos_input)
            except Exception:
                videos_input = [videos_input]

        parsed_videos = []
        if isinstance(videos_input, list):
            for v_item in videos_input:
                if isinstance(v_item, dict):
                    v_url = v_item.get('url', '')
                    v_title = v_item.get('title', 'Visite du chantier')
                    v_desc = v_item.get('description', '')
                else:
                    v_url = str(v_item)
                    v_title = 'Visite du chantier'
                    v_desc = ''

                if v_url.startswith('data:video'):
                    try:
                        header, vid_str = v_url.split(';base64,')
                        ext = header.split('/')[-1]
                        if 'mp4' in ext: ext = 'mp4'
                        elif 'webm' in ext: ext = 'webm'
                        elif 'quicktime' in ext or 'mov' in ext: ext = 'mov'
                        else: ext = 'mp4'
                        vid_file_name = f"pro_vid_{uuid.uuid4().hex[:8]}.{ext}"
                        vid_file_path = os.path.join(settings.MEDIA_ROOT, 'pro_projects', 'videos', vid_file_name)
                        os.makedirs(os.path.dirname(vid_file_path), exist_ok=True)
                        with open(vid_file_path, 'wb') as vf:
                            vf.write(base64.b64decode(vid_str))
                        parsed_videos.append({
                            'url': f"/media/pro_projects/videos/{vid_file_name}",
                            'title': v_title,
                            'description': v_desc
                        })
                    except Exception:
                        pass
                elif v_url:
                    parsed_videos.append({
                        'url': v_url,
                        'title': v_title,
                        'description': v_desc
                    })

        for vf in request.FILES.getlist('videos'):
            try:
                ext = vf.name.split('.')[-1] if '.' in vf.name else 'mp4'
                vid_file_name = f"pro_vid_{uuid.uuid4().hex[:8]}.{ext}"
                vid_file_path = os.path.join(settings.MEDIA_ROOT, 'pro_projects', 'videos', vid_file_name)
                os.makedirs(os.path.dirname(vid_file_path), exist_ok=True)
                with open(vid_file_path, 'wb') as dest:
                    for chunk in vf.chunks():
                        dest.write(chunk)
                parsed_videos.append({
                    'url': f"/media/pro_projects/videos/{vid_file_name}",
                    'title': vf.name,
                    'description': ''
                })
            except Exception:
                pass

        project = ProfessionalProject.objects.create(
            professional=profile,
            title=data.get('title', 'Nouveau Projet Réalisé'),
            category=data.get('category', profile.primary_trade),
            city=data.get('city', profile.city),
            duration=data.get('duration', '2 semaines'),
            budget=data.get('budget', ''),
            main_image=main_img,
            main_image_url=main_url if not main_img else '',
            before_image=before_img,
            before_image_url=before_url if not before_img else '',
            gallery_images=parsed_gallery,
            videos=parsed_videos,
            materials=materials_val if isinstance(materials_val, list) else [],
            description=data.get('description', '')
        )

        serializer = ProfessionalProjectSerializer(project, context={'request': request})
        return Response({
            'project': serializer.data,
            'user_points': user.points,
            'message': 'Projet enregistré et publié avec succès dans la base de données !'
        }, status=status.HTTP_201_CREATED)


class ProfessionalProjectDetailAPIView(APIView):
    """Suppression définitive d'un projet en base par son propriétaire."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        user = request.user
        project = get_object_or_404(ProfessionalProject, pk=pk)

        # Sécurité : vérifier que l'utilisateur est bien le créateur
        if project.professional.user != user and not user.is_staff:
            return Response({"detail": "Vous n'avez pas l'autorisation de supprimer ce projet."}, status=status.HTTP_403_FORBIDDEN)

        project.delete()
        return Response({"detail": "Projet supprimé avec succès de la base de données."}, status=status.HTTP_200_OK)


class ProfessionalProjectLikeAPIView(APIView):
    """Like / Unlike persistant pour les projets et chantiers réels des professionnels."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        project = get_object_or_404(ProfessionalProject, pk=pk)
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key or request.META.get('REMOTE_ADDR', '')

        with transaction.atomic():
            project = ProfessionalProject.objects.select_for_update().get(pk=pk)
            
            if user:
                like_obj = ProfessionalProjectLike.objects.filter(project=project, user=user).first()
                if like_obj:
                    # Unlike
                    like_obj.delete()
                    if project.likes_count > 0:
                        project.likes_count -= 1
                    is_liked = False
                else:
                    # Like
                    ProfessionalProjectLike.objects.create(project=project, user=user)
                    project.likes_count += 1
                    is_liked = True
            else:
                # Utilisateur anonyme
                is_liked = True
                project.likes_count += 1

            project.save(update_fields=['likes_count'])

        return Response({
            'is_liked': is_liked,
            'likes_count': project.likes_count,
            'message': 'Like enregistré avec succès' if is_liked else 'Like retiré'
        }, status=status.HTTP_200_OK)


class ProfessionalReviewListCreateAPIView(APIView):
    """Consultation et ajout d'un avis client étoilé enregistré en base de données."""
    
    def get_permissions(self):
        return [permissions.AllowAny()]

    def get(self, request, pk):
        profile = None
        try:
            profile = ProfessionalProfile.objects.filter(Q(id=pk) | Q(user__id=pk)).first()
        except Exception:
            pass
        if not profile:
            profile = get_object_or_404(ProfessionalProfile, pk=pk)

        reviews = profile.reviews.all().order_by('-created_at')
        serializer = ProfessionalReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        profile = None
        try:
            profile = ProfessionalProfile.objects.filter(Q(id=pk) | Q(user__id=pk)).first()
        except Exception:
            pass
        if not profile:
            profile = get_object_or_404(ProfessionalProfile, pk=pk)
        
        # Sécurité : Empêcher le propriétaire de laisser un avis sur son propre profil
        if request.user.is_authenticated and profile.user == request.user:
            return Response(
                {"detail": "Vous ne pouvez pas laisser d'avis ou de note sur votre propre profil professionnel."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data

        author_user = request.user if request.user.is_authenticated else None
        author_name = data.get('author_name') or (f"{author_user.first_name} {author_user.last_name}".strip() if author_user else "Client Piolo")
        author_role = data.get('author_role', 'Locataire Vérifié')
        try:
            rating_val = int(data.get('rating', 5))
        except (ValueError, TypeError):
            rating_val = 5
        comment_val = data.get('comment', '').strip()

        if not comment_val:
            return Response({"detail": "Le commentaire est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

        review = ProfessionalReview.objects.create(
            professional=profile,
            author_user=author_user,
            author_name=author_name,
            author_role=author_role,
            rating=max(1, min(5, rating_val)),
            comment=comment_val
        )

        serializer = ProfessionalReviewSerializer(review, context={'request': request})
        return Response({
            'review': serializer.data,
            'new_average': profile.rating,
            'reviews_count': profile.reviews_count,
            'message': 'Votre avis a été publié avec succès !'
        }, status=status.HTTP_201_CREATED)


class ProfessionalQuoteListCreateAPIView(APIView):
    """Envoi d'une demande de devis en base et consultation des devis par l'artisan."""
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        user = request.user
        profile = ProfessionalProfile.objects.filter(user=user).first()
        if profile:
            quotes = profile.quote_requests.all().order_by('-created_at')
        else:
            quotes = user.pro_quote_requests_sent.all().order_by('-created_at')

        serializer = ProfessionalQuoteRequestSerializer(quotes, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk=None):
        target_pk = pk or request.data.get('professional_id') or request.data.get('pro_id')
        profile = None
        if target_pk:
            try:
                profile = ProfessionalProfile.objects.filter(Q(id=target_pk) | Q(user__id=target_pk)).first()
            except Exception:
                pass
        if not profile:
            profile = get_object_or_404(ProfessionalProfile, pk=target_pk)

        data = request.data
        user = request.user if (request.user and request.user.is_authenticated) else None

        # Traitement des photos d'inspiration
        import os
        import base64
        import uuid
        from django.conf import settings

        photos_input = data.get('photos') or data.get('inspirationPhotos') or []
        if isinstance(photos_input, str):
            try:
                import json
                photos_input = json.loads(photos_input)
            except Exception:
                photos_input = [photos_input]

        parsed_photos = []
        if isinstance(photos_input, list):
            for idx, p_item in enumerate(photos_input):
                p_str = p_item.get('url') if isinstance(p_item, dict) else p_item
                if p_str and isinstance(p_str, str):
                    if p_str.startswith('data:image'):
                        try:
                            header, img_str = p_str.split(';base64,')
                            ext = header.split('/')[-1]
                            if ext == 'jpeg': ext = 'jpg'
                            file_name = f"quote_{uuid.uuid4().hex[:8]}.{ext}"
                            file_path = os.path.join(settings.MEDIA_ROOT, 'pro_quotes', file_name)
                            os.makedirs(os.path.dirname(file_path), exist_ok=True)
                            with open(file_path, 'wb') as f:
                                f.write(base64.b64decode(img_str))
                            parsed_photos.append(f"/media/pro_quotes/{file_name}")
                        except Exception:
                            pass
                    else:
                        parsed_photos.append(p_str)

        for f in request.FILES.getlist('photos') + request.FILES.getlist('inspirationPhotos'):
            try:
                ext = f.name.split('.')[-1] if '.' in f.name else 'jpg'
                file_name = f"quote_{uuid.uuid4().hex[:8]}.{ext}"
                file_path = os.path.join(settings.MEDIA_ROOT, 'pro_quotes', file_name)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'wb') as dest:
                    for chunk in f.chunks():
                        dest.write(chunk)
                parsed_photos.append(f"/media/pro_quotes/{file_name}")
            except Exception:
                pass

        # Déduction de 2 points Piolo pour la mise en relation devis (si points suffisants)
        points_deducted = 0
        if user:
            try:
                if getattr(user, 'points', 0) >= 2:
                    user.deduct_points(2, reason=f"Demande de devis transmise à {profile.business_name}")
                    points_deducted = 2
            except Exception:
                pass

        quote = ProfessionalQuoteRequest.objects.create(
            professional=profile,
            client_user=user,
            client_name=data.get('client_name', (f"{user.first_name} {user.last_name}".strip() if user else "Client Piolo")),
            client_phone=data.get('client_phone', getattr(user, 'phone', '') or ''),
            client_email=data.get('client_email', getattr(user, 'email', '') or ''),
            project_type=data.get('project_type', profile.primary_trade),
            city=data.get('city', profile.city),
            budget_estimate=data.get('budget_estimate', ''),
            desired_date=data.get('desired_date', ''),
            description=data.get('description', ''),
            photos=parsed_photos
        )

        # Notification WhatsApp & Email à l'artisan
        try:
            from apps.notifications.whatsapp_service import send_pro_quote_created_whatsapp
            send_pro_quote_created_whatsapp(quote)
        except Exception:
            pass

        try:
            from apps.notifications.email_service import send_pro_quote_created_email
            send_pro_quote_created_email(quote)
        except Exception:
            pass

        serializer = ProfessionalQuoteRequestSerializer(quote, context={'request': request})
        return Response({
            'quote': serializer.data,
            'points_deducted': points_deducted,
            'new_points_balance': user.points if user else None,
            'message': f"Votre demande de devis a été transmise à {profile.business_name} !"
        }, status=status.HTTP_201_CREATED)


class ProfessionalQuoteDetailAPIView(APIView):
    """Mise à jour du statut d'un devis par l'artisan (ex: CONTACTED, ACCEPTED, COMPLETED, REJECTED)."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        quote = get_object_or_404(ProfessionalQuoteRequest, pk=pk)
        
        # Seul l'artisan propriétaire ou le client peut agir
        is_pro_owner = quote.professional.user == request.user
        is_client = quote.client_user == request.user
        if not is_pro_owner and not is_client and not request.user.is_staff:
            return Response({'detail': "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status and new_status in dict(ProfessionalQuoteRequest.STATUS_CHOICES):
            quote.status = new_status
            quote.save(update_fields=['status'])

            # Alerte WhatsApp & Email au client
            try:
                from apps.notifications.whatsapp_service import send_pro_quote_status_whatsapp
                send_pro_quote_status_whatsapp(quote, status=new_status)
            except Exception:
                pass

            try:
                from apps.notifications.email_service import send_pro_quote_status_email
                send_pro_quote_status_email(quote, status=new_status)
            except Exception:
                pass

        serializer = ProfessionalQuoteRequestSerializer(quote, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

