from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    is_bailleur  = serializers.BooleanField(read_only=True)
    is_locataire = serializers.BooleanField(read_only=True)
    is_architecte = serializers.BooleanField(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            url = request.build_absolute_uri(obj.avatar.url)
            # Évite qu’un navigateur conserve l’ancienne image lorsqu’un
            # fichier est remplacé en conservant le même nom.
            try:
                version = int(obj.avatar.storage.get_modified_time(obj.avatar.name).timestamp())
                return f'{url}?v={version}'
            except Exception:
                return url
        return None

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'phone', 'avatar', 'avatar_url', 'city', 'points',
            'verification_level', 'status', 'date_joined',
            'is_bailleur', 'is_locataire', 'is_architecte',
            'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'email', 'points', 'verification_level', 'status', 'date_joined']


class UserPublicSerializer(serializers.ModelSerializer):
    """
    Serializer public sécurisé pour annonces et profils visibles aux tiers.
    Masque l'email, le numéro de téléphone direct, les points et les drapeaux admin.
    """
    avatar_url = serializers.SerializerMethodField()
    is_bailleur = serializers.BooleanField(read_only=True)
    is_bailleur_active = serializers.BooleanField(read_only=True)

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            try:
                url = request.build_absolute_uri(obj.avatar.url)
                version = int(obj.avatar.storage.get_modified_time(obj.avatar.name).timestamp())
                return f'{url}?v={version}'
            except Exception:
                try:
                    return request.build_absolute_uri(obj.avatar.url)
                except Exception:
                    pass
        return None

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'avatar', 'avatar_url',
            'city', 'verification_level', 'is_bailleur', 'is_bailleur_active'
        ]
        read_only_fields = fields


from django.db import transaction
from apps.core.file_validation import (
    validate_uploaded_file,
    verify_image_integrity,
    sanitize_and_optimize_image,
    DOCUMENT_EXTENSIONS,
    DOCUMENT_MIME_TYPES
)
from ..models import BailleurDossier, DossierStatus, ProfessionalProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    # Champs facultatifs spécifiques au tunnel bailleur (KYC & Patrimoine)
    document_type   = serializers.CharField(required=False, allow_blank=True, write_only=True)
    document_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    city            = serializers.CharField(required=False, allow_blank=True, write_only=True)
    neighborhoods   = serializers.CharField(required=False, allow_blank=True, write_only=True)
    property_count  = serializers.IntegerField(required=False, default=1, write_only=True)
    property_types  = serializers.CharField(required=False, allow_blank=True, write_only=True)
    description     = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cni_recto       = serializers.FileField(required=False, allow_null=True, write_only=True)
    cni_verso       = serializers.FileField(required=False, allow_null=True, write_only=True)
    selfie          = serializers.FileField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'role', 'phone',
            'document_type', 'document_number', 'city', 'neighborhoods',
            'property_count', 'property_types', 'description',
            'cni_recto', 'cni_verso', 'selfie',
        ]

    def create(self, validated_data):
        # Extraire les champs spécifiques au bailleur / KYC
        document_type   = validated_data.pop('document_type', 'CNI') or 'CNI'
        document_number = validated_data.pop('document_number', '') or ''
        city            = validated_data.pop('city', '') or ''
        neighborhoods   = validated_data.pop('neighborhoods', '') or ''
        property_count  = validated_data.pop('property_count', 1) or 1
        property_types  = validated_data.pop('property_types', '') or ''
        description     = validated_data.pop('description', '') or ''
        cni_recto       = validated_data.pop('cni_recto', None)
        cni_verso       = validated_data.pop('cni_verso', None)
        selfie          = validated_data.pop('selfie', None)

        # Validation sécurisée des fichiers KYC si fournis
        validated_files = {}
        for key, label, f in [('cni_recto', 'CNI recto', cni_recto),
                              ('cni_verso', 'CNI verso', cni_verso),
                              ('selfie', 'Selfie', selfie)]:
            if f:
                try:
                    validate_uploaded_file(
                        f,
                        allowed_extensions=DOCUMENT_EXTENSIONS,
                        allowed_mime_types=DOCUMENT_MIME_TYPES,
                        label=label
                    )
                    verify_image_integrity(f, label=label)
                    validated_files[key] = sanitize_and_optimize_image(f)
                except Exception as exc:
                    raise serializers.ValidationError({key: str(exc)})
            else:
                validated_files[key] = None

        cni_recto = validated_files['cni_recto']
        cni_verso = validated_files['cni_verso']
        selfie    = validated_files['selfie']

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=validated_data.get('role', 'LOCATAIRE'),
                phone=validated_data.get('phone', ''),
                city=city if city else ''
            )

            if user.role == 'ARCHITECTE':
                ProfessionalProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'business_name': f"{user.first_name} {user.last_name}".strip() or "Mon Entreprise Pro",
                        'city': user.city or "Yaoundé",
                        'phone': user.phone or "",
                        'whatsapp': user.phone or ""
                    }
                )
            elif user.role == 'BAILLEUR':
                # Si verso ou selfie absent mais recto présent, fallback de confort
                if cni_recto and not cni_verso:
                    cni_verso = cni_recto
                if cni_recto and not selfie:
                    selfie = cni_recto

                BailleurDossier.objects.create(
                    user=user,
                    document_type=document_type,
                    document_number=document_number,
                    cni_recto=cni_recto or '',
                    cni_verso=cni_verso or '',
                    selfie=selfie or '',
                    city=city or user.city or 'Yaoundé',
                    neighborhoods=neighborhoods,
                    property_count=property_count,
                    property_types=property_types,
                    description=description,
                    status=DossierStatus.PENDING,
                )

        return user
