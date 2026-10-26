# apps/accounts/forms.py
"""
Formulaires Django pour l'authentification Piolo.

Note : Ces formulaires sont disponibles pour un usage côté serveur
(admin, tests, vues traditionnelles). Les écrans SPA dans auth.html
utilisent des endpoints JSON (views.py) sans ces formulaires.
"""

from django import forms
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError

from .models import AccountStatus, BailleurDossier, CustomUser, DossierStatus, UserRole

User = get_user_model()


# ─── INSCRIPTION STANDARD ─────────────────────────────────────────────────────

class RegisterForm(UserCreationForm):
    """Formulaire d'inscription standard (Locataire / Architecte)."""

    first_name = forms.CharField(
        max_length = 80,
        label      = "Prénom",
        widget     = forms.TextInput(attrs={'class': 'field-input', 'placeholder': 'Jean'}),
    )
    last_name = forms.CharField(
        max_length = 80,
        label      = "Nom",
        widget     = forms.TextInput(attrs={'class': 'field-input', 'placeholder': 'Kamdem'}),
    )
    email = forms.EmailField(
        label  = "Adresse email",
        widget = forms.EmailInput(attrs={'class': 'field-input', 'placeholder': 'jean@email.com'}),
    )
    phone = forms.CharField(
        max_length = 20,
        required   = False,
        label      = "Téléphone",
        widget     = forms.TextInput(attrs={'class': 'field-input', 'placeholder': '+237 6XX XXX XXX'}),
    )
    role = forms.ChoiceField(
        choices = [
            (UserRole.LOCATAIRE,  UserRole.LOCATAIRE.label),
            (UserRole.ARCHITECTE, UserRole.ARCHITECTE.label),
        ],
        initial = UserRole.LOCATAIRE,
        label   = "Je suis un",
        widget  = forms.Select(attrs={'class': 'field-select'}),
    )

    class Meta:
        model  = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone', 'role', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({
            'class': 'field-input', 'placeholder': 'Min. 8 caractères',
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'field-input', 'placeholder': 'Confirmer le mot de passe',
        })
        # Supprimer le champ username hérité (non utilisé sur CustomUser)
        self.fields.pop('username', None)

    def clean_email(self):
        email = self.cleaned_data['email'].strip().lower()
        if User.objects.filter(email=email).exists():
            raise ValidationError("Un compte existe déjà avec cette adresse email.")
        return email

    def clean_role(self):
        role = self.cleaned_data['role']
        if role == UserRole.BAILLEUR:
            raise ValidationError(
                "Les bailleurs doivent utiliser la procédure d'inscription dédiée."
            )
        return role

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role   = self.cleaned_data['role']
        user.phone  = self.cleaned_data.get('phone', '')
        user.status = AccountStatus.ACTIVE
        if commit:
            user.save()
        return user


# ─── CONNEXION ────────────────────────────────────────────────────────────────

class LoginForm(AuthenticationForm):
    """Formulaire de connexion — authentification par email."""

    username = forms.EmailField(
        label  = "Adresse email",
        widget = forms.EmailInput(attrs={
            'class':        'field-input',
            'id':           'l-email',
            'placeholder':  'votre@email.com',
            'autocomplete': 'email',
        }),
    )
    password = forms.CharField(
        label  = "Mot de passe",
        widget = forms.PasswordInput(attrs={
            'class':        'field-input',
            'id':           'l-pwd',
            'placeholder':  '••••••••',
            'autocomplete': 'current-password',
        }),
    )

    def confirm_login_allowed(self, user):
        """Vérifications supplémentaires avant connexion."""
        if not user.is_active:
            raise ValidationError("Ce compte est désactivé.")

        if user.status == AccountStatus.BLOCKED:
            raise ValidationError(
                "Ce compte est bloqué définitivement. Contactez le support."
            )

        if user.status == AccountStatus.SUSPENDED:
            raise ValidationError(
                "Ce compte est temporairement suspendu. Contactez le support."
            )

        # Bailleur en attente : on autorise la connexion mais on redirige
        # vers la page d'attente (géré dans la vue, pas ici).


# ─── INSCRIPTION BAILLEUR — ÉTAPE 1 ──────────────────────────────────────────

class BailleurRegisterForm(forms.ModelForm):
    """
    Formulaire d'inscription bailleur, étape 1 : identité.
    Utilisé pour validation côté serveur (les données arrivent en JSON via views.py).
    """

    password = forms.CharField(
        label  = "Mot de passe",
        widget = forms.PasswordInput(attrs={
            'class': 'field-input', 'placeholder': 'Min. 8 caractères',
        }),
        help_text = password_validation.password_validators_help_text_html(),
    )

    class Meta:
        model  = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone']
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': 'Marie-Claire',
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': 'Nkemdirim',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'field-input', 'placeholder': 'marie@email.com',
            }),
            'phone': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': '+237 6XX XXX XXX',
            }),
        }

    def clean_email(self):
        email = self.cleaned_data['email'].strip().lower()
        if User.objects.filter(email=email).exists():
            raise ValidationError("Un compte existe déjà avec cet email.")
        return email

    def clean_password(self):
        password = self.cleaned_data.get('password', '')
        if len(password) < 8:
            raise ValidationError("Le mot de passe doit faire au moins 8 caractères.")
        return password

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role      = UserRole.BAILLEUR
        user.status    = AccountStatus.PENDING
        user.is_active = False   # Inactif jusqu'à approbation admin
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


# ─── DOSSIER KYC BAILLEUR ────────────────────────────────────────────────────

class BailleurDossierForm(forms.ModelForm):
    """
    Formulaire de soumission du dossier KYC bailleur (étapes 3 à 5).
    Gère les fichiers (CNI, selfie) et les informations patrimoine.
    """

    class Meta:
        model  = BailleurDossier
        fields = [
            'document_type', 'document_number',
            'cni_recto', 'cni_verso', 'selfie',
            'city', 'neighborhoods',
            'property_count', 'property_types', 'description',
        ]
        widgets = {
            'document_type': forms.Select(attrs={'class': 'field-select'}),
            'document_number': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': 'CM-12345678-A',
            }),
            'city': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': 'Yaoundé',
            }),
            'neighborhoods': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': 'Bastos, Bonapriso, Bonamoussadi…',
            }),
            'property_count': forms.NumberInput(attrs={
                'class': 'field-input', 'min': '1', 'max': '500',
            }),
            'property_types': forms.TextInput(attrs={
                'class': 'field-input', 'placeholder': 'Appartements, Villas…',
            }),
            'description': forms.Textarea(attrs={
                'class': 'field-textarea', 'rows': 3,
                'placeholder': 'Décrivez votre patrimoine…',
            }),
        }

    def clean_cni_recto(self):
        return self._clean_kyc_file(self.cleaned_data.get('cni_recto'), 'CNI recto')

    def clean_cni_verso(self):
        return self._clean_kyc_file(self.cleaned_data.get('cni_verso'), 'CNI verso')

    def clean_selfie(self):
        return self._clean_kyc_file(self.cleaned_data.get('selfie'), 'Selfie')

    @staticmethod
    def _clean_kyc_file(f, label):
        """Valide taille (5 Mo max) et extension (jpg/png/pdf)."""
        import os
        from django.conf import settings

        if not f:
            raise ValidationError(f"{label} est obligatoire.")

        max_size = getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 5 * 1024 * 1024)
        allowed  = getattr(settings, 'KYC_ALLOWED_EXTENSIONS', ['.jpg', '.jpeg', '.png', '.pdf'])

        if f.size > max_size:
            raise ValidationError(f"{label} : fichier trop volumineux (max 5 Mo).")

        ext = os.path.splitext(f.name)[1].lower()
        if ext not in allowed:
            raise ValidationError(f"{label} : format non autorisé (JPG, PNG ou PDF).")

        return f

    def clean(self):
        cleaned = super().clean()
        if not cleaned.get('property_types', '').strip():
            self.add_error('property_types', "Indiquez au moins un type de bien.")
        if not cleaned.get('city', '').strip():
            self.add_error('city', "La ville est obligatoire.")
        return cleaned