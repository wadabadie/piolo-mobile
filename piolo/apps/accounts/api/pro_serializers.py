from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import (
    ProfessionalProfile,
    ProfessionalProject,
    ProfessionalReview,
    ProfessionalQuoteRequest,
)

User = get_user_model()


class ProfessionalReviewSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalReview
        fields = [
            'id', 'professional', 'author_user', 'author_name',
            'author_role', 'rating', 'comment', 'created_at',
            'created_at_formatted'
        ]
        read_only_fields = ['id', 'created_at', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y') if obj.created_at else ''


class ProfessionalProjectSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    main_image_display = serializers.SerializerMethodField()
    before_image_display = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    beforeImage = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalProject
        fields = [
            'id', 'professional', 'title', 'category', 'city',
            'duration', 'budget', 'main_image', 'main_image_url',
            'main_image_display', 'before_image', 'before_image_url',
            'before_image_display', 'gallery_images', 'gallery', 'videos', 'materials',
            'description', 'likes_count', 'created_at', 'author',
            'image', 'beforeImage', 'is_liked'
        ]
        read_only_fields = ['id', 'created_at', 'author', 'is_liked']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_videos(self, obj):
        request = self.context.get('request')
        formatted = []
        for idx, vid in enumerate(obj.videos or []):
            if isinstance(vid, str):
                url = vid
                if url.startswith('/media/') and request:
                    url = request.build_absolute_uri(url)
                formatted.append({'id': idx + 1, 'url': url, 'title': f"Vidéo Chantier {idx + 1}"})
            elif isinstance(vid, dict):
                url = vid.get('url', '')
                if url.startswith('/media/') and request:
                    url = request.build_absolute_uri(url)
                formatted.append({
                    'id': vid.get('id', idx + 1),
                    'url': url,
                    'title': vid.get('title', f"Vidéo Chantier {idx + 1}"),
                    'description': vid.get('description', '')
                })
        return formatted

    def get_gallery(self, obj):
        request = self.context.get('request')
        items = []
        main = self.get_main_image_display(obj)
        if main:
            items.append({'id': 1, 'url': main})
        
        before = self.get_before_image_display(obj)
        if before:
            items.append({'id': 2, 'url': before})

        for idx, g in enumerate(obj.gallery_images or []):
            url = g
            if isinstance(g, str) and g.startswith('/media/') and request:
                url = request.build_absolute_uri(g)
            items.append({'id': idx + 3, 'url': url})
        return items

    def get_main_image_display(self, obj):
        if obj.main_image:
            try:
                return obj.main_image.url
            except Exception:
                pass
        return obj.main_image_url or ''

    def get_image(self, obj):
        return self.get_main_image_display(obj)

    def get_before_image_display(self, obj):
        if obj.before_image:
            try:
                return obj.before_image.url
            except Exception:
                pass
        return obj.before_image_url or None

    def get_beforeImage(self, obj):
        return self.get_before_image_display(obj)

    def get_author(self, obj):
        pro = obj.professional
        return {
            'id': str(pro.id),
            'user_id': str(pro.user.id),
            'name': pro.business_name,
            'city': pro.city,
            'phone': pro.phone or pro.user.phone,
            'whatsapp': pro.whatsapp or pro.user.phone,
            'rating': pro.rating,
            'reviewsCount': pro.reviews_count,
            'specialty': pro.primary_trade,
        }


class ProfessionalQuoteRequestSerializer(serializers.ModelSerializer):
    professional_name = serializers.CharField(source='professional.business_name', read_only=True)
    photos = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalQuoteRequest
        fields = [
            'id', 'professional', 'professional_name', 'client_user',
            'client_name', 'client_phone', 'client_email', 'project_type',
            'city', 'budget_estimate', 'desired_date', 'description',
            'photos', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'professional_name']

    def get_photos(self, obj):
        res = []
        request = self.context.get('request')
        for p in (obj.photos or []):
            if isinstance(p, str) and p.startswith('/media/') and request:
                res.append(request.build_absolute_uri(p))
            elif isinstance(p, str):
                res.append(p)
            elif isinstance(p, dict) and 'url' in p:
                res.append(p['url'])
        return res


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    projects = ProfessionalProjectSerializer(many=True, read_only=True)
    reviews = ProfessionalReviewSerializer(many=True, read_only=True)
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    projects_count = serializers.IntegerField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ProfessionalProfile
        fields = [
            'id', 'user', 'user_email', 'business_name', 'primary_trade',
            'secondary_trades', 'city', 'neighborhoods', 'address', 'latitude', 'longitude',
            'experience_years', 'phone', 'whatsapp', 'pricing_indicative', 'bio',
            'cover_image', 'cover_image_url', 'avatar_url', 'is_verified', 'is_available',
            'subscription_plan', 'views_count', 'rating', 'reviews_count', 'projects_count',
            'projects', 'reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'views_count', 'rating', 'reviews_count',
            'projects_count', 'projects', 'reviews', 'created_at', 'updated_at'
        ]

    def get_avatar_url(self, obj):
        return obj.user.avatar.url if obj.user.avatar else None

    def get_cover_image_url(self, obj):
        return obj.cover_image.url if obj.cover_image else None
