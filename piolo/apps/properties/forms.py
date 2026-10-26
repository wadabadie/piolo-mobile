# apps/properties/forms.py

from django import forms
from .models import Property

class PropertyCreateForm(forms.ModelForm):
    """
    Formulaire de création d'annonce.
    Configure les champs et les widgets pour correspondre au design HTML.
    """
    class Meta:
        model = Property
        fields = [
            'title', 'description', 'transaction_type', 'property_type',
            'price', 'price_negotiable', 
            'avance_mois', 'caution_mois',
            'address', 'city', 'neighborhood',
            'latitude', 'longitude', 
            'area', 'bedrooms', 'bathrooms',
            'furnished', 'balcony', 'parking', 'security', 'water', 'electricity',
            'main_image'
        ]
        
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Ex: Appartement 3 chambres meublé à Bastos'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-textarea', 
                'rows': 4, 
                'placeholder': 'Décrivez votre bien : état, équipements, environnement...'
            }),
            'transaction_type': forms.Select(attrs={'class': 'form-select'}),
            'property_type': forms.Select(attrs={'class': 'form-select'}),
            
            'price': forms.NumberInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Ex: 150000'
            }),
            'avance_mois': forms.NumberInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Ex: 6'
            }),
            'caution_mois': forms.NumberInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Ex: 2'
            }),
            
            'address': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Rue, quartier, référence...'
            }),
            'city': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Yaoundé, Douala...'
            }),
            'neighborhood': forms.TextInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Bastos, Bonapriso...'
            }),
            
            # Champs cachés pour la géolocalisation
            'latitude': forms.HiddenInput(),
            'longitude': forms.HiddenInput(),
            
            'area': forms.NumberInput(attrs={
                'class': 'form-input', 
                'placeholder': 'Surface en m²'
            }),
            'bedrooms': forms.NumberInput(attrs={
                'class': 'form-input', 
                'value': '0'
            }),
            'bathrooms': forms.NumberInput(attrs={
                'class': 'form-input', 
                'value': '1'
            }),
        }