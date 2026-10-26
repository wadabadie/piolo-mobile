from rest_framework import serializers
from apps.properties.models import Property, PropertyImage, VirtualTour, PanoramaScene, PanoramaHotspot
from apps.accounts.api.serializers import UserSerializer, UserPublicSerializer
from apps.core.file_validation import validate_uploaded_file, IMAGE_EXTENSIONS, IMAGE_MIME_TYPES

class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'order']

class PanoramaHotspotSerializer(serializers.ModelSerializer):
    target_scene_id = serializers.ReadOnlyField(source='target_scene.id')

    class Meta:
        model = PanoramaHotspot
        fields = ['id', 'yaw', 'pitch', 'hotspot_type', 'label', 'target_scene', 'target_scene_id']

class PanoramaSceneSerializer(serializers.ModelSerializer):
    hotspots = PanoramaHotspotSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            try:
                url = obj.image.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        return None

    class Meta:
        model = PanoramaScene
        fields = ['id', 'name', 'image', 'image_url', 'order', 'config_data', 'hotspots']

class VirtualTourSerializer(serializers.ModelSerializer):
    scenes = PanoramaSceneSerializer(many=True, read_only=True)

    class Meta:
        model = VirtualTour
        fields = ['id', 'name', 'is_active', 'scenes']

class PropertyCardSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    images_count = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    has_360 = serializers.SerializerMethodField()

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.properties.models import Favorite
            return Favorite.objects.filter(user=request.user, property=obj).exists()
        return False

    def get_images_count(self, obj):
        try:
            return obj.images.count() + (1 if obj.main_image else 0)
        except Exception:
            return 1

    def get_has_360(self, obj):
        try:
            if hasattr(obj, 'virtual_tours'):
                return obj.virtual_tours.filter(is_active=True).exists()
            return False
        except Exception:
            return False

    def get_cover_image(self, obj):
        request = self.context.get('request')
        if obj.main_image:
            try:
                url = obj.main_image.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        first_img = obj.images.first()
        if first_img and first_img.image:
            try:
                url = first_img.image.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        return None

    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'title', 'slug', 'price', 'city', 'neighborhood',
            'property_type', 'transaction_type', 'bedrooms', 'bathrooms',
            'area', 'main_image', 'cover_image', 'images_count', 'is_favorite', 'has_360',
            'video_reel', 'reel_description',
            'is_in_discovery', 'is_discovery_featured', 'discovery_priority',
            'discovery_views_count', 'discovery_likes_count', 'discovery_blocked_reason',
            'water_source', 'electricity_type', 'road_access', 'distance_goudron',
            'is_boosted', 'boost_type', 'boost_expires_at',
        ]

class PropertySerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    virtual_tours = VirtualTourSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    similar_properties = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    blocked_dates = serializers.SerializerMethodField()

    def get_blocked_dates(self, obj):
        if obj.transaction_type != 'COURTE_DUREE':
            return []
        import datetime
        from django.utils import timezone
        today = timezone.now().date()
        bookings = obj.short_stay_bookings.filter(
            status__in=['PENDING', 'CONFIRMED'],
            check_out_date__gte=today
        ).values('check_in_date', 'check_out_date')
        
        dates = []
        for b in bookings:
            cur = b['check_in_date']
            end = b['check_out_date']
            while cur < end:
                dates.append(str(cur))
                cur += datetime.timedelta(days=1)
        return sorted(list(set(dates)))

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.properties.models import Favorite
            return Favorite.objects.filter(user=request.user, property=obj).exists()
        return False

    def get_similar_properties(self, obj):
        view = self.context.get('view')
        if view and hasattr(view, 'action') and view.action == 'list':
            return []
        from apps.properties.models import Property, PropertyStatus
        similar = Property.objects.select_related('owner').prefetch_related('images').filter(
            city=obj.city,
            property_type=obj.property_type,
            status=PropertyStatus.PUBLISHED,
            is_published=True
        ).exclude(pk=obj.pk)[:3]
        if not similar.exists():
            similar = Property.objects.select_related('owner').prefetch_related('images').filter(
                status=PropertyStatus.PUBLISHED,
                is_published=True
            ).exclude(pk=obj.pk)[:3]
        return PropertyCardSerializer(similar, many=True, context=self.context).data

    def get_cover_image(self, obj):
        """Retourne l'URL de la première image ou l'image principale"""
        request = self.context.get('request')
        # Essayer main_image d'abord
        if obj.main_image:
            try:
                url = obj.main_image.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                pass
        # Sinon prendre la première image de la galerie
        first_img = obj.images.first()
        if first_img and first_img.image:
            try:
                url = first_img.image.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                pass
        return None

    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'title', 'slug', 'description', 'price',
            'price_negotiable', 'avance_mois', 'caution_mois',
            'city', 'neighborhood', 'address', 'latitude', 'longitude',
            'main_image', 'cover_image',
            'video_reel', 'reel_description', 'property_type', 'transaction_type', 
            'bedrooms', 'bathrooms', 'area', 'status', 'is_published',
            'furnished', 'balcony', 'parking', 'security', 'water', 'electricity',
            'water_source', 'electricity_type', 'road_access', 'distance_goudron',
            'network_quality', 'flood_risk', 'transport_access',
            'created_at', 'updated_at', 'views_count', 'favorites_count',
            'images', 'virtual_tours', 'similar_properties',
            'is_favorite', 'blocked_dates',
            'is_in_discovery', 'is_discovery_featured', 'discovery_priority',
            'discovery_views_count', 'discovery_likes_count', 'discovery_blocked_reason',
            'is_boosted', 'boost_type', 'boost_expires_at',
        ]
        read_only_fields = ['id', 'owner', 'slug', 'created_at', 'updated_at', 'views_count', 'favorites_count', 'discovery_views_count', 'discovery_likes_count']

class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la création et modification (Bailleur) depuis React."""
    description = serializers.CharField(required=False, allow_blank=True, default='')
    avance_mois = serializers.IntegerField(required=False, allow_null=True)
    caution_mois = serializers.IntegerField(required=False, allow_null=True)
    distance_goudron = serializers.IntegerField(required=False, allow_null=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    main_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'property_type', 'transaction_type',
            'price', 'price_negotiable', 'avance_mois', 'caution_mois',
            'address', 'city', 'neighborhood', 'latitude', 'longitude',
            'area', 'bedrooms', 'bathrooms',
            'furnished', 'balcony', 'parking', 'security', 'water', 'electricity',
            'water_source', 'electricity_type', 'road_access', 'distance_goudron',
            'network_quality', 'flood_risk', 'transport_access',
            'main_image', 'video_reel', 'reel_description'
        ]
        read_only_fields = ['id']

    def to_internal_value(self, data):
        # Convertir les chaînes vides des formulaires multipart en None ou valeurs par défaut
        if hasattr(data, 'dict'):
            data = data.dict()
        elif hasattr(data, 'copy'):
            data = data.copy()

        for field in ['latitude', 'longitude', 'avance_mois', 'caution_mois', 'distance_goudron', 'bedrooms', 'bathrooms', 'area', 'price']:
            if field in data and (data[field] == '' or data[field] == 'null' or data[field] == 'undefined'):
                if field in ['latitude', 'longitude', 'avance_mois', 'caution_mois', 'distance_goudron']:
                    data[field] = None
                elif field == 'bedrooms':
                    data[field] = 0
                elif field == 'bathrooms':
                    data[field] = 1

        return super().to_internal_value(data)

    def validate_main_image(self, value):
        if not value:
            return value
        return validate_uploaded_file(
            value, allowed_extensions=IMAGE_EXTENSIONS,
            allowed_mime_types=IMAGE_MIME_TYPES, label='main_image',
        )

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        # Nettoyage automatique des numéros de téléphone pour la sécurité Piolo
        from apps.properties.models import sanitize_contact_info
        if attrs.get('title'):
            attrs['title'] = sanitize_contact_info(attrs['title'])
        if attrs.get('description'):
            attrs['description'] = sanitize_contact_info(attrs['description'])

        price = attrs.get('price', getattr(instance, 'price', 0))
        area = attrs.get('area', getattr(instance, 'area', 0))
        if price is None or price < 5000:
            raise serializers.ValidationError({'price': 'Prix minimum : 5 000 FCFA.'})
        if area is None or area < 5:
            raise serializers.ValidationError({'area': 'Surface minimale : 5 m².'})
        if not instance and not attrs.get('main_image'):
            raise serializers.ValidationError({'main_image': 'Image principale requise.'})
        return attrs


class RentEstimateSerializer(serializers.Serializer):
    """Serializer d'entrée pour l'estimation de loyer IA Piolo."""
    city = serializers.CharField(required=False, default='Yaoundé')
    neighborhood = serializers.CharField(required=False, default='Bastos')
    property_type = serializers.CharField(required=False, default='APPARTEMENT')
    surface = serializers.FloatField(required=False, default=60.0)
    area = serializers.FloatField(required=False)
    bedrooms = serializers.IntegerField(required=False, default=2)
    bathrooms = serializers.IntegerField(required=False, default=1)
    floors = serializers.IntegerField(required=False, default=1)
    standing = serializers.CharField(required=False, default='Standard')
    furnished = serializers.BooleanField(required=False, default=False)
    has_forage = serializers.BooleanField(required=False, default=False)
    water_source = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    has_generator = serializers.BooleanField(required=False, default=False)
    electricity_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    has_security = serializers.BooleanField(required=False, default=False)
    security = serializers.BooleanField(required=False, default=False)
    has_parking = serializers.BooleanField(required=False, default=False)
    parking = serializers.BooleanField(required=False, default=False)
    has_balcony = serializers.BooleanField(required=False, default=False)
    balcony = serializers.BooleanField(required=False, default=False)
    distance_goudron = serializers.IntegerField(required=False, default=100)
    road_access = serializers.CharField(required=False, default='PISTE_PROCHE')


class ConciergeMandateSerializer(serializers.ModelSerializer):
    class Meta:
        from apps.properties.models import ConciergeMandate
        model = ConciergeMandate
        fields = '__all__'
        read_only_fields = ['id', 'landlord', 'created_at', 'updated_at']

