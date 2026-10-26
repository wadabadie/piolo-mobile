# apps/properties/serializers.py
from rest_framework import serializers
from .models import Property

class PropertySerializer(serializers.ModelSerializer):
    """
    Serializer pour convertir le modèle Property en JSON
    """
    # Personnalisation de l'affichage du type de bien (ex: 'apartment' -> 'Appartement')
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    # Informations sur le propriétaire
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Property
        # Champs à inclure dans l'API
        fields = [
            'id', 'title', 'slug', 'description', 
            'property_type', 'property_type_display', 
            'transaction_type', 'transaction_type_display',
            'address', 'city', 'neighborhood', 'latitude', 'longitude',
            'price', 'area', 'bedrooms', 'bathrooms',
            'main_image', 'is_published', 'created_at',
            'owner', 'owner_name'
        ]
        read_only_fields = ['slug', 'created_at', 'owner']